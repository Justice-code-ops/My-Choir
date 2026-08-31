import { Attendance } from "../models/Attendance.js";
import { Member } from "../models/Member.js";
import { Event } from "../models/Event.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { recordAudit } from "../services/auditService.js";

const generateAttendanceCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const canManageAttendance = (user) => ["admin", "super-admin"].includes(user.role);

const assertCanAccessMember = (req, member) => {
  if (canManageAttendance(req.user)) return;
  if (req.user._id.toString() === member.user.toString()) return;
  throw new ApiError(403, "You do not have permission to access this attendance record");
};

export const checkIn = asyncHandler(async (req, res) => {
  const { memberId, eventId, code, mode = "manual" } = req.body;

  if (!memberId) {
    throw new ApiError(400, "memberId is required");
  }

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  // If mode is "code", verify attendance code
  if (mode === "code" && code) {
    const event = await Event.findOne({ attendanceCode: code });
    if (!event) {
      throw new ApiError(400, "Invalid attendance code");
    }
  }

  // Calculate if late (more than 5 minutes after event start)
  let status = "present";
  let minutesLate = 0;

  if (eventId) {
    const event = await Event.findById(eventId);
    if (event && event.startsAt) {
      const now = new Date();
      const diff = Math.floor((now - event.startsAt) / (1000 * 60));
      if (diff > 5) {
        status = "late";
        minutesLate = diff;
      }
    }
  }

  // Check if already checked in today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingCheckIn = await Attendance.findOne({
    member: memberId,
    checkedInAt: { $gte: todayStart }
  });

  if (existingCheckIn) {
    throw new ApiError(400, "Already checked in today");
  }

  const attendance = await Attendance.create({
    member: memberId,
    event: eventId || null,
    attendanceCode: code || generateAttendanceCode(),
    mode,
    status,
    checkedInAt: new Date(),
    minutesLate,
    recordedBy: req.user._id
  });

  // Record audit
  await recordAudit(req, "ATTENDANCE_RECORDED", "Attendance", attendance._id, {
    mode,
    status
  });

  res.status(201).json({
    success: true,
    message: `Check-in recorded as ${status}`,
    data: attendance
  });
});

export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { page, limit, skip } = getPagination(req.query);
  const { status, month, year } = req.query;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  const filter = { member: memberId };

  if (status) {
    filter.status = status;
  }

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filter.checkedInAt = { $gte: startDate, $lte: endDate };
  }

  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .populate("member", "fullName voicePart")
    .populate("event", "title startsAt")
    .sort({ checkedInAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: records,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { year } = req.query;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  const filter = { member: memberId };

  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    filter.checkedInAt = { $gte: startDate, $lte: endDate };
  }

  const records = await Attendance.find(filter);
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const excused = records.filter((r) => r.status === "excused").length;

  const attendanceRate = records.length > 0 ? ((present + late) / records.length * 100).toFixed(2) : 0;

  res.json({
    success: true,
    data: {
      total: records.length,
      present,
      late,
      absent,
      excused,
      attendanceRate: `${attendanceRate}%`
    }
  });
});

export const generateAttendanceReport = asyncHandler(async (req, res) => {
  const { year, month, voicePart } = req.query;

  const filter = {};

  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filter.checkedInAt = { $gte: startDate, $lte: endDate };
  }

  let records = await Attendance.find(filter)
    .populate({
      path: "member",
      select: "fullName voicePart",
      match: voicePart ? { voicePart } : {}
    })
    .sort({ checkedInAt: -1 });

  // Filter out nulls from populate
  records = records.filter((r) => r.member !== null);

  // Group by voice part
  const byVoicePart = {};
  records.forEach((record) => {
    const part = record.member.voicePart;
    if (!byVoicePart[part]) {
      byVoicePart[part] = { present: 0, late: 0, absent: 0, excused: 0 };
    }
    byVoicePart[part][record.status] = (byVoicePart[part][record.status] || 0) + 1;
  });

  const totalPresent = records.filter((r) => r.status === "present").length;
  const totalLate = records.filter((r) => r.status === "late").length;
  const totalAbsent = records.filter((r) => r.status === "absent").length;
  const totalExcused = records.filter((r) => r.status === "excused").length;

  res.json({
    success: true,
    data: {
      period: month && year ? `${month}/${year}` : "All time",
      totals: {
        present: totalPresent,
        late: totalLate,
        absent: totalAbsent,
        excused: totalExcused,
        total: records.length
      },
      byVoicePart,
      records: records.length > 0 ? records : []
    }
  });
});

export const recordAttendance = asyncHandler(async (req, res) => {
  const { memberId, eventId, status, notes, checkedInAt } = req.body;

  if (!memberId || !status) {
    throw new ApiError(400, "memberId and status are required");
  }

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const attendanceDate = checkedInAt ? new Date(checkedInAt) : new Date();
  if (Number.isNaN(attendanceDate.getTime())) {
    throw new ApiError(400, "checkedInAt must be a valid date");
  }

  const payload = {
    status,
    checkedInAt: attendanceDate,
    mode: "manual",
    recordedBy: req.user._id,
    notes
  };

  let attendance;
  if (eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    attendance = await Attendance.findOneAndUpdate(
      { member: memberId, event: eventId },
      {
        ...payload,
        member: memberId,
        event: eventId,
        expectedAt: event.startsAt,
        minutesLate: status === "late" ? Math.max(Math.floor((attendanceDate - event.startsAt) / (1000 * 60)), 0) : 0
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } else {
    attendance = await Attendance.create({
      member: memberId,
      ...payload
    });
  }

  // Record audit
  await recordAudit(req, "ATTENDANCE_RECORDED_MANUAL", "Attendance", attendance._id, {
    memberId,
    status
  });

  res.status(201).json({
    success: true,
    message: eventId ? "Attendance saved for the selected event" : "Attendance recorded",
    data: attendance
  });
});
