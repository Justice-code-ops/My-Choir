export const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "yes", "1", "on"].includes(value.toLowerCase());
  return false;
};

export const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const monthName = (month) =>
  new Date(2000, Number(month) - 1, 1).toLocaleString("en", { month: "long" });

