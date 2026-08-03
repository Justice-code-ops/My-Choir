import { useEffect, useState } from "react";
import { adminAPI } from "../../api/client";
import { Users, CreditCard, CheckCircle, TrendingUp } from "lucide-react";

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

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard?.totalMembers || 0}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Approved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard?.approvedMembers || 0}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard?.pendingApprovals || 0}</p>
            </div>
            <TrendingUp className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Outstanding Dues</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{dashboard?.outstandingPayments || 0}</p>
            </div>
            <CreditCard className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
          <div className="space-y-2">
            <a href="/admin/approvals" className="block p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800">
              Review Pending Approvals
            </a>
            <a href="/admin/members" className="block p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800">
              Manage Members
            </a>
            <a href="/admin/payments" className="block p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-800">
              Payment Management
            </a>
            <a href="/admin/attendance" className="block p-3 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800">
              Attendance Reports
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Distribution</h3>
          {dashboard?.voiceDistribution && Object.entries(dashboard.voiceDistribution).map(([part, count]) => (
            <div key={part} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{part}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(count / (dashboard?.totalMembers || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Average Attendance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboard?.averageAttendance || 0}%</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{dashboard?.monthlyRevenue || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
