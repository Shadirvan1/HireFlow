import React, { useEffect, useState } from "react";
import api from "../../api/api"; // Your Axios instance
import { 
  Video, FileText, Calendar, User, Copy, Check, 
  ExternalLink, UserPlus, Loader2, Search, Filter 
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";

export default function ScheduledInterviews() {
  // --- States ---
  const [interviews, setInterviews] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user info from Redux
  const userRole = useSelector((state) => state.user.role);

  // --- Effects ---
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
     
      const [intvRes, staffRes] = await Promise.all([
        api.get("jobs/scheduled-interviews/"),
        api.get("jobs/interviewers/list/") 
      ]);
      setInterviews(intvRes.data.results || intvRes.data || []);
      setInterviewers(staffRes.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to sync with server");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInterviewer = async (applicationId, interviewerId) => {
    setAssigningId(applicationId);
    try {
      await api.patch(`jobs/assign/interviewer/${applicationId}/`, {
        interviewer_id: interviewerId || null
      });


      setInterviews(prev => prev.map(item => 
        item.id === applicationId ? { ...item, interviewer: interviewerId } : item
      ));
      
      toast.success("Assignment updated successfully");
    } catch (err) {
      toast.error("Update failed. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };

  const copyLink = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic for search
  const filteredInterviews = interviews.filter(i => 
    i.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* --- Header Section --- */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Interviews
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-tighter">
                {userRole === "HR" ? "Admin Access" : "Interviewer"}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Showing {filteredInterviews.length} upcoming sessions
            </p>
          </div>

          <div className="relative group w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search candidates or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* --- List Section --- */}
      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="animate-pulse">Loading schedule...</p>
          </div>
        ) : filteredInterviews.length > 0 ? (
          filteredInterviews.map((interview) => (
            <div 
              key={interview.id} 
              className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 flex flex-col xl:flex-row items-center gap-6 hover:bg-slate-800/20 transition-all duration-300 group"
            >
              {/* Profile info */}
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                  <User className="text-slate-500 group-hover:text-blue-400" size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{interview.candidate_name || "Applicant"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {interview.job_title}
                    </span>
                  </div>
                </div>
              </div>

              {/* HR Assignment Dropdown */}
              {userRole === "HR" && (
                <div className="flex flex-col gap-1.5 w-full xl:w-64">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <UserPlus size={12} /> Assign To
                  </span>
                  <div className="relative">
                    <select
                      value={interview.interviewer || ""}
                      disabled={assigningId === interview.id}
                      onChange={(e) => handleAssignInterviewer(interview.id, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none disabled:opacity-50"
                    >
                      <option value="">Unassigned</option>
                      {interviewers.map(u => (
                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name || u.email}</option>
                      ))}
                    </select>
                    {assigningId === interview.id ? (
                      <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin text-blue-400" />
                    ) : (
                      <Filter size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                    )}
                  </div>
                </div>
              )}

              {/* Timing */}
              <div className="flex items-center gap-4 px-6 border-x border-slate-800/50 hidden lg:flex">
                <Calendar className="text-slate-500" size={20} />
                <div>
                  <p className="text-sm font-bold text-white leading-none mb-1">
                    {new Date(interview.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full xl:w-auto">
                {interview.resume && (
                  <a href={interview.resume} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700">
                    <FileText size={20} />
                  </a>
                )}
                <button 
                  onClick={() => copyLink(interview.meeting_link, interview.id)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"
                >
                  {copiedId === interview.id ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
                <a 
                  href={interview.meeting_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  <Video size={18} /> Join
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2rem]">
            <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-white text-xl font-semibold">No interviews found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}