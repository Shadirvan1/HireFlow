import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCheck ,
  ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "HR Details", icon: UserCheck, path: "/admin/hr/details" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    // Use navigate for a smoother SPA feel or window.location for a hard reset
    window.location.href = "/login";
  };

  return (
    <aside 
      className={`h-screen sticky top-0 left-0 z-40 ${
        collapsed ? "w-20" : "w-72"
      } bg-[#0F172A] border-r border-slate-800 text-slate-400 transition-all duration-300 ease-in-out flex flex-col shadow-2xl`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between h-20 px-6 mb-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 mx-auto"
        >
          {collapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div key={item.name} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? "bg-indigo-600/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]" 
                    : "hover:bg-slate-800/50 hover:text-slate-100"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={22} className={isActive ? "text-indigo-400" : "text-inherit"} />
                  {!collapsed && (
                    <span className={`font-medium text-sm ${isActive ? "text-white" : ""}`}>
                      {item.name}
                    </span>
                  )}
                </div>

                {!collapsed && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                )}
              </NavLink>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}