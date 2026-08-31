import { Member } from "../models/Member.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildIdCardPayload } from "../services/idCardService.js";

const canManageIdCards = (user) => ["admin", "super-admin"].includes(user.role);

const assertCanAccessMember = (req, member) => {
  if (canManageIdCards(req.user)) return;
  if (req.user._id.toString() === member.user.toString()) return;
  throw new ApiError(403, "You do not have permission to access this ID card");
};

export const generateIDCard = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  if (member.status !== "approved") {
    throw new ApiError(403, "Only approved members can generate ID cards");
  }

  const idCardPayload = await buildIdCardPayload(member);

  res.json({
    success: true,
    message: "ID card generated",
    data: idCardPayload
  });
});

export const verifyIDCard = asyncHandler(async (req, res) => {
  const { choirId } = req.params;

  const member = await Member.findOne({ choirId });
  if (!member) {
    throw new ApiError(404, "ID not found");
  }

  if (member.status !== "approved") {
    throw new ApiError(403, "This ID is not valid");
  }

  // Check if ID card has expired
  if (member.idCard && member.idCard.expiresAt) {
    if (new Date() > member.idCard.expiresAt) {
      return res.json({
        success: false,
        message: "ID card has expired",
        data: {
          isValid: false,
          name: member.fullName,
          choirId: member.choirId,
          photo: member.profilePicture?.url || null,
          voicePart: member.voicePart,
          status: "expired"
        }
      });
    }
  }

  res.json({
    success: true,
    message: "ID verified",
    data: {
      isValid: true,
      name: member.fullName,
      choirId: member.choirId,
      photo: member.profilePicture?.url || null,
      voicePart: member.voicePart,
      status: member.status,
      dateJoined: member.dateJoinedChoir,
      expiryDate: member.idCard?.expiresAt || null
    }
  });
});

export const downloadIDCard = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const member = await Member.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  assertCanAccessMember(req, member);

  if (member.status !== "approved") {
    throw new ApiError(403, "Only approved members can download ID cards");
  }

  const idCardData = await buildIdCardPayload(member);

  res.json({
    success: true,
    message: "ID card ready for download",
    data: idCardData
  });
});

export const getMemberIDCard = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ user: req.user._id });
  if (!member) {
    throw new ApiError(404, "Member profile not found");
  }

  if (member.status !== "approved") {
    throw new ApiError(403, "Your account must be approved to view your ID card");
  }

  const idCardPayload = await buildIdCardPayload(member);

  res.json({
    success: true,
    data: idCardPayload
  });
});
