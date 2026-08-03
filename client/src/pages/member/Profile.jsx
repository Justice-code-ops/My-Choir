import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { memberAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";

export default function MemberProfile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: user || {}
  });

  useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await memberAPI.updateMember(user._id, data);
      setUser(res.data?.data);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes("successfully")
            ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
            : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
              <input {...register("firstName")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
              <input {...register("lastName")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input {...register("phone")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <input {...register("address")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupation</label>
              <input {...register("occupation")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Part</label>
              <select {...register("voicePart")} className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white">
                <option value="Soprano">Soprano</option>
                <option value="Alto">Alto</option>
                <option value="Tenor">Tenor</option>
                <option value="Bass">Bass</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
