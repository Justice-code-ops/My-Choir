import QRCode from "qrcode";
import { env } from "../config/env.js";

export const buildVerificationUrl = (choirId) => `${env.publicAppUrl}/verify/${encodeURIComponent(choirId)}`;

export const buildIdCardPayload = async (member) => {
  const verificationUrl = buildVerificationUrl(member.choirId);
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return {
    choirName: "Voice of Light Chorale",
    churchName: "Voice of Light Church",
    logoUrl: "/assets/logo.png",
    member: {
      fullName: member.fullName,
      choirId: member.choirId,
      voicePart: member.voicePart,
      photoUrl: member.profilePicture?.url,
      dateJoined: member.dateJoinedChoir || member.dateJoinedChurch || member.createdAt,
      status: member.status
    },
    issuedAt: member.idCard?.issuedAt,
    expiresAt: member.idCard?.expiresAt,
    signatureLabel: member.idCard?.signatureLabel || "Choir Secretary",
    verificationUrl,
    qrCodeDataUrl
  };
};

