import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiCalendar,
  FiChevronDown
} from "react-icons/fi";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  const menuItems = [
    { icon: FiHome, label: "Dashboard", path: "/admin/dashboard" },
    { icon: FiUsers, label: "Members", path: "/admin/members" },
    { icon: FiCheckCircle, label: "Approvals", path: "/admin/approvals" },
    { icon: FiDollarSign, label: "Payments", path: "/admin/payments" },
    { icon: FiCalendar, label: "Attendance", path: "/admin/attendance" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`${expanded ? "w-64" : "w-20"} bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-dark-700">
        <h2 className={`font-bold text-lg text-blue-600 ${!expanded && "hidden"}`}>VOL</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
        >
          <FiChevronDown size={20} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
              }`}
            >
              <Icon size={20} />
              <span className={!expanded ? "hidden" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
