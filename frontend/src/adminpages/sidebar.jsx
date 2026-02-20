import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        
        {/* Logo */}
        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          Admin Panel
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/hr/details"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            HR Details
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Settings
          </NavLink>

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}