import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { MapPin, ArrowUpRight, Trash2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('jobs/get/saved/');
      setSavedJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      // Reusing your existing toggle endpoint
      await api.post(`jobs/job/save/${jobId}/`);
      // Update local state to remove the item immediately
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Saved Opportunities</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage the roles you've bookmarked for later.</p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid gap-4">
          {savedJobs.map((job) => (
            <div 
              key={job.id}
              className="group bg-white border border-slate-100 p-6 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400">
                  {job.company?.name?.charAt(0) || 'J'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-slate-500 text-sm font-medium">{job.company?.name}</span>
                    <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase bg-slate-50 px-2 py-0.5 rounded">
                      <MapPin size={10}/> {job.location || 'Remote'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleRemove(job.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  title="Remove from saved"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => navigate(`/candidate/job/${job.id}`)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all"
                >
                  View Details <ArrowUpRight size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Briefcase className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No saved jobs yet</p>
          <button 
            onClick={() => navigate('/candidate/jobs')}
            className="mt-6 text-blue-600 font-bold hover:underline"
          >
            Browse active roles
          </button>
        </div>
      )}
    </div>
  );
}