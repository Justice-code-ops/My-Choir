import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/client";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setResetUrl("");
    try {
      const res = await authAPI.forgotPassword(data.email);
      setSuccess(true);
      setMessage(res.data?.message || "If an account exists with that email, you will receive a password reset link.");
      setResetUrl(res.data?.resetUrl || "");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <Mail className="mx-auto mb-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
        <p className="text-gray-600 dark:text-gray-400">Enter your email to receive a password reset link</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          success
            ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
            : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
        }`}>
          {message}
          {resetUrl && (
            <a href={resetUrl} className="block mt-3 font-medium underline">
              Open development reset link
            </a>
          )}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <Link to="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Login
          </Link>
        </div>
      )}

      <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
        Remember your password?{" "}
        <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          Login here
        </Link>
      </p>
    </div>
  );
}
