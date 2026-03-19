import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Users, Clock, CheckCircle, Shield, 
  Briefcase, FileText, Calendar, TrendingUp, Plus 
} from "lucide-react"; 
import api from "../../api/api";


export default function HrDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: {
      active_jobs: 0,
      total_applications: 0,
      pending_interviews: 0,
    },
    recent_applications: [],
    mfa_enabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("management/hr-dashboard/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  console.log(data)

  if (loading) return <div className="p-10 text-center font-medium">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* --- TOP NAVIGATION --- */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Briefcase className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              HireFlow Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
              <Bell size={22} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Recruiter Portal</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Verified HR</p>
              </div>
              <div onClick={()=>navigate('/hr/profile')} className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                HR
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recruitment Overview</h2>
            <p className="text-gray-500">Track your company's hiring pipeline and active candidates.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Briefcase size={24} />} 
            label="Active Jobs" 
            value={data.stats.active_jobs} 
            trend="+2 this week"
            color="text-blue-600 bg-blue-50" 
          />
          <StatCard 
            icon={<Users size={24} />} 
            label="Total Applicants" 
            value={data.stats.total_applications} 
            trend="Check ATS Scores"
            color="text-purple-600 bg-purple-50" 
          />
          <StatCard 
            icon={<Calendar size={24} />} 
            label="Interviews" 
            value={data.stats.pending_interviews} 
            trend="Scheduled Today"
            color="text-orange-600 bg-orange-50" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- RECENT APPLICATIONS TABLE --- */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Candidates</h3>
              <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-semibold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">ATS Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent_applications.map((app, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition cursor-pointer">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{app.candidate}</p>
                        <p className="text-xs text-gray-500">{app.applied_at}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.job_title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'HIRED' ? 'bg-green-100 text-green-700' : 
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-green-500" />
                          <span className="font-semibold text-sm">{app.ats_score || 'N/A'}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- SIDEBAR: Security & Shortcuts --- */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">2FA Security</h3>
                  <p className="text-[11px] text-gray-500">MFA is {data.mfa_enabled ? "Active" : "Disabled"}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/hr/security")}
                className="w-full py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded-xl transition shadow-lg shadow-gray-200"
              >
                Manage Security
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 text-xs mb-4 leading-relaxed">Check our recruitment guide on how to filter candidates using the ATS scoring system.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition border border-white/20">
                Read Documentation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group hover:border-blue-200 transition-colors">
      <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110`}>{icon}</div>
      <div>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-800 leading-tight">{value}</p>
        <p className="text-[10px] text-green-500 font-medium">{trend}</p>
      </div>
    </div>
  );
}