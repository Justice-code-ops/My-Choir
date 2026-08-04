import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../../api/client";
import { useAuthStore } from "../../context/authStore";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    login,
    user
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "super-admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const result = await login(data.email, data.password);

      const loggedInUser = result.data || result.user || result;

      if (loggedInUser.role === "admin" || loggedInUser.role === "super-admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-dark-700 dark:text-white"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <a href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <a href="/auth/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
          Register here
        </a>
      </p>

      {/* Demo Credentials */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm">
        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Demo Credentials:</p>
        <p className="text-blue-800 dark:text-blue-200">
          Admin: <code className="bg-white dark:bg-dark-700 px-2 py-1 rounded">admin@voiceoflight.local</code> / <code className="bg-white dark:bg-dark-700 px-2 py-1 rounded">AdminPass123!</code>
        </p>
        <p className="text-blue-800 dark:text-blue-200">
          Member: <code className="bg-white dark:bg-dark-700 px-2 py-1 rounded">member@voiceoflight.local</code> / <code className="bg-white dark:bg-dark-700 px-2 py-1 rounded">MemberPass123!</code>
        </p>
      </div>
    </div>
  );
}
