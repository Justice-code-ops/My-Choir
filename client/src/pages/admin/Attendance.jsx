import { useEffect, useState } from "react";
import { attendanceAPI, adminAPI } from "../../api/client";

export default function AdminAttendance() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await attendanceAPI.getReport();
        setReport(res.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Attendance Report</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
          <p className="text-green-600 dark:text-green-200 text-sm mb-2">Total Present</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{report?.totalPresent || 0}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-200 text-sm mb-2">Total Late</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{report?.totalLate || 0}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
          <p className="text-red-600 dark:text-red-200 text-sm mb-2">Total Absent</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{report?.totalAbsent || 0}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <p className="text-blue-600 dark:text-blue-200 text-sm mb-2">Average Rate</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{report?.averageRate || 0}%</p>
        </div>
      </div>

      {/* Attendance by Voice Part */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Voice Part</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">Voice Part</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Present</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Late</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Absent</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Rate</th>
              </tr>
            </thead>
            <tbody>
              {report?.byVoicePart && Object.entries(report.byVoicePart).map(([part, stats]) => (
                <tr key={part} className="border-b border-gray-200 dark:border-dark-600">
                  <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{part}</td>
                  <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">{stats.present}</td>
                  <td className="px-4 py-2 text-right text-yellow-600 dark:text-yellow-400">{stats.late}</td>
                  <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">{stats.absent}</td>
                  <td className="px-4 py-2 text-right text-blue-600 dark:text-blue-400">{stats.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
