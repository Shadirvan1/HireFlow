import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { 
  X, ExternalLink, Mail, Calendar, Award, 
  ChevronRight, User, FileText, CheckCircle, 
  XCircle, Loader2, Trophy 
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserRanking = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/job/rankings/");
      setJobs(response.data.jobs || []);
    } catch (err) {
      toast.error("Could not load rankings.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (appId) => {
    setSelectedAppId(appId);
    setModalLoading(true);
    try {
      const response = await api.get(`/jobs/hr/candidate/application/${appId}/`);
      setCandidateDetail(response.data);
    } catch (err) {
      toast.error("Failed to fetch candidate details.");
      setSelectedAppId(null);
    } finally {
      setModalLoading(false);
    }
  };

  const updateCandidateStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/jobs/hr/candidate/application/${appId}/`, { status: newStatus });
      toast.success(`Candidate ${newStatus.toLowerCase()} successfully`);
      setCandidateDetail(prev => ({ ...prev, status: newStatus }));
      fetchRankings(); // Refresh the main list to show new status
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHORTLISTED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-slate-500";
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#0F172A]">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
      <p className="text-slate-400 font-medium">Analyzing Talent Pool...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-amber-500" size={28} />
            <h1 className="text-3xl font-black text-white tracking-tight">AI Talent Leaderboard</h1>
          </div>
          <p className="text-slate-400">Ranked candidates based on LLM analysis and vector matching.</p>
        </header>

        {jobs.map((job) => (
          <div key={job.job_id} className="mb-12 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">{job.job_title}</h2>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">{job.total_candidates} Applicants</p>
              </div>
              <div className="hidden md:block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold">
                Top Picks Identified
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Rank</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Candidate</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">AI Score</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {job.candidates.map((candidate, index) => {
                    const score = candidate.llm_score ?? candidate.vector_score ?? 0;
                    return (
                      <tr key={candidate.application_id} className="hover:bg-slate-800/30 transition-all group">
                        <td className="px-8 py-5 italic font-black text-slate-600 group-hover:text-indigo-400">
                          #{index + 1}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                               {candidate.applicant_name[0]}
                             </div>
                             <div>
                               <div className="text-sm font-bold text-white capitalize">{candidate.applicant_name}</div>
                               <div className="text-xs text-slate-500">{candidate.email}</div>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${getScoreColor(score)}`} style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-300">{score}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${getStatusStyle(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleViewProfile(candidate.application_id)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* --- SLIDE-OVER CANDIDATE DETAIL PANEL --- */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedAppId(null)} />
          
          <div className="relative w-full max-w-lg bg-[#111827] h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-slate-500 text-sm">Fetching Profile...</p>
              </div>
            ) : candidateDetail && (
              <>
                <div className="p-8 border-b border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <User size={40} />
                    </div>
                    <button onClick={() => setSelectedAppId(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
                      <X size={24} />
                    </button>
                  </div>
                  <h2 className="text-2xl font-black text-white capitalize">{candidateDetail.applicant_name}</h2>
                  <p className="text-slate-400 flex items-center gap-2 mt-1"><Mail size={14}/> {candidateDetail.email}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI Match</p>
                      <p className="text-2xl font-black text-emerald-400">{candidateDetail.llm_score}%</p>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Exp.</p>
                      <p className="text-2xl font-black text-white">{candidateDetail.experience} Yrs</p>
                    </div>
                  </div>

                  <section>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Application Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <Calendar size={18} className="text-slate-500" />
                        Applied on {new Date(candidateDetail.applied_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <Award size={18} className="text-slate-500" />
                        Top Skills: {candidateDetail.skills?.join(", ") || "Analysis Pending"}
                      </div>
                      {candidateDetail.resume_url && (
                        <a href={candidateDetail.resume_url} target="_blank" rel="noreferrer" 
                           className="flex items-center gap-3 text-indigo-400 text-sm font-bold hover:text-indigo-300">
                          <FileText size={18} /> View Original Resume <ExternalLink size={14}/>
                        </a>
                      )}
                    </div>
                  </section>
                </div>

                <div className="p-8 bg-slate-900/50 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => updateCandidateStatus(candidateDetail.application_id, "REJECTED")}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-all"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => updateCandidateStatus(candidateDetail.application_id, "SHORTLISTED")}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all"
                  >
                    <CheckCircle size={18} /> Shortlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRanking;