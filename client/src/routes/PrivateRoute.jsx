import { Navigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

export default function PrivateRoute({ children }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
