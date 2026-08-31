import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Save, Search, XCircle } from "lucide-react";
import { attendanceAPI, memberAPI } from "../../api/client";
import { formatDate } from "../../utils/format";

const statuses = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" }
];

const toDateTimeInput = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const statusClass = (status) => {
  if (status === "present") return "bg-green-100 text-green-800";
  if (status === "late") return "bg-yellow-100 text-yellow-800";
  if (status === "excused") return "bg-blue-100 text-blue-800";
  return "bg-red-100 text-red-800";
};

export default function AdminAttendance() {
  const [report, setReport] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    memberId: "",
    status: "present",
    checkedInAt: toDateTimeInput(),
    notes: ""
  });

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) =>
      [member.fullName, member.email, member.voicePart, member.choirId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [members, search]);

  const fetchData = async () => {
    const [reportRes, membersRes] = await Promise.all([
      attendanceAPI.getReport(),
      memberAPI.listMembers({ status: "approved", limit: 100 })
    ]);

    setReport(reportRes.data?.data || null);
    setMembers(membersRes.data?.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchData();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.memberId) {
      setError("Select a member before saving attendance.");
      return;
    }

    setSaving(true);
    try {
      const res = await attendanceAPI.recordAttendance({
        memberId: form.memberId,
        status: form.status,
        checkedInAt: form.checkedInAt ? new Date(form.checkedInAt).toISOString() : undefined,
        notes: form.notes.trim()
      });
      setMessage(res.data?.message || "Attendance saved.");
      setForm((current) => ({
        ...current,
        status: "present",
        checkedInAt: toDateTimeInput(),
        notes: ""
      }));
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Attendance could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading attendance...</div>;
  }

  const totals = report?.totals || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Record attendance for members and review choir-wide attendance reports.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <section className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mark Attendance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Only admins can create attendance records.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_160px_220px_minmax(0,1fr)_auto] gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member</label>
            <select
              value={form.memberId}
              onChange={(event) => updateField("memberId", event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            >
              <option value="">Select member</option>
              {filteredMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName} {member.choirId ? `(${member.choirId})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={form.checkedInAt}
              onChange={(event) => updateField("checkedInAt", event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <input
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              maxLength={500}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full lg:w-auto items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-200 text-sm mb-2">Total Present</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{totals.present || 0}</p>
            </div>
            <CheckCircle className="text-green-500" size={30} />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-200 text-sm mb-2">Total Late</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{totals.late || 0}</p>
            </div>
            <Clock className="text-yellow-500" size={30} />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-200 text-sm mb-2">Total Absent</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">{totals.absent || 0}</p>
            </div>
            <XCircle className="text-red-500" size={30} />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <p className="text-blue-600 dark:text-blue-200 text-sm mb-2">Total Records</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totals.total || 0}</p>
        </div>
      </div>

      <section className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Voice Part</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">Voice Part</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Present</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Late</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Absent</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Excused</th>
              </tr>
            </thead>
            <tbody>
              {report?.byVoicePart && Object.keys(report.byVoicePart).length > 0 ? (
                Object.entries(report.byVoicePart).map(([part, stats]) => (
                  <tr key={part} className="border-b border-gray-200 dark:border-dark-600">
                    <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{part}</td>
                    <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">{stats.present || 0}</td>
                    <td className="px-4 py-2 text-right text-yellow-600 dark:text-yellow-400">{stats.late || 0}</td>
                    <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">{stats.absent || 0}</td>
                    <td className="px-4 py-2 text-right text-blue-600 dark:text-blue-400">{stats.excused || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500 dark:text-gray-400">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Member</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Voice</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="py-3 text-left font-semibold text-gray-900 dark:text-white">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
              {report?.records?.length > 0 ? (
                report.records.slice(0, 25).map((record) => (
                  <tr key={record._id}>
                    <td className="py-3 pr-4 text-gray-900 dark:text-white">{record.member?.fullName}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{record.member?.voicePart}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{formatDate(record.checkedInAt)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${statusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{record.notes || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500 dark:text-gray-400">
                    No recent attendance records.
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
