import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { Attendance } from "../models/Attendance.js";
import { Event } from "../models/Event.js";
import { AuditLog } from "../models/AuditLog.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MEMBER_STATUSES, ROLES } from "../constants/index.js";
import { recordAudit } from "../services/auditService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  // Member stats
  const totalMembers = await Member.countDocuments({ status: MEMBER_STATUSES.APPROVED });
  const pendingApprovals = await Member.countDocuments({ status: MEMBER_STATUSES.PENDING });
  const rejectedMembers = await Member.countDocuments({ status: MEMBER_STATUSES.REJECTED });

  // Payment stats
  const thisMonth = new Date();
  const thisMonthPayments = await Payment.countDocuments({
    status: "paid",
    paidAt: {
      $gte: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1),
      $lte: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0)
    }
  });

  const totalCollected = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const outstandingPayments = await Payment.aggregate([
    { $match: { status: "pending" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  // Attendance stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayAttendance = await Attendance.countDocuments({
    checkedInAt: { $gte: todayStart }
  });
  const totalAttendance = await Attendance.countDocuments();
  const attendedRecords = await Attendance.countDocuments({
    status: { $in: ["present", "late"] }
  });
  const averageAttendance = totalAttendance > 0
    ? Number(((attendedRecords / totalAttendance) * 100).toFixed(2))
    : 0;

  // Voice distribution
  const voiceDistribution = await Member.aggregate([
    { $match: { status: MEMBER_STATUSES.APPROVED } },
    { $group: { _id: "$voicePart", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      members: {
        total: totalMembers,
        pending: pendingApprovals,
        rejected: rejectedMembers
      },
      payments: {
        collectedThisMonth: thisMonthPayments,
        totalCollected: totalCollected[0]?.total || 0
      },
      attendance: {
        todayCheckIns: todayAttendance
      },
      voiceDistribution: Object.fromEntries(
        voiceDistribution.map((v) => [v._id, v.count])
      ),
      totalMembers,
      approvedMembers: totalMembers,
      pendingApprovals,
      rejectedMembers,
      outstandingPayments: outstandingPayments[0]?.total || 0,
      monthlyRevenue: totalCollected[0]?.total || 0,
      averageAttendance
    }
  });
});

export const getMemberStats = asyncHandler(async (req, res) => {
  const members = await Member.find({ status: MEMBER_STATUSES.APPROVED }).select(
    "fullName voicePart gender status createdAt dateJoinedChoir"
  );

  const stats = {
    total: members.length,
    byVoice: {},
    byGender: {},
    joinedThisMonth: 0,
    joinedThisYear: 0
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  members.forEach((member) => {
    // By voice
    stats.byVoice[member.voicePart] = (stats.byVoice[member.voicePart] || 0) + 1;

    // By gender
    stats.byGender[member.gender] = (stats.byGender[member.gender] || 0) + 1;

    // Joined this month/year
    if (member.dateJoinedChoir) {
      if (member.dateJoinedChoir >= thisMonthStart) stats.joinedThisMonth++;
      if (member.dateJoinedChoir >= thisYearStart) stats.joinedThisYear++;
    }
  });

  res.json({
    success: true,
    data: stats
  });
});

export const getFinancialStats = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const selectedYear = parseInt(year) || new Date().getFullYear();

  const monthlyData = [];

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(selectedYear, month - 1, 1);
    const endDate = new Date(selectedYear, month, 0, 23, 59, 59);

    const paid = await Payment.countDocuments({
      status: "paid",
      paidAt: { $gte: startDate, $lte: endDate }
    });

    const collected = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    monthlyData.push({
      month: new Date(selectedYear, month - 1).toLocaleDateString("en-US", { month: "short" }),
      paymentsRecorded: paid,
      amountCollected: collected[0]?.total || 0
    });
  }

  const outstanding = await Payment.countDocuments({ status: "pending" });

  res.json({
    success: true,
    data: {
      year: selectedYear,
      monthly: monthlyData,
      outstanding
    }
  });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, entity, action } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (entity) filter.entity = entity;
  if (action) filter.action = action;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate("actor", "email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const choirPost = typeof req.body.choirPost === "string" ? req.body.choirPost.trim() : "";

  if (![ROLES.MEMBER, ROLES.ADMIN].includes(role)) {
    throw new ApiError(400, "Role must be member or admin");
  }

  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "Another admin must change your access level");
  }

  const user = await User.findById(userId).populate("member");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super admin access cannot be changed here");
  }

  if (role === ROLES.ADMIN && user.status !== MEMBER_STATUSES.APPROVED) {
    throw new ApiError(400, "Only approved members can be made admins");
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  if (user.member) {
    if (choirPost || role === ROLES.ADMIN) {
      user.member.choirPost = choirPost || user.member.choirPost || "Choir Administrator";
      await user.member.save();
    }
  }

  await user.populate("member");
  await recordAudit(req, "USER_ROLE_UPDATED", "User", user._id, {
    previousRole,
    nextRole: role,
    choirPost: user.member?.choirPost
  });

  res.json({
    success: true,
    message: role === ROLES.ADMIN ? "Member is now an admin" : "User role updated",
    data: {
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      member: user.member
    }
  });
});

export const exportMemberList = asyncHandler(async (req, res) => {
  const members = await Member.find({ status: MEMBER_STATUSES.APPROVED })
    .select("fullName email phone voicePart choirPost choirId dateJoinedChoir")
    .sort({ fullName: 1 });

  // Format as CSV
  const headers = ["Full Name", "Email", "Phone", "Voice Part", "Official Post", "Choir ID", "Date Joined"];
  const rows = members.map((m) => [
    m.fullName,
    m.email,
    m.phone,
    m.voicePart,
    m.choirPost || "Choir Member",
    m.choirId,
    m.dateJoinedChoir ? m.dateJoinedChoir.toISOString().split("T")[0] : ""
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="member-list.csv"');
  res.send(csv);
});
