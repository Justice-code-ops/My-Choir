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
      setError("");
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
    if ((action === "reject" || action === "correct") && !reason.trim()) {
      setError("Please enter a reason before submitting this action.");
      return;
    }

    setProcessing(true);
    setError("");
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
      setError(err.response?.data?.message || "Action failed");
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
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{member.fullName}</p>
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
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Phone: {member.phone}</p>
                  <p className="text-gray-600 dark:text-gray-400">Gender: {member.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Registered: {new Date(member.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-600 dark:text-gray-400">Status: <span className="font-semibold capitalize">{member.status}</span></p>
                </div>
              </div>

              {selectedId === member._id && action ? (
                <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded mb-4">
                  {(action === "reject" || action === "correct") && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-600 dark:text-white"
                        rows="3"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={submitAction}
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing ? "Processing..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => { setSelectedId(null); setAction(null); }}
                      className="px-4 py-2 bg-gray-300 dark:bg-dark-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-dark-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAction(member._id, "approve")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(member._id, "reject")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(member._id, "correct")}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <AlertCircle size={18} /> Request Correction
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
