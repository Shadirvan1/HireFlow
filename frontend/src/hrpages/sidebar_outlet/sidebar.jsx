import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/userReducer";
import api from "../../api/api";
import { disconnectSocket } from "../../api/socket";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Shield,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Lock,
  MessageSquare, // Swapped Settings for Chat
  UserCircle
} from "lucide-react";

export default function HRSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.user.role);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/hr/dashboard", roles: ["HR", "INTERVIEWER"] },
    { name: "Jobs", icon: Briefcase, path: "/hr/jobs", roles: ["HR"] },
    { name: "Management", icon: Users, path: "/hr/all-users", roles: ["HR",] },
    { name: "Applications", icon: FileText, path: "/hr/applications", roles: ["HR"] },
    { name: "Interviews", icon: Shield, path: "/hr/interviews", roles: ["HR", "INTERVIEWER"] },
    { name: "Chat", icon: MessageSquare, path: "/hr/chat", roles: ["HR", "INTERVIEWER"] },
    { name: "Profile", icon: UserCircle, path: "/hr/profile", roles: ["HR", "INTERVIEWER"] },
    { name: "Security", icon: Shield, path: "/hr/security", roles: ["HR", "INTERVIEWER"] },
  ];

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await api.post("accounts/logout/");
    } catch (e) {
      console.error("Backend logout failed");
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/login");
    }
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">H</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HireFlow HR
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
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          const hasAccess = item.roles.includes(userRole);

          return (
            <div key={item.name} className="relative group">
              <button
                disabled={!hasAccess}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" 
                    : hasAccess 
                      ? "hover:bg-slate-800/50 hover:text-slate-100" 
                      : "opacity-40 grayscale cursor-not-allowed"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={22} className={isActive ? "text-blue-400" : "text-inherit"} />
                  {!collapsed && (
                    <span className={`font-medium text-sm ${isActive ? "text-white" : ""}`}>
                      {item.name}
                    </span>
                  )}
                </div>

                {/* Status Indicators */}
                {!collapsed && (
                  <>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                    {!hasAccess && <Lock size={14} className="text-slate-500" />}
                  </>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name} {!hasAccess && " (Locked)"}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
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