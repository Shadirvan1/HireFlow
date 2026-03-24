import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiBriefcase, FiCheckCircle, FiClock, FiStar, 
  FiArrowRight, FiActivity, FiVideo, FiBookmark 
} from "react-icons/fi";
import api from "../api/api"; 
import { toast, Toaster } from "react-hot-toast";

export default function CandidateDashboard() {
  const [data, setData] = useState({
    metrics: {
      total_applications: 0,
      interviews_scheduled: 0,
      offers_received: 0,
      saved_jobs_count: 0
    },
    recent_applications: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
     
        const res = await api.get("/management/candidate-dashboard/"); 
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl mb-4"></div>
          <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Syncing your career...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-blue-600">Innovator</span> ⚡
            </h1>
            <p className="text-slate-500 mt-1">You have {data.metrics.interviews_scheduled} interviews lined up this week.</p>
          </div>
          <Link 
            to="/candidate/jobs" 
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Explore New Roles <FiArrowRight />
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<FiBriefcase />} label="Total Applied" value={data.metrics.total_applications} color="blue" />
          <StatCard icon={<FiVideo />} label="Interviews" value={data.metrics.interviews_scheduled} color="amber" />
          <StatCard icon={<FiCheckCircle />} label="Offers" value={data.metrics.offers_received} color="green" />
          <StatCard icon={<FiBookmark />} label="Saved Jobs" value={data.metrics.saved_jobs_count} color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Your Recent Applications</h3>
                <Link to="/candidate/applications" className="text-sm font-semibold text-blue-600 hover:underline">View tracking</Link>
              </div>
              
              <div className="space-y-4">
                {data.recent_applications.length > 0 ? data.recent_applications.map((app, idx) => (
                  <div key={idx} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FiBriefcase size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{app.job_title}</h4>
                          <p className="text-sm text-slate-500 font-medium">{app.company} • {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
                          ${app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            app.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {app.status}
                        </span>
                        
                        {app.meeting_link && app.status === "SCHEDULED" && (
                          <a 
                            href={app.meeting_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            title="Join Meeting"
                          >
                            <FiVideo size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400">No applications yet. Start your journey today!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar: AI Insights & Quick Stats */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FiStar className="text-yellow-400 fill-yellow-400" /> AI Career Coach
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  Based on your saved jobs, you should highlight <strong>System Design</strong> in your resume to increase matches by 25%.
                </p>
                <button className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]">
                  Optimize Profile
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FiActivity className="text-blue-600"/> Profile Strength
              </h3>
              <div className="w-full bg-slate-100 h-2 rounded-full mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">84% Completed - Great work!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}