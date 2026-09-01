import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { generateChoirId } from "../utils/idGenerator.js";
import { recordAudit } from "../services/auditService.js";
import { MEMBER_STATUSES } from "../constants/index.js";

export const getPendingApprovals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const filter = { status: status || MEMBER_STATUSES.PENDING };

  const total = await Member.countDocuments(filter);
  const members = await Member.find(filter)
    .populate("user", "email createdAt")
    .sort({ createdAt: 1 })
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

export const approveMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.status === MEMBER_STATUSES.APPROVED) {
    throw new ApiError(400, "Member is already approved");
  }

  // Generate choir ID if not already generated
  if (!member.choirId) {
    member.choirId = generateChoirId();
  }

  // Set approval details
  member.status = MEMBER_STATUSES.APPROVED;
  member.approval = {
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    note: req.body.note || "Approved"
  };

  // Set ID card expiry (1 year from now)
  member.idCard = {
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    signatureLabel: req.body.signatureLabel || "Choir Secretary"
  };

  await member.save();

  // Update user status
  const user = await User.findById(member.user);
  user.status = MEMBER_STATUSES.APPROVED;
  await user.save();

  // Create notification
  await Notification.create({
    recipient: user._id,
    audience: "single",
    title: "Registration Approved",
    message: `Congratulations! Your registration has been approved. Your choir ID is ${member.choirId}. You can now log in to your account.`,
    type: "approval",
    actionUrl: "/auth/login"
  });

  // Record audit
  await recordAudit(req, "MEMBER_APPROVED", "Member", member._id, {
    choirId: member.choirId,
    note: req.body.note
  });

  res.json({
    success: true,
    message: "Member approved successfully",
    data: member
  });
});

export const rejectMember = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.status === MEMBER_STATUSES.REJECTED) {
    throw new ApiError(400, "Member is already rejected");
  }

  member.status = MEMBER_STATUSES.REJECTED;
  member.approval = {
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    note: reason
  };

  await member.save();

  // Update user status
  const user = await User.findById(member.user);
  user.status = MEMBER_STATUSES.REJECTED;
  await user.save();

  // Create notification
  await Notification.create({
    recipient: user._id,
    audience: "single",
    title: "Registration Rejected",
    message: `Your registration has been rejected. Reason: ${reason}. Please contact us for more information.`,
    type: "approval"
  });

  // Record audit
  await recordAudit(req, "MEMBER_REJECTED", "Member", member._id, {
    reason
  });

  res.json({
    success: true,
    message: "Member rejected",
    data: member
  });
});

export const requestCorrection = asyncHandler(async (req, res) => {
  const { requiredCorrections } = req.body;

  if (!requiredCorrections) {
    throw new ApiError(400, "Required corrections must be specified");
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  member.status = MEMBER_STATUSES.CORRECTION;
  member.approval = {
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    note: requiredCorrections
  };

  await member.save();

  // Update user status
  const user = await User.findById(member.user);
  user.status = MEMBER_STATUSES.CORRECTION;
  await user.save();

  // Create notification
  await Notification.create({
    recipient: user._id,
    audience: "single",
    title: "Registration Requires Correction",
    message: `Your registration requires the following corrections:\n${requiredCorrections}\n\nPlease update your profile and resubmit for approval.`,
    type: "approval",
    actionUrl: "/member/profile"
  });

  // Record audit
  await recordAudit(req, "MEMBER_CORRECTION_REQUESTED", "Member", member._id, {
    requiredCorrections
  });

  res.json({
    success: true,
    message: "Correction request sent",
    data: member
  });
});

export const getApprovalStats = asyncHandler(async (req, res) => {
  const stats = {
    pending: await Member.countDocuments({ status: MEMBER_STATUSES.PENDING }),
    approved: await Member.countDocuments({ status: MEMBER_STATUSES.APPROVED }),
    rejected: await Member.countDocuments({ status: MEMBER_STATUSES.REJECTED }),
    correction: await Member.countDocuments({ status: MEMBER_STATUSES.CORRECTION }),
    suspended: await Member.countDocuments({ status: MEMBER_STATUSES.SUSPENDED })
  };

  res.json({
    success: true,
    data: stats
  });
});
