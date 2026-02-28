import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/userReducer";
import api from "../../api/api";
import { disconnectSocket } from "../../api/socket";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
 
} from "lucide-react";

export default function HRSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/hr/dashboard" },
    { name: "Jobs", icon: Briefcase, path: "/hr/jobs" },
    { name: "Management", icon: Users, path: "/hr/all-users" },
    { name: "Applications", icon: FileText, path: "/hr/applications" },
    { name: "Chat", icon: Settings, path: "/hr/chat" },
    { name: "Profile", icon: Settings, path: "/hr/profile" },
    { name: "Security", icon: Shield, path: "/hr/security" },
  ];

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await api.post("accounts/logout/");
    } catch (e) {
      console.log("Backend logout failed");
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div
      className={`h-screen ${collapsed ? "w-20" : "w-72"} bg-[#0F172A] text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 shadow-2xl`}
    >
      {/* 1. Header with Brand */}
      <div className="flex items-center justify-between p-6 mb-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">H</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              HireFlow <span className="text-blue-500">HR</span>
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] px-3 mb-4">
            Main Menu
          </p>
        )}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              }`}
            >
              <Icon size={22} className={isActive ? "text-white" : "group-hover:text-blue-400"} />
              {!collapsed && (
                <span className="font-bold text-[15px] tracking-tight">{item.name}</span>
              )}
              
              {isActive && !collapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Improved Logout Footer */}
      <div className="p-4 mt-auto border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className={`group flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${
            collapsed 
            ? "justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white" 
            : "bg-slate-800/30 hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-500/20"
          }`}
        >
          <LogOut size={22} className="transition-colors" />
          {!collapsed && (
            <div className="text-left">
              <p className="font-bold text-sm">Logout</p>
              <p className="text-[10px] text-slate-500 group-hover:text-red-400 transition-colors">End Session</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}