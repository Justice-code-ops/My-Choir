import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../api/client";
import { Users, CreditCard, CheckCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setDashboard(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading dashboard...</div>;

  const totalMembers = dashboard?.members?.total ?? dashboard?.totalMembers ?? 0;
  const pendingApprovals = dashboard?.members?.pending ?? dashboard?.pendingApprovals ?? 0;
  const totalCollected = dashboard?.payments?.totalCollected ?? dashboard?.monthlyRevenue ?? 0;
  const thisMonthPayments = dashboard?.payments?.collectedThisMonth ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Approved Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalMembers}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingApprovals}</p>
            </div>
            <TrendingUp className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Payments This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{thisMonthPayments}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Collected</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCollected)}</p>
            </div>
            <CreditCard className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link to="/admin/approvals" className="block p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800">
              Review Pending Approvals
            </Link>
            <Link to="/admin/members" className="block p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800">
              Manage Members
            </Link>
            <Link to="/admin/payments" className="block p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-800">
              Payment Management
            </Link>
            <Link to="/admin/attendance" className="block p-3 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800">
              Attendance Reports
            </Link>
            <Link to="/admin/blog" className="block p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
              Blog Publishing
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Distribution</h3>
          {dashboard?.voiceDistribution && Object.keys(dashboard.voiceDistribution).length > 0 ? (
            Object.entries(dashboard.voiceDistribution).map(([part, count]) => (
              <div key={part} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{part}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / Math.max(totalMembers, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No approved members yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Average Attendance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard?.averageAttendance || 0}%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Outstanding Recorded Dues</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(dashboard?.outstandingPayments || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
