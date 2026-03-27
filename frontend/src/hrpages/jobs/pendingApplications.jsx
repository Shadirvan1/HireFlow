import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const HRApprovalDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('jobs/hr/pending-approvals/');
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setLoading(false);
    }
  };

  const handleDecision = async (id, finalStatus) => {
    try {
      await api.patch(`jobs/hr/approve/${id}/`, {
        status: finalStatus
      });
      
      setApplications(applications.filter(app => app.id !== id));
      alert(`Candidate successfully ${finalStatus}`);
    } catch (err) {
      console.error(err)
      alert("Error updating status");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Smile Raccoon Queue...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Pending AI Evaluations</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="px-5 py-3 border-b text-left">Candidate</th>
              <th className="px-5 py-3 border-b text-left">AI Score</th>
              <th className="px-5 py-3 border-b text-left">AI Reasoning</th>
              <th className="px-5 py-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b">
                  <p className="font-semibold">{app.applicant_name} {app.applicant_last_name}</p>
                  <p className="text-xs text-gray-500">{app.applicant_email}</p>
                </td>
                <td className="px-5 py-5 border-b">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${app.score >= 7 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {app.score}/10
                  </span>
                </td>
                <td className="px-5 py-5 border-b max-w-md">
                  <p className="text-sm text-gray-700 italic">"{app.ai_reasoning}"</p>
                  <details className="mt-2 text-xs text-blue-600 cursor-pointer">
                    <summary>View Score Analysis</summary>
                    <p className="p-2 bg-gray-100 rounded mt-1 text-gray-600">{app.score_analysis}</p>
                  </details>
                </td>
                <td className="px-5 py-5 border-b text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => handleDecision(app.id, 'HIRED')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm transition"
                    >
                      HIRED
                    </button>
                    <button
                      onClick={() => handleDecision(app.id, 'REJECTED')}
                      className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50 text-sm transition"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p className="p-10 text-center text-gray-500">No applications pending approval.</p>}
      </div>
    </div>
  );
};

export default HRApprovalDashboard;