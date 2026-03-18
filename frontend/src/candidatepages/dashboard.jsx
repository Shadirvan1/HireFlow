import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiClock, FiStar, FiArrowRight, FiActivity } from "react-icons/fi";
import api from "../api/api";

export default function CandidateDashboard() {
  const [stats, setStats] = useState({ applied: 12, shortlisted: 3, pending: 5 });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial dashboard data here
    // const fetchData = async () => { ... }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-blue-600">Innovator</span> ⚡
            </h1>
            <p className="text-slate-500 mt-1">Here’s what’s happening with your career today.</p>
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
          <StatCard icon={<FiBriefcase />} label="Applied" value={stats.applied} color="blue" />
          <StatCard icon={<FiCheckCircle />} label="Shortlisted" value={stats.shortlisted} color="green" />
          <StatCard icon={<FiClock />} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={<FiActivity />} label="Profile Score" value="84%" color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Recent Activity / Recommended */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Recommended for You</h3>
                <Link to="/candidate/jobs" className="text-sm font-semibold text-blue-600 hover:underline">View all</Link>
              </div>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FiBriefcase size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Senior Full Stack Developer</h4>
                          <p className="text-sm text-slate-500 font-medium">TechFlow Solutions • Remote</p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded">React</span>
                      <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded">Django</span>
                      <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded">PostgreSQL</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar: AI Insights */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FiStar className="text-yellow-400 fill-yellow-400" /> AI Insight
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  Users with "Cloudinary" skills are seeing 40% more callbacks this week. Add it to your profile!
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-colors backdrop-blur-sm">
                  Improve Profile
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Recent Notifications</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                  <p className="text-slate-600">Your application for <strong>UI Designer</strong> was viewed.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                  <p className="text-slate-600">New job match: <strong>Backend Engineer</strong> at Google.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Helper Component ---
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}