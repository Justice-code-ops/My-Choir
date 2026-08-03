import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../../api/client";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    if (!token) {
      setMessage("Invalid reset link");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await authAPI.resetPassword(token, data.password);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Invalid reset link</p>
          <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Request a new reset link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <Lock className="mx-auto mb-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-400">Enter your new password</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes("successfully")
            ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
            : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
          <input
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be 8+ characters" } })}
            type="password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
          <input
            {...register("confirmPassword", { required: "Please confirm password", validate: (value) => value === password || "Passwords don't match" })}
            type="password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
        <a href="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          Back to Login
        </a>
      </p>
    </div>
  );
}
