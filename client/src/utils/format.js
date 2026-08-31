import { api } from "../api/client";

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

export const formatDate = (value, fallback = "Not set") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const formatMonthYear = (month, year) => {
  if (!month || !year) return "Not set";
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
};

export const getMemberFromUser = (user) => user?.member || {};

export const getMemberId = (user) => user?.memberId || user?.member?._id;

export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads")) {
    try {
      const baseUrl = api.defaults.baseURL || "";
      const origin = baseUrl.startsWith("http")
        ? new URL(baseUrl).origin
        : (typeof window !== "undefined" ? window.location.origin : "");
      return `${origin}${url}`;
    } catch {
      return url;
    }
  }
  return url;
};
