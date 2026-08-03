import { useEffect, useState } from "react";
import { approvalAPI } from "../../api/client";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await approvalAPI.getPending();
      setApprovals(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (memberId, actionType) => {
    setSelectedId(memberId);
    setAction(actionType);
    setReason("");
  };

  const submitAction = async () => {
    setProcessing(true);
    try {
      if (action === "approve") {
        await approvalAPI.approveMember(selectedId);
      } else if (action === "reject") {
        await approvalAPI.rejectMember(selectedId, { reason });
      } else if (action === "correct") {
        await approvalAPI.requestCorrection(selectedId, { reason });
      }
      fetchApprovals();
      setSelectedId(null);
      setAction(null);
      setReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Registration Approvals</h1>

      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      {approvals.length === 0 ? (
        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg text-green-800 dark:text-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <p>No pending approvals! All registrations have been reviewed.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((member) => (
            <div key={member._id} className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
                  <p className="text-gray-900 dark:text-white">{member.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Voice Part</p>
                  <p className="text-gray-900 dark:text-white">{member.voicePart}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>\n                  <p className=\"text-gray-600 dark:text-gray-400\">Phone: {member.phone}</p>\n                  <p className=\"text-gray-600 dark:text-gray-400\">Gender: {member.gender}</p>\n                </div>\n                <div>\n                  <p className=\"text-gray-600 dark:text-gray-400\">Registered: {new Date(member.createdAt).toLocaleDateString()}</p>\n                  <p className=\"text-gray-600 dark:text-gray-400\">Status: <span className=\"font-semibold capitalize\">{member.status}</span></p>\n                </div>\n              </div>

              {selectedId === member._id && action ? (
                <div className=\"bg-gray-50 dark:bg-dark-700 p-4 rounded mb-4\">\n                  {(action === \"reject\" || action === \"correct\") && (\n                    <div className=\"mb-4\">\n                      <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2\">Reason</label>\n                      <textarea\n                        value={reason}\n                        onChange={(e) => setReason(e.target.value)}\n                        className=\"w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-600 dark:text-white\"\n                        rows=\"3\"\n                      />\n                    </div>\n                  )}\n                  <div className=\"flex gap-2\">\n                    <button\n                      onClick={submitAction}\n                      disabled={processing}\n                      className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50\"\n                    >\n                      {processing ? \"Processing...\" : \"Confirm\"}\n                    </button>\n                    <button\n                      onClick={() => { setSelectedId(null); setAction(null); }}\n                      className=\"px-4 py-2 bg-gray-300 dark:bg-dark-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500\"\n                    >\n                      Cancel\n                    </button>\n                  </div>\n                </div>\n              ) : (\n                <div className=\"flex flex-wrap gap-2\">\n                  <button\n                    onClick={() => handleAction(member._id, \"approve\")}\n                    className=\"flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700\"\n                  >\n                    <CheckCircle size={18} /> Approve\n                  </button>\n                  <button\n                    onClick={() => handleAction(member._id, \"reject\")}\n                    className=\"flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700\"\n                  >\n                    <XCircle size={18} /> Reject\n                  </button>\n                  <button\n                    onClick={() => handleAction(member._id, \"correct\")}\n                    className=\"flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700\"\n                  >\n                    <AlertCircle size={18} /> Request Correction\n                  </button>\n                </div>\n              )}\n            </div>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}
