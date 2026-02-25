import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";

export default function HRSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // current URL path

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/hr/dashboard" },
  { name: "Jobs", icon: Briefcase, path: "/hr/jobs" },
  { name: "Management", icon: Users, path: "/hr/all-users" },
  { name: "Applications", icon: FileText, path: "/hr/applications" },
  { name: "Analytics", icon: BarChart3, path: "/hr/analytics" },
  { name: "Security", icon: Shield, path: "/hr/security" },
  { name: "Profile", icon: Settings, path: "/hr/profile" },
];

  const getActiveFromPath = () => {
  const match = menuItems.find(item => location.pathname.startsWith(item.path));
    return match ? match.name : "Dashboard";
  };

  const [active, setActive] = useState(getActiveFromPath);

  // Update active on route change
  useEffect(() => {
    setActive(getActiveFromPath());
  }, [location.pathname]);

  return (
    <div
      className={`h-screen ${collapsed ? "w-20" : "w-64"} bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white transition-all duration-300 shadow-2xl flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            HR Panel
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-4 space-y-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;

          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "hover:bg-gray-800"
              }`}
            >
              <Icon
                size={20}
                className={`${
                  isActive
                    ? "text-cyan-400"
                    : "text-gray-400 group-hover:text-white"
                } transition`}
              />
              {!collapsed && (
                <span
                  className={`${
                    isActive
                      ? "text-cyan-400 font-semibold"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-600/20 transition"
        >
          <LogOut size={20} className="text-red-400" />
          {!collapsed && <span className="text-red-400">Logout</span>}
        </button>
      </div>
    </div>
  );
}