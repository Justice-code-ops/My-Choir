import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useAuthStore } from "../../context/authStore";
import { useThemeStore } from "../../context/themeStore";

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header className="bg-white dark:bg-dark-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Voice of Light
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              About
            </Link>
            <Link to="/events" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Events
            </Link>
            <Link to="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Gallery
            </Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
            >
              {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {user.role === "admin" || user.role === "super-admin" ? (
                    <Link
                      to="/admin/dashboard"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Admin
                    </Link>
                  ) : (
                    <Link
                      to="/member/dashboard"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-dark-700"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              About
            </Link>
            <Link to="/events" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              Events
            </Link>
            <Link to="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              Gallery
            </Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
