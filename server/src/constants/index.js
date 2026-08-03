export const ROLES = Object.freeze({
  MEMBER: "member",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin"
});

export const MEMBER_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CORRECTION: "correction",
  SUSPENDED: "suspended"
});

export const VOICE_PARTS = ["Soprano", "Alto", "Tenor", "Bass", "Instrumentalist"];

export const CONTENT_TYPES = [
  "gallery-image",
  "gallery-video",
  "music-audio",
  "music-sheet",
  "sermon-audio",
  "sermon-video",
  "sermon-pdf",
  "blog",
  "announcement",
  "devotional",
  "resource",
  "constitution"
];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export const ATTENDANCE_STATUSES = ["present", "late", "absent", "excused"];

