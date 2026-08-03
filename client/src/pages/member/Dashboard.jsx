import { useEffect, useState } from "react";
import { memberAPI, paymentAPI, attendanceAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";
import { CreditCard, CheckCircle, Calendar, AlertCircle } from "lucide-react";

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, balanceRes, attendanceRes] = await Promise.all([
          memberAPI.getStats(user._id),
          paymentAPI.getMemberBalance(user._id),
          attendanceAPI.getStats(user._id)
        ]);
        setStats(statsRes.data?.data);
        setBalance(balanceRes.data?.data);
        setAttendance(attendanceRes.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.firstName}!</h2>
        <p className="text-blue-100">Choir ID: {user.choirId || "Pending"}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Payment Status */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{balance?.outstandingBalance || 0}
              </p>
            </div>
            <CreditCard className="text-red-500" size={32} />
          </div>
        </div>

        {/* Paid Payments */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Payments Made</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance?.totalPaid || 0}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attendance?.attendanceRate || 0}%
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {user.status}
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/member/payments" className="block p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800">
              View Payment History
            </a>
            <a href="/member/attendance" className="block p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800">
              View Attendance Records
            </a>
            <a href="/member/id-card" className="block p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-800">
              My ID Card
            </a>
            <a href="/member/profile" className="block p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
              Edit Profile
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Member Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span> {user.phone}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Voice Part:</span> {user.voicePart}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Gender:</span> {user.gender}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Registered:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
