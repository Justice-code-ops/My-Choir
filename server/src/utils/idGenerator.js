import crypto from "crypto";

export const generateChoirId = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomInt(100000, 999999);
  return `VOL-${year}-${suffix}`;
};

export const generateReceiptNumber = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomInt(1000, 9999);
  return `VOL-RCPT-${stamp}-${suffix}`;
};

export const generateAttendanceCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

