import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
