import { Attendance } from "../models/Attendance.js";
import { Member } from "../models/Member.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";

export const getAdminAnalytics = async () => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [
    totalMembers,
    pendingApprovals,
    suspendedMembers,
    monthlyIncomeAgg,
    voiceDistribution,
    genderDistribution,
    attendanceAgg,
    newRegistrations
  ] = await Promise.all([
    Member.countDocuments({ status: "approved" }),
    Member.countDocuments({ status: "pending" }),
    Member.countDocuments({ status: "suspended" }),
    Payment.aggregate([
      { $match: { status: "paid", paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Member.aggregate([{ $group: { _id: "$voicePart", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Member.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Attendance.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    User.countDocuments({ createdAt: { $gte: startOfMonth } })
  ]);

  const attendanceTotal = attendanceAgg.reduce((sum, item) => sum + item.count, 0);
  const presentTotal = attendanceAgg
    .filter((item) => ["present", "late"].includes(item._id))
    .reduce((sum, item) => sum + item.count, 0);

  return {
    totalMembers,
    pendingApprovals,
    suspendedMembers,
    monthlyIncome: monthlyIncomeAgg[0]?.total || 0,
    attendancePercentage: attendanceTotal ? Math.round((presentTotal / attendanceTotal) * 100) : 0,
    newRegistrations,
    voiceDistribution,
    genderDistribution,
    attendanceBreakdown: attendanceAgg
  };
};

