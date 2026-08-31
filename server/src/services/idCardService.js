import QRCode from "qrcode";
import { env } from "../config/env.js";
import { generateChoirId } from "../utils/idGenerator.js";

export const buildVerificationUrl = (choirId) => `${env.publicAppUrl}/verify/${encodeURIComponent(choirId)}`;

export const ensureIdCardForMember = async (member) => {
  let changed = false;

  if (!member.choirId) {
    member.choirId = generateChoirId();
    changed = true;
  }

  if (!member.idCard?.issuedAt || !member.idCard?.expiresAt) {
    member.idCard = {
      issuedAt: member.idCard?.issuedAt || new Date(),
      expiresAt: member.idCard?.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      signatureLabel: member.idCard?.signatureLabel || "Choir Secretary"
    };
    changed = true;
  }

  if (changed) {
    await member.save();
  }

  return member;
};

export const buildIdCardPayload = async (member) => {
  await ensureIdCardForMember(member);
  const verificationUrl = buildVerificationUrl(member.choirId);
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return {
    choirName: env.organizationName,
    churchName: env.churchName,
    logoUrl: "/assets/logo.png",
    member: {
      fullName: member.fullName,
      membershipId: member.choirId,
      choirId: member.choirId,
      role: member.role || "Choir Member",
      voicePart: member.voicePart,
      phone: member.phone,
      email: member.email,
      photoUrl: member.profilePicture?.url,
      dateJoined: member.dateJoinedChoir || member.dateJoinedChurch || member.createdAt,
      registrationDate: member.createdAt,
      status: member.status,
      isActive: member.status === "approved" && (!member.idCard?.expiresAt || new Date(member.idCard.expiresAt) >= new Date())
    },
    issuedAt: member.idCard?.issuedAt,
    expiresAt: member.idCard?.expiresAt,
    signatureLabel: member.idCard?.signatureLabel || "Choir Secretary",
    verificationUrl,
    qrCodeDataUrl
  };
};
