import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import api from "../../api/api";
import { Trophy, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const UserRanking = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate(); // 2. Initialize navigate

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

  // Helper for colors
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
          <p className="text-slate-400">Click a candidate to view full analysis and manage status.</p>
        </header>

        {jobs.map((job) => (
          <div key={job.job_id} className="mb-12 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/50 px-8 py-5 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">{job.job_title}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-800">
                  {job.candidates.map((candidate, index) => {
                    const score = candidate.llm_score ?? candidate.vector_score ?? 0;
                    return (
                      <tr 
                        key={candidate.application_id} 
                        onClick={() => navigate(`/hr/application/${candidate.application_id}`)} // 3. Navigate on click
                        className="hover:bg-indigo-500/5 transition-all cursor-pointer group"
                      >
                        <td className="px-8 py-6 font-black text-slate-600 group-hover:text-indigo-400">#{index + 1}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold">
                              {candidate.applicant_name[0]}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white capitalize">{candidate.applicant_name}</div>
                              <div className="text-xs text-slate-500">{candidate.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${getScoreColor(score)}`} style={{ width: `${score}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-300">{score}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
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
    </div>
  );
};

export default UserRanking;