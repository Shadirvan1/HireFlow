import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { 
  MapPin, Calendar, CircleDollarSign, 
  ChevronLeft, Bookmark, ArrowUpRight, 
  Building2, Briefcase, CheckCircle2,
  Clock, ShieldCheck, Globe, Zap
} from 'lucide-react';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`jobs/get/job/${jobId}/`);
        
        // FIX: Extract the nested 'job' object if it exists
        // If your API returns { job: { ...data } }, we use response.data.job
        const jobData = response.data.job ? response.data.job : response.data;
        
        setJob(jobData);
        setIsSaved(jobData.is_saved || false);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleToggleSave = async () => {
    try {
      await api.post(`jobs/job/save/${jobId}/`);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving job");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
       <div className="w-12 h-12 border-4 border-t-blue-600 border-slate-100 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!job) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Job not found.</div>;

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20 font-sans text-slate-900">
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handleToggleSave}
              className={`p-3 rounded-xl border transition-all ${isSaved ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
            >
              <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={() => navigate(`/candidate/application/${job.id}`)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              Apply Now <ArrowUpRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN CONTENT (LEFT) */}
          <div className="lg:col-span-8">
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                  {job.job_type?.replace('_', ' ')}
                </span>
                {job.is_automatic && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Zap size={12} fill="currentColor"/> AI Interview Ready
                  </span>
                )}
                <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                  ATS Score: {job.ats_ascore}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap gap-6 items-center text-slate-500 font-bold">
                <div className="flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600"/>
                  <span className="text-slate-900">{job.company?.name}</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
                  <MapPin size={20} className="text-slate-400"/>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
                  <Calendar size={20} className="text-slate-400"/>
                  <span>Deadline: {job.deadline}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <HighlightCard 
                title="Salary Range" 
                value={`₹${Math.floor(job.salary_min / 1000 || 0)}k - ₹${Math.floor(job.salary_max / 1000 || 0)}k`} 
                sub="Estimated Monthly"
              />
              <HighlightCard 
                title="Experience" 
                value={`${job.experience_required} Year+`} 
                sub="Level"
              />
              <HighlightCard 
                title="Work Mode" 
                value="In Person" 
                sub={job.location}
              />
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                Description
              </h3>
              
              <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-line text-lg font-medium">
                {job.description}
              </div>
            </div>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-28">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black">
                {job.company?.name?.charAt(0)}
              </div>
              <h3 className="text-2xl font-black mb-2">{job.company?.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Official startup recognized by Startup India.
              </p>
              
              <div className="space-y-4 mb-8">
                <SideInfo label="Industry" value={job.company?.industry} />
                <SideInfo label="Team Size" value={job.company?.company_size} />
                <SideInfo label="Headquarters" value={job.company?.headquarters} />
              </div>

              <a 
                href={job.company?.website} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full text-center py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-50 transition-all"
              >
                Visit Website
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components
function HighlightCard({ title, value, sub }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}

function SideInfo({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
      <span className="text-slate-500 font-bold">{label}</span>
      <span className="font-black text-slate-200 uppercase text-[10px] tracking-widest">{value}</span>
    </div>
  );
}