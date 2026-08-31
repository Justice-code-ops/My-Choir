import { useEffect, useState } from "react";
import { memberAPI } from "../../api/client";
import { Search, Trash2 } from "lucide-react";

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.listMembers();
        setMembers(res.data?.data || []);
        setFiltered(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (search) {
      setFiltered(members.filter(m => 
        m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(members);
    }
  }, [search, members]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      setError("");
      setMessage("");
      try {
        await memberAPI.deleteMember(id);
        setMembers(members.filter(m => m._id !== id));
        setMessage("Member deleted successfully.");
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Members</h1>

      {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">{message}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Voice Part</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
            {filtered.length > 0 ? (
              filtered.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{member.fullName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{member.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{member.voicePart}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      member.status === "approved" ? "bg-green-100 text-green-800" :
                      member.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button
                      onClick={() => handleDelete(member._id)}
                      aria-label={`Delete ${member.fullName}`}
                      className="text-red-600 dark:text-red-400 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
