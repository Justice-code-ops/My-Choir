import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import { Attendance } from "../models/Attendance.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { getDueMonths, calculateBalance } from "../services/paymentService.js";
import { recordAudit } from "../services/auditService.js";

export const getProfile = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id }).populate("user");
  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  res.json({
    success: true,
    data: member
  });
});

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id).populate("user", "email role status");
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  res.json({
    success: true,
    data: member
  });
});

export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, voicePart, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (voicePart) filter.voicePart = voicePart;

  if (search) {
    filter.$text = { $search: search };
  }

  const total = await Member.countDocuments(filter);
  const members = await Member.find(filter)
    .populate("user", "email role status")
    .populate("approval.reviewedBy", "email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: members,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const searchMembers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  const members = await Member.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: members
  });
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  // Only admin or the member themselves can update
  if (req.user.role !== "admin" && req.user.role !== "super-admin" && req.user._id.toString() !== member.user.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const allowedFields = [
    "phone",
    "address",
    "occupation",
    "nextOfKin",
    "instrument",
    "emergencyNotes",
    "dateJoinedChurch"
  ];

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      member[key] = req.body[key];
    }
  });

  await member.save();

  // Record audit
  await recordAudit(req, "MEMBER_UPDATED", "Member", member._id, {
    fields: Object.keys(req.body).filter((k) => allowedFields.includes(k))
  });

  res.json({
    success: true,
    message: "Member updated successfully",
    data: member
  });
});

export const getMemberStats = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  // Get payment stats
  const dueMonths = getDueMonths(member);
  const payments = await Payment.find({ member: member._id });
  const paidMonths = payments.filter((p) => p.status === "paid").length;
  const balance = await calculateBalance(member);

  // Get attendance stats
  const attendanceRecords = await Attendance.find({ member: member._id });
  const present = attendanceRecords.filter((a) => a.status === "present").length;
  const late = attendanceRecords.filter((a) => a.status === "late").length;
  const absent = attendanceRecords.filter((a) => a.status === "absent").length;

  res.json({
    success: true,
    data: {
      memberInfo: {
        id: member._id,
        name: member.fullName,
        voicePart: member.voicePart,
        status: member.status
      },
      payments: {
        dueMonths: dueMonths.length,
        paidMonths,
        unpaidMonths: dueMonths.length - paidMonths,
        balance
      },
      attendance: {
        total: attendanceRecords.length,
        present,
        late,
        absent,
        attendanceRate: attendanceRecords.length > 0 ? (present / attendanceRecords.length * 100).toFixed(2) + "%" : "0%"
      }
    }
  });
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  // Delete associated user account
  await User.deleteOne({ _id: member.user });

  // Record audit
  await recordAudit(req, "MEMBER_DELETED", "Member", member._id, {
    name: member.fullName
  });

  res.json({
    success: true,
    message: "Member deleted successfully"
  });
});

export const restoreMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.status === "suspended") {
    member.status = "approved";
    await member.save();

    // Record audit
    await recordAudit(req, "MEMBER_RESTORED", "Member", member._id, {});

    res.json({
      success: true,
      message: "Member restored successfully",
      data: member
    });
  } else {
    throw new ApiError(400, "Member is not suspended");
  }
});
