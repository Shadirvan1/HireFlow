import React, { useEffect, useState } from "react";
import api from "../../api/api";

const UserRanking = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/jobs/job/rankings/");
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch rankings:", err);
        setError("Could not load rankings.");
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  // 1. Logic for Status Badge Styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHORTLISTED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "APPLIED": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-indigo-50 text-indigo-600 border-indigo-100";
    }
  };
  console.log("Fetched Jobs Data:", jobs);

  // 2. Logic for Progress Bar Color based on Score
  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-500"; // High Match
    if (score >= 70) return "bg-amber-500";   // Good Match
    return "bg-slate-400";                    // Low Match
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">AI Talent <span className="text-indigo-600">Leaderboard</span></h1>
        </header>

        {jobs.map((job) => (
          <div key={job.job_id} className="mb-10 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Job Header */}
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white tracking-tight">{job.job_title}</h2>
              <span className="text-gray-400 text-sm">{job.total_candidates} Total Applicants</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Match Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {job.candidates.map((candidate, index) => {
                    const score = candidate.llm_score ?? candidate.vector_score ?? 0;
                    
                    return (
                      <tr key={candidate.application_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-400">
                          #{index + 1}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 capitalize">{candidate.applicant_name}</div>
                          <div className="text-xs text-gray-500">{candidate.email}</div>
                        </td>

                        {/* MATCH LEVEL BAR */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col w-40">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold text-gray-700">{score}% Match</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* STATUS BADGE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-50 shadow-sm">
                            View Profile
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
    </div>
  );
};

export default UserRanking;