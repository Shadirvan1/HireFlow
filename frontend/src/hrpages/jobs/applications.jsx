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
        // Based on your backend log, the data is in response.data.jobs
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch rankings:", err);
        setError("Could not load rankings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-10 text-red-500 font-medium">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            AI Talent <span className="text-indigo-600">Leaderboard</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Ranked candidates based on AI vector similarity and LLM evaluation.
          </p>
        </header>

        {jobs.map((job) => (
          <div
            key={job.job_id}
            className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Job Header */}
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {job.job_title}
              </h2>
              <span className="bg-indigo-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {job.total_candidates} Applicants
              </span>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              {job.candidates.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vector Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {job.candidates.map((candidate, index) => (
                      <tr
                        key={candidate.application_id}
                        className="hover:bg-indigo-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 ? (
                              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 font-bold shadow-sm">
                                🥇
                              </span>
                            ) : index === 1 ? (
                              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-500 font-bold shadow-sm">
                                🥈
                              </span>
                            ) : (
                              <span className="text-gray-500 font-medium pl-3">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 capitalize">
                            {candidate.applicant_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate.email}
                          </div>
                        </td>
                        {/* ... inside your map function ... */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-indigo-600 mr-2">
                              
                              {candidate.llm_score !== null &&
                              candidate.llm_score !== undefined
                                ? `${candidate.llm_score}% `
                                : `${candidate.vector_score}% `}
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${candidate.llm_score ? "bg-emerald-500" : "bg-indigo-500"}`}
                                style={{
                                  width: `${candidate.llm_score ?? candidate.vector_score}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 font-bold border border-indigo-600 px-4 py-1 rounded-lg hover:bg-indigo-50 transition-all">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 text-center text-gray-400 italic">
                  No candidates ranked for this position yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRanking;
