import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // Your Axios instance
import { Mail, Phone, MapPin, Linkedin, Github, FileText, ExternalLink } from 'lucide-react'; // Optional icons
import { useNavigate } from 'react-router-dom';

const HiredCandidatesRoster = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate()
  useEffect(() => {
    const fetchHired = async () => {
      try {
        const response = await api.get('jobs/hr/hired/candidates/');
        setCandidates(response.data.results);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hired roster", err);
        setLoading(false);
      }
    };
    fetchHired();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-medium">Loading Employee Roster...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hired Talent</h1>
            <p className="text-gray-500">Official list of candidates who have joined the team.</p>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search by name or role..."
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div onClick={()=>navigate(`/hr/application/${candidate.id}`)} key={candidate.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {candidate.first_name} {candidate.last_name}
                  </h2>
                  <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mt-1">
                    {candidate.job_title}
                  </p>
                </div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                  Confirmed
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="w-5 text-gray-400">📧</span>
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 underline-offset-2 hover:underline">
                    {candidate.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="w-5 text-gray-400">📞</span>
                  <span>{candidate.phone || "N/A"}</span>
                </div>
               
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {candidate.resume && (
                  <a 
                    href={candidate.resume} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 text-center bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    View Resume
                  </a>
                )}
                <div className="flex gap-2">
                  {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      in
                    </a>
                  )}
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                      git
                    </a>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-[10px] text-gray-400 text-center italic">
                Hired on {new Date(candidate.applied_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hired candidates found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiredCandidatesRoster;