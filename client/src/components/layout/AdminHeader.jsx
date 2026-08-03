import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiBell } from "react-icons/fi";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useAuthStore } from "../../context/authStore";
import { useThemeStore } from "../../context/themeStore";

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="bg-white dark:bg-dark-800 shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
          >
            {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
