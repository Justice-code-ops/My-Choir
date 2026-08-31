import { useEffect, useState } from "react";
import { paymentAPI } from "../../api/client";
import { formatCurrency, formatDate, formatMonthYear } from "../../utils/format";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentAPI.listPayments();
        setPayments(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = filter === "all" ? payments : payments.filter((payment) => payment.status === filter);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading payments...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Payment Management</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "paid", "pending", "failed", "refunded"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Period</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Receipt</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {filtered.length > 0 ? (
                filtered.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{payment.member?.fullName || "Unknown member"}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{formatMonthYear(payment.month, payment.year)}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{payment.receiptNumber || "-"}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        payment.status === "paid" ? "bg-green-100 text-green-800" :
                        payment.status === "failed" ? "bg-red-100 text-red-800" :
                        payment.status === "refunded" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
