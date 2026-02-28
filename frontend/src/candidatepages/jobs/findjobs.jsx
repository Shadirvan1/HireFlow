import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { 
  MapPin, 
  ArrowUpRight, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FindJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
 const navigate = useNavigate()
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('jobs/get/all/jobs/');
        const data = Array.isArray(response.data) ? response.data : [];
        setJobs(data);
        if (data.length > 0) setSelectedJob(data[0]);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);


  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
       <div className="w-6 h-6 border-2 border-t-black border-slate-200 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-6 border-b border-slate-100 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-slate-500 text-sm">Showing {jobs.length} open positions</p>
        </div>
        <div className="flex gap-4">
            <button className="text-sm font-medium px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition">Filter</button>
            <button className="text-sm font-medium px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition">Saved Jobs</button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto flex h-[calc(100vh-100px)]">
        
        {/* LEFT SIDE: Feed */}
        <div className="w-full lg:w-[450px] border-r border-slate-100 overflow-y-auto overflow-x-hidden">
          {jobs.map((job) => (
            <div 
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-6 cursor-pointer border-b border-slate-50 transition-all relative ${
                selectedJob?.id === job.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'
              }`}
            >
              {selectedJob?.id === job.id && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-black"></div>
              )}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
                    {typeof job.job_type === 'string' ? job.job_type.replace('_', ' ') : 'Full Time'}
                  </p>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {String(job.title || 'Untitled Role')}
                  </h3>

                  <p className="text-slate-500 text-sm mb-3">
                    {job.company && typeof job.company === 'object' 
                      ? String(job.company.name || "Trickstrove") 
                      : "Trickstrove"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {String(job.location || 'Remote')}</span>
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                        ₹{job.salary_min ? parseInt(job.salary_min).toLocaleString() : 'Negotiable'}+
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 mt-6" />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: Detail */}
        <div className="hidden lg:block flex-1 bg-white overflow-y-auto">
          {selectedJob ? (
            <div className="max-w-[800px] mx-auto py-12 px-10">
              <div className="flex justify-between items-start mb-12">
                <div className="w-16 h-16 border border-slate-200 rounded-xl flex items-center justify-center text-xl font-bold bg-slate-50">
                  {/* SAFE CHAR ACCESS */}
                  {selectedJob.company?.name ? String(selectedJob.company.name).charAt(0) : 'T'}
                </div>
                <button onClick={()=>navigate(`/candidate/application/${selectedJob.id}`)} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition shadow-lg shadow-zinc-200">
                  Apply Now <ArrowUpRight size={16}/>
                </button>
              </div>

              

              <h2 className="text-5xl font-black tracking-tighter mb-4">{String(selectedJob.title)}</h2>
              
              <div className="flex gap-8 mb-12 border-b border-slate-100 pb-8 text-sm">
                <div>
                  <p className="text-slate-400 font-bold mb-1 uppercase text-[10px]">Salary</p>
                  <p className="font-bold">₹{parseInt(selectedJob.salary_min || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold mb-1 uppercase text-[10px]">Exp Required</p>
                  <p className="font-bold">{String(selectedJob.experience_required || 0)}+ Years</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold mb-1 uppercase text-[10px]">Deadline</p>
                  <p className="font-bold">{String(selectedJob.deadline || 'N/A')}</p>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Role Summary</h4>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">
                    {String(selectedJob.description || '')}
                  </p>
                </section>

                <div className="grid grid-cols-2 gap-12">
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Key Responsibilities</h4>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {String(selectedJob.responsibilities || '')}
                        </p>
                    </section>
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Requirements</h4>
                        <ul className="space-y-3">
                            {selectedJob.requirements?.split('\r\n').map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                    {String(req)}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        About {selectedJob.company?.name ? String(selectedJob.company.name) : 'the company'}
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Industry</p>
                            <p className="text-sm font-bold">{String(selectedJob.company?.industry || 'IT')}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Scale</p>
                            <p className="text-sm font-bold">{String(selectedJob.company?.company_size || '100+')} People</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Location</p>
                            <p className="text-sm font-bold">{String(selectedJob.company?.headquarters || 'Remote')}</p>
                        </div>
                    </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300">
              <p className="font-medium">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}