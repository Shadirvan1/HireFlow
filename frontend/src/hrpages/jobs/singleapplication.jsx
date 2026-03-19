import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { 
  ArrowLeft, Mail, MapPin, FileText, 
  Loader2, ChevronDown, Calendar, Link as LinkIcon,
  Save, Phone, Globe, ExternalLink, Edit3
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const CandidateDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Local state for editable fields
  const [scheduleData, setScheduleData] = useState({
    scheduled_at: "",
    meeting_link: ""
  });

  const statusOptions = [
    { value: "APPLIED", label: "Applied", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { value: "SCHEDULED", label: "Scheduled", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    { value: "REJECTED", label: "Rejected", color: "text-red-400 border-red-500/20 bg-red-500/10" },
    { value: "HIRED", label: "Hired", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  ];

  useEffect(() => {
    fetchFullDetail();
  }, [appId]);

  const fetchFullDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/hr/candidate/application/${appId}/`);
      const data = response.data;
      setCandidate(data);
      
      // Initialize inputs with existing data
      setScheduleData({
        scheduled_at: data.scheduled_at ? data.scheduled_at.slice(0, 16) : "",
        meeting_link: data.meeting_link || ""
      });
    } catch (err) {
      toast.error("Profile not found");
      navigate("/rankings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    const updateToast = toast.loading("Saving changes...");
    setUpdating(true);
    try {
      const response = await api.patch(`/jobs/hr/candidate/application/${appId}/`, payload);
      
      // Accessing nested data from your Django response
      const updatedInfo = response.data.data;
      
      setCandidate(updatedInfo);
      
      // Reset local state to the new saved values to clear 'isDirty'
      setScheduleData({
        scheduled_at: updatedInfo.scheduled_at ? updatedInfo.scheduled_at.slice(0, 16) : "",
        meeting_link: updatedInfo.meeting_link || ""
      });

      toast.success("Interview details updated!", { id: updateToast });
    } catch (err) {
      toast.error("Failed to save. Check your link format.", { id: updateToast });
    } finally {
      setUpdating(false);
    }
  };

  // Compare local inputs vs current candidate object to see if user edited anything
  const isDirty = 
    scheduleData.meeting_link !== (candidate?.meeting_link || "") || 
    scheduleData.scheduled_at !== (candidate?.scheduled_at ? candidate.scheduled_at.slice(0, 16) : "");

  if (loading) return (
    <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
      <p className="text-slate-500 animate-pulse font-bold tracking-widest">LOADING PROFILE</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 md:p-12 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-all group font-bold text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> BACK TO LIST
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative">
          
          {/* Top Section: Avatar & Status */}
          <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl ring-4 ring-indigo-500/10 uppercase">
                {candidate.applicant_name?.[0]}
              </div>
              <div>
                <h1 className="text-4xl font-black capitalize tracking-tight leading-tight">{candidate.applicant_name}</h1>
                <p className="text-indigo-400 font-bold text-lg mt-1 uppercase tracking-widest">{candidate.job_title}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 text-slate-400">
                   <span className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl text-sm border border-slate-700/50">
                     <Mail size={14} className="text-indigo-400"/> {candidate.email}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-[240px]">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Application Status</label>
              <div className="relative group">
                <select 
                  value={candidate.status}
                  onChange={(e) => handleUpdate({ status: e.target.value })}
                  className={`appearance-none w-full px-6 py-4 rounded-2xl border-2 font-bold cursor-pointer transition-all outline-none 
                    ${statusOptions.find(opt => opt.value === candidate.status)?.color || "bg-slate-800 border-slate-700"}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900 text-white font-sans">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={20} />
              </div>
            </div>
          </div>

          {/* Interview Scheduling - Re-editable Section */}
          {candidate.status === "SCHEDULED" && (
            <div className="bg-indigo-500/[0.03] border border-indigo-500/20 rounded-[2rem] p-6 md:p-8 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Calendar size={18} /> {candidate.meeting_link ? "EDIT INTERVIEW" : "SCHEDULE INTERVIEW"}
                </h3>
                {isDirty && (
                  <span className="text-[9px] font-black bg-amber-500 text-black px-2 py-0.5 rounded uppercase tracking-tighter">Pending Save</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Date & Time</label>
                  <input 
                    type="datetime-local"
                    value={scheduleData.scheduled_at}
                    onChange={(e) => setScheduleData({...scheduleData, scheduled_at: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-3.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Meeting Link</label>
                  <div className="relative">
                    <input 
                      type="url"
                      placeholder="Paste Zoom/Meet link here..."
                      value={scheduleData.meeting_link}
                      onChange={(e) => setScheduleData({...scheduleData, meeting_link: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-3.5 pl-12 text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleUpdate(scheduleData)}
                disabled={updating || !isDirty}
                className={`mt-8 flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl 
                  ${isDirty 
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 scale-100" 
                    : "bg-slate-800 text-slate-600 cursor-not-allowed scale-95 opacity-50 shadow-none"}`}
              >
                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {candidate.meeting_link ? "UPDATE SAVED DETAILS" : "CONFIRM SCHEDULE"}
              </button>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center md:text-left">
             <div className="bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-800/50">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Experience</p>
               <p className="text-xl font-bold">{candidate.experience} Yrs</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-800/50">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">AI Score</p>
               <p className="text-xl font-bold text-emerald-500">92/100</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-800/50">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Status</p>
               <p className="text-sm font-bold truncate uppercase">{candidate.status}</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-800/50">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Applied</p>
               <p className="text-sm font-bold">{new Date(candidate.applied_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href={candidate.resume} target="_blank" rel="noreferrer" className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-center font-black transition-all border border-slate-700 flex items-center justify-center gap-3 text-xs tracking-widest uppercase">
              <FileText size={20} /> View Resume
            </a>
            
            {candidate.meeting_link && candidate.status === "SCHEDULED" && (
              <a href={candidate.meeting_link} target="_blank" rel="noreferrer" className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 text-center flex items-center justify-center gap-3 text-xs tracking-widest uppercase">
                Join Now <ExternalLink size={18}/>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;