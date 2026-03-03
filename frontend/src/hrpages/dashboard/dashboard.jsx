import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Users, Clock, CheckCircle, Shield } from "lucide-react"; 
import api from "../../api/api";

export default function HrDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_employees: 0,
    pending_requests: 0,
    completed_tasks: 0,
    mfa_enabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/accounts/hr/dashboard-summary/");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">HireFlow HR</h1>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button 
              onClick={() => navigate("/hr/notifications")}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <Bell size={24} />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              HR
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Here is what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users className="text-blue-600" />} label="Total Employees" value={stats.total_employees} color="bg-blue-50" />
          <StatCard icon={<Clock className="text-orange-600" />} label="Pending Requests" value={stats.pending_requests} color="bg-orange-50" />
          <StatCard icon={<CheckCircle className="text-green-600" />} label="Tasks Completed" value={stats.completed_tasks} color="bg-green-50" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* MFA Quick Action */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Security Status</h3>
                <p className="text-sm text-gray-500">MFA is {stats.mfa_enabled ? "Active" : "Disabled"}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/hr/security")} // Goes to your security page
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition"
            >
              Configure
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <div className="flex gap-3">
              <button className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">Add Employee</button>
              <button className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition">Payroll</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
      <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}