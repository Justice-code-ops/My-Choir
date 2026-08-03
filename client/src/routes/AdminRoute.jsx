import { Navigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export default function AdminRoute({ children }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== "admin" && user.role !== "super-admin") {
    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
}
