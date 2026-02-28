import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Power, 
  Building2,
  IndianRupee,
  Briefcase
} from "lucide-react";
import api from "../../api/api";

export default function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("jobs/hr/get/companyjobs/");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`jobs/hr/companyjobs/${id}/`, { is_active: !currentStatus });
      setJobs((prev) => prev.map((job) => job.id === id ? { ...job, is_active: !job.is_active } : job));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      await api.delete(`jobs/hr/companyjobs/${id}/`);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Jobs</h1>
        <button
          onClick={() => navigate("/hr/create-job")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Post New Job
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group bg-white border border-slate-200 rounded-[2rem] flex flex-col h-[550px] shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* 1. Header Area */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  job.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {job.is_active ? "Live" : "Inactive"}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {job.job_type?.replace("_", " ") || "Full Time"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{job.title}</h2>
              <div className="flex items-center gap-1 text-indigo-600 mt-1">
                <Building2 size={14} />
                <span className="text-sm font-bold">{job.company?.name || "Company"}</span>
              </div>
            </div>

            {/* 2. Scrollable Body Area */}
            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <MapPin size={14} /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <IndianRupee size={14} /> ₹{job.salary_min?.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {(job.requirements || "").split("\n").map((req, i) => (
                    req.trim() && (
                      <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                         <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                         {req}
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. FIXED FOOTER BUTTONS */}
            <div className="p-8 pt-4 border-t border-slate-50 flex gap-3 bg-white rounded-b-[2rem]">
              {/* BUTTON 1: TOGGLE STATUS */}
              <button
                onClick={() => handleToggle(job.id, job.is_active)}
                className={`flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  job.is_active
                    ? "bg-slate-900 text-white hover:bg-black"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                <Power size={16} />
                {job.is_active ? "Deactivate" : "Activate"}
              </button>

              {/* BUTTON 2: DELETE */}
              <button
                onClick={() => handleDelete(job.id)}
                className="flex-1 flex items-center justify-center py-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                title="Delete Job"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}