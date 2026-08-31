import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { memberAPI, paymentAPI, attendanceAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";
import { CreditCard, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate, getMemberFromUser, getMemberId } from "../../utils/format";

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const member = getMemberFromUser(user);
  const memberId = getMemberId(user);
  const displayName = user?.fullName || member.fullName || user?.email;
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!memberId) {
      setError("Member profile not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, balanceRes, attendanceRes] = await Promise.all([
          memberAPI.getMemberStats(memberId),
          paymentAPI.getMemberBalance(memberId),
          attendanceAPI.getAttendanceStats(memberId)
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
  }, [memberId]);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome, {displayName}!</h2>
        <p className="text-blue-100">Choir ID: {user?.choirId || member.choirId || "Pending"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(balance?.outstandingBalance || balance?.balance || 0)}
              </p>
            </div>
            <CreditCard className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Payments Made</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(balance?.totalPaid || 0)}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attendance?.attendanceRate || stats?.attendance?.attendanceRate || "0%"}
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {user?.status}
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/member/payments" className="block p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800">
              View Payment History
            </Link>
            <Link to="/member/attendance" className="block p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800">
              View Attendance Records
            </Link>
            <Link to="/member/id-card" className="block p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-800">
              My ID Card
            </Link>
            <Link to="/member/profile" className="block p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Member Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {user?.email}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span> {user?.phone || member.phone || "Not provided"}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Voice Part:</span> {user?.voicePart || member.voicePart || "Not set"}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Gender:</span> {user?.gender || member.gender || "Not set"}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-300">Registered:</span> {formatDate(user?.createdAt || member.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
