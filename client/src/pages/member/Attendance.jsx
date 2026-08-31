import { useEffect, useState } from "react";
import { CheckCircle, Clock, ShieldCheck, XCircle } from "lucide-react";
import { attendanceAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";
import { formatDate, getMemberId } from "../../utils/format";

export default function MemberAttendance() {
  const { user } = useAuthStore();
  const memberId = getMemberId(user);
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(""), 4000);
  };

  const fetchAttendance = async () => {
    if (!memberId) {
      showMessage("Member profile not found.", "error");
      setLoading(false);
      return;
    }

    const [statsRes, historyRes] = await Promise.all([
      attendanceAPI.getAttendanceStats(memberId),
      attendanceAPI.getAttendanceHistory(memberId, { limit: 50 })
    ]);
    setStats(statsRes.data?.data);
    setRecords(historyRes.data?.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchAttendance();
      } catch (err) {
        showMessage(err.response?.data?.message || "Unable to load attendance.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [memberId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading attendance...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your attendance history. Attendance is recorded by choir administrators.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <ShieldCheck size={18} />
          Admin-managed records
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-6 p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
              : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Attendance Rate</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.attendanceRate || "0%"}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Present</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.present || 0}</p>
            </div>
            <CheckCircle className="text-green-500" size={30} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Late</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.late || 0}</p>
            </div>
            <Clock className="text-yellow-500" size={30} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Absent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.absent || 0}</p>
            </div>
            <XCircle className="text-red-500" size={30} />
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Event</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Mode</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="py-3 text-left font-semibold text-gray-900 dark:text-white">Minutes Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id}>
                    <td className="py-3 pr-4 text-gray-900 dark:text-white">{formatDate(record.checkedInAt)}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{record.event?.title || "General check-in"}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300 capitalize">{record.mode}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        record.status === "present" ? "bg-green-100 text-green-800" :
                        record.status === "late" ? "bg-yellow-100 text-yellow-800" :
                        record.status === "excused" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{record.minutesLate || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500 dark:text-gray-400">
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
