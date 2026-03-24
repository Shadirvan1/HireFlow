import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Users, Clock, Shield, Briefcase, Plus, 
  Award, Calendar, Video, CheckCircle, BarChart2, LayoutDashboard
} from "lucide-react"; 
import api from "../../api/api";

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  
  // 1. Get role from Redux and normalize to lowercase
  const { role } = useSelector((state) => state.user);
  const normalizedRole = role?.toLowerCase();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!normalizedRole) return;

      try {
        setLoading(true);
        setError(null);
        
        // 2. Determine endpoint based on normalized role
        const endpoint = normalizedRole === "hr" 
          ? "management/hr-dashboard/" 
          : "management/interviewer-dashboard/";
          
        const res = await api.get(endpoint);
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [normalizedRole]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Workspace...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Retry</button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* --- TOP NAVIGATION --- */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">HireFlow</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter mt-1">Enterprise Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-5 border-l border-slate-100">
              <div className="text-right hidden md:block">
                <p  className="text-xs font-black text-slate-900 leading-none">
                  {normalizedRole === 'hr' ? 'HR Administrator' : 'Technical Lead'}
                </p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1 tracking-widest">Active Now</p>
              </div>
              <div onClick={()=>navigate("/hr/profile")} className={`h-11 w-11 cursor-pointer rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 ${normalizedRole === 'hr' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {normalizedRole === 'hr' ? 'HR' : 'IN'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {normalizedRole === "hr" ? (
          <HrView data={data} navigate={navigate} />
        ) : (
          <InterviewerView data={data} />
        )}
      </main>
    </div>
  );
}

// --- HR VIEW ---
function HrView({ data, navigate }) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{data.company_name ?? "Company"} Overview</h2>
          <p className="text-slate-500 font-medium">Tracking {data.metrics?.active_jobs} open positions and candidate pipelines.</p>
        </div>
        <button 
          onClick={() => navigate("/hr/create-job")} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus size={20}/> Post New Role
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Briefcase />} label="Active Jobs" value={data.metrics?.active_jobs} color="blue" />
        <StatCard icon={<Users />} label="Applicants" value={data.metrics?.total_applications} color="purple" />
        <StatCard icon={<Clock />} label="To Review" value={data.metrics?.pending_reviews} color="orange" />
        <StatCard icon={<Award />} label="Success Hires" value={data.metrics?.hires_to_date} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-tighter">Hot Listings</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-full uppercase">Live Ranking</span>
          </div>
          <div className="p-4 space-y-2">
            {data.top_performing_jobs?.length > 0 ? data.top_performing_jobs.map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">Status: {job.is_active ? 'Active' : 'Closed'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900 leading-none">{job.count}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Applied</p>
                </div>
              </div>
            )) : <p className="p-8 text-center text-slate-400 italic">No job data available.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100">
            <Shield className="mb-6 opacity-80" size={32} />
            <h3 className="text-xl font-bold mb-3">Recruiter Shield</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6 opacity-90">All candidate data is encrypted. Review your workspace access permissions regularily.</p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md transition-colors">
              Security Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- INTERVIEWER VIEW ---
function InterviewerView({ data }) {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Interviewer Schedule</h2>
        <p className="text-slate-500 font-medium">Hosting {data.metrics?.upcoming_interviews_count ?? 0} sessions this cycle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <StatCard icon={<Calendar />} label="Today's Sessions" value={data.metrics?.upcoming_interviews_count} color="blue" />
        <StatCard icon={<CheckCircle />} label="Month Completion" value={data.metrics?.completed_this_month} color="emerald" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter">Upcoming Interviews</h3>
          <BarChart2 className="text-slate-300" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Candidate</th>
                <th className="px-8 py-6">Role Path</th>
                <th className="px-8 py-6">Session Time</th>
                <th className="px-8 py-6 text-center">Connection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.schedule?.length > 0 ? data.schedule.map((intv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900">{intv.candidate_name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-medium">{intv.job_title}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                      <Clock size={14} className="text-blue-500" />
                      {new Date(intv.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <a 
                      href={intv.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
                    >
                      <Video size={14} /> Join Session
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Calendar size={48} className="mb-4" />
                      <p className="font-bold">No sessions scheduled for today.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-transform hover:-translate-y-1">
      <div className={`p-5 rounded-2xl border-b-4 ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 leading-tight">{value ?? 0}</p>
      </div>
    </div>
  );
}