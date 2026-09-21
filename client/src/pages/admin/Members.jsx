import { useEffect, useState } from "react";
import { adminAPI, memberAPI } from "../../api/client";
import { Search, Save, ShieldCheck, Trash2 } from "lucide-react";

const privilegedRoles = ["admin", "super-admin"];

const roleLabel = (role) => {
  if (role === "super-admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Member";
};

const buildPostDrafts = (members) =>
  Object.fromEntries(members.map((member) => [member._id, member.choirPost || ""]));

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [postDrafts, setPostDrafts] = useState({});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.listMembers();
        const nextMembers = res.data?.data || [];
        setMembers(nextMembers);
        setPostDrafts(buildPostDrafts(nextMembers));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setFiltered(members);
      return;
    }

    setFiltered(
      members.filter((member) =>
        [
          member.fullName,
          member.email,
          member.phone,
          member.voicePart,
          member.choirPost,
          member.choirId,
          member.user?.role
        ].some((value) => String(value || "").toLowerCase().includes(query))
      )
    );
  }, [search, members]);

  const updateMemberInState = (memberId, nextMember = {}, nextUser = {}) => {
    setMembers((current) =>
      current.map((member) => {
        if (member._id !== memberId) return member;
        const userUpdate = nextUser && typeof nextUser === "object" ? nextUser : {};
        const memberUser = nextMember.user && typeof nextMember.user === "object" ? nextMember.user : {};
        return {
          ...member,
          ...nextMember,
          user: {
            ...(member.user || {}),
            ...memberUser,
            ...userUpdate
          }
        };
      })
    );
  };

  const handlePostChange = (memberId, value) => {
    setPostDrafts((current) => ({ ...current, [memberId]: value }));
  };

  const handleSavePost = async (member) => {
    const choirPost = String(postDrafts[member._id] || "").trim();
    setBusyId(`post-${member._id}`);
    setMessage("");
    setError("");

    try {
      const res = await memberAPI.updateMember(member._id, { choirPost });
      const updatedMember = res.data?.data || {};
      updateMemberInState(member._id, updatedMember);
      setPostDrafts((current) => ({
        ...current,
        [member._id]: updatedMember.choirPost || choirPost
      }));
      setMessage("Official post updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update official post");
    } finally {
      setBusyId("");
    }
  };

  const handleMakeAdmin = async (member) => {
    const userId = member.user?._id || member.user?.id;
    if (!userId) {
      setError("This member does not have a linked user account.");
      return;
    }

    const choirPost = String(postDrafts[member._id] || member.choirPost || "Choir Administrator").trim();
    setBusyId(`admin-${member._id}`);
    setMessage("");
    setError("");

    try {
      const res = await adminAPI.updateUserRole(userId, { role: "admin", choirPost });
      const updatedMember = res.data?.data?.member || {};
      const updatedUser = res.data?.data?.user || {};
      updateMemberInState(member._id, updatedMember, updatedUser);
      setPostDrafts((current) => ({
        ...current,
        [member._id]: updatedMember.choirPost || choirPost
      }));
      setMessage(`${member.fullName} now has admin access.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to make this member an admin");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member and their linked user account?")) return;

    setError("");
    setMessage("");
    setBusyId(`delete-${id}`);

    try {
      await memberAPI.deleteMember(id);
      setMembers((current) => current.filter((member) => member._id !== id));
      setPostDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setMessage("Member deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading members...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage member records, official choir posts, and admin access.
        </p>
      </div>

      {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">{message}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">{error}</div>}

      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            placeholder="Search by name, email, voice part, official post, ID, or access..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Member</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Voice Part</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Official Post</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Access</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
            {filtered.length > 0 ? (
              filtered.map((member) => {
                const userRole = member.user?.role || "member";
                const isAdmin = privilegedRoles.includes(userRole);
                const isApproved = member.status === "approved";

                return (
                  <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 align-top">
                    <td className="px-6 py-4 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">{member.fullName}</p>
                      <p className="text-gray-500 dark:text-gray-400">{member.choirId || "ID not issued"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>{member.email}</p>
                      <p>{member.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{member.voicePart}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isApproved ? "bg-green-100 text-green-800" :
                        member.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <input
                        value={postDrafts[member._id] ?? ""}
                        onChange={(e) => handlePostChange(member._id, e.target.value)}
                        maxLength={80}
                        placeholder="e.g. Choirmaster"
                        aria-label={`Official post for ${member.fullName}`}
                        className="w-56 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-900 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                      }`}>
                        {roleLabel(userRole)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSavePost(member)}
                          disabled={Boolean(busyId)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50"
                        >
                          <Save size={15} />
                          {busyId === `post-${member._id}` ? "Saving..." : "Save Post"}
                        </button>
                        {!isAdmin && (
                          <button
                            onClick={() => handleMakeAdmin(member)}
                            disabled={Boolean(busyId) || !isApproved}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <ShieldCheck size={15} />
                            {busyId === `admin-${member._id}` ? "Updating..." : "Make Admin"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(member._id)}
                          disabled={Boolean(busyId)}
                          aria-label={`Delete ${member.fullName}`}
                          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {!isApproved && !isAdmin && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Approve this member before granting admin access.</p>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
