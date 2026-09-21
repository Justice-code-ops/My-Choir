import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { user } = useAuthStore();
  const password = watch("password");

  useEffect(() => {
    if (user) navigate("/member/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!profilePicture) {
      setError("Please upload a profile picture for your ID card.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        dob: data.dateOfBirth,
        nextOfKinName: data.nokName,
        nextOfKinPhone: data.nokPhone
      };

      delete payload.confirmPassword;

      await authAPI.register(payload, profilePicture);
      setSuccess("Registration successful. Please wait for admin approval before logging in.");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfilePicture(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400">Join Voice of Light Chorale</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture for ID Card
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-[96px_minmax(0,1fr)] gap-4 items-center">
            <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 overflow-hidden flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                "Photo"
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleProfilePictureChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This photo will be used immediately on your digital ID card after approval.
          </p>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
          <input
            {...register("phone", { required: "Phone is required" })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
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
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DOB</label>
            <input
              {...register("dateOfBirth", { required: "Date of birth is required" })}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
          <input
            {...register("address", { required: "Address is required" })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupation</label>
            <input
              {...register("occupation")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
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
            </select>
            {errors.voicePart && <p className="text-red-500 text-sm mt-1">{errors.voicePart.message}</p>}
          </div>
        </div>

        {/* Next of Kin */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NOK Name</label>
            <input
              {...register("nokName")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NOK Phone</label>
            <input
              {...register("nokPhone")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              {...register("baptized")}
              type="checkbox"
              className="rounded dark:bg-dark-700"
            />
            <span className="ml-2">Baptized</span>
          </label>
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              {...register("confirmed")}
              type="checkbox"
              className="rounded dark:bg-dark-700"
            />
            <span className="ml-2">Confirmed</span>
          </label>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <input
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be 8+ characters" } })}
            type="password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
          <input
            {...register("confirmPassword", { required: "Please confirm password", validate: (value) => value === password || "Passwords don't match" })}
            type="password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          Login here
        </Link>
      </p>
    </div>
  );
}
