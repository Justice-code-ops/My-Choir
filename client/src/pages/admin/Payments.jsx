import { useEffect, useState } from "react";
import { paymentAPI } from "../../api/client";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentAPI.listPayments();
        setPayments(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Payment Management</h1>

      <div className="mb-6 flex gap-2">
        {["all", "paid", "pending"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg capitalize ${ 
              filter === s 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Member</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Month</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
            {filtered.length > 0 ? (
              filtered.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                    {payment.member?.firstName} {payment.member?.lastName}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{payment.month}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">₦{payment.amount}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No payments found</td>
              </tr>\n            )}\n          </tbody>\n        </table>\n      </div>\n    </div>\n  );\n}
