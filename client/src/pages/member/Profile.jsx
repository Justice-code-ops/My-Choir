import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Camera, Save } from "lucide-react";
import { memberAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";
import { formatDate, getMemberFromUser, resolveAssetUrl } from "../../utils/format";

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function MemberProfile() {
  const { user, setUser } = useAuthStore();
  const member = getMemberFromUser(user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const defaultValues = useMemo(() => ({
    fullName: member.fullName || user?.fullName || "",
    email: user?.email || member.email || "",
    phone: member.phone || user?.phone || "",
    gender: member.gender || "",
    dob: toInputDate(member.dob),
    address: member.address || "",
    occupation: member.occupation || "",
    voicePart: member.voicePart || "",
    instrument: member.instrument || "",
    previousChoirExperience: member.previousChoirExperience || "",
    nextOfKinName: member.nextOfKin?.name || "",
    nextOfKinPhone: member.nextOfKin?.phone || "",
    nextOfKinRelationship: member.nextOfKin?.relationship || "",
    baptized: Boolean(member.baptized),
    confirmed: Boolean(member.confirmed),
    dateJoinedChurch: toInputDate(member.dateJoinedChurch),
    emergencyNotes: member.emergencyNotes || ""
  }), [member, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
    setPreviewUrl(resolveAssetUrl(member.profilePicture?.url));
  }, [defaultValues, member.profilePicture?.url, reset]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(""), 4000);
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    setProfilePicture(file || null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(resolveAssetUrl(member.profilePicture?.url));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...data,
        baptized: Boolean(data.baptized),
        confirmed: Boolean(data.confirmed)
      };

      const res = await memberAPI.updateProfile(payload, profilePicture);
      const updatedMember = res.data?.data;

      setUser({
        ...user,
        member: updatedMember,
        memberId: updatedMember?._id,
        fullName: updatedMember?.fullName,
        phone: updatedMember?.phone,
        gender: updatedMember?.gender,
        voicePart: updatedMember?.voicePart,
        choirId: updatedMember?.choirId,
        createdAt: updatedMember?.createdAt || user?.createdAt
      });
      setProfilePicture(null);
      showMessage("Profile updated successfully.");
    } catch (err) {
      showMessage(err.response?.data?.message || "Profile update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Keep your choir membership information accurate for administration, attendance, dues, and ID card verification.
        </p>
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

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="w-28 h-28 rounded-lg bg-gray-100 dark:bg-dark-700 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-dark-600">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-gray-400" size={32} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePictureChange}
                className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                JPG, PNG, or WEBP. This photo appears on your digital ID card.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  {...register("fullName", { required: "Full name is required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  {...register("email")}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <input
                  {...register("address", { required: "Address is required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choir Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Part</label>
                <select
                  {...register("voicePart", { required: "Voice part is required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                >
                  <option value="">Select voice part</option>
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                </select>
                {errors.voicePart && <p className="text-red-500 text-sm mt-1">{errors.voicePart.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instrument</label>
                <input
                  {...register("instrument")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupation</label>
                <input
                  {...register("occupation")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Joined Church</label>
                <input
                  type="date"
                  {...register("dateJoinedChurch")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Previous Choir Experience</label>
                <textarea
                  {...register("previousChoirExperience")}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next of Kin</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                {...register("nextOfKinName")}
                aria-label="Next of kin name"
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              <input
                {...register("nextOfKinPhone")}
                aria-label="Next of kin phone"
                placeholder="Phone"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              <input
                {...register("nextOfKinRelationship")}
                aria-label="Next of kin relationship"
                placeholder="Relationship"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register("baptized")} className="rounded" />
                Baptized
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register("confirmed")} className="rounded" />
                Confirmed
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Notes</label>
              <textarea
                {...register("emergencyNotes")}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-dark-700 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registered {formatDate(member.createdAt || user?.createdAt)}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
