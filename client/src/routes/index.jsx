import { createBrowserRouter, Outlet } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Layout
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Public pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Events from "../pages/public/Events";
import Gallery from "../pages/public/Gallery";
import Blog from "../pages/public/Blog";
import BlogPost from "../pages/public/BlogPost";
import Contact from "../pages/public/Contact";
import VerifyIDCard from "../pages/public/VerifyIDCard";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Member pages
import MemberDashboard from "../pages/member/Dashboard";
import MemberProfile from "../pages/member/Profile";
import MemberPayments from "../pages/member/Payments";
import MemberAttendance from "../pages/member/Attendance";
import MemberIDCard from "../pages/member/IDCard";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminMembers from "../pages/admin/Members";
import AdminApprovals from "../pages/admin/Approvals";
import AdminPayments from "../pages/admin/Payments";
import AdminAttendance from "../pages/admin/Attendance";
import AdminBlog from "../pages/admin/Blog";

// Error pages
import NotFound from "../pages/errors/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "events", element: <Events /> },
      { path: "gallery", element: <Gallery /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <BlogPost /> },
      { path: "contact", element: <Contact /> },
      { path: "verify/:choirId", element: <VerifyIDCard /> }
    ]
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> }
    ]
  },
  {
    path: "/member",
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      { path: "dashboard", element: <MemberDashboard /> },
      { path: "profile", element: <MemberProfile /> },
      { path: "payments", element: <MemberPayments /> },
      { path: "attendance", element: <MemberAttendance /> },
      { path: "id-card", element: <MemberIDCard /> }
    ]
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "members", element: <AdminMembers /> },
      { path: "approvals", element: <AdminApprovals /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "attendance", element: <AdminAttendance /> },
      { path: "id-card", element: <MemberIDCard /> },
      { path: "blog", element: <AdminBlog /> }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;
