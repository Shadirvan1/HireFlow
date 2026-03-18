import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/api';
import { 
  Briefcase, MapPin, Calendar, CheckCircle2, 
  XCircle, Timer, ExternalLink, ChevronLeft, 
  ChevronRight, Inbox, Loader2 
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('jobs/my-applications/', {
        params: { page: currentPage }
      });
      
      const results = response.data.results || [];
      const count = response.data.count || 0;

      setApplications(results);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]); 
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchApplications();
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchApplications]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Syncing your journey...</p>
    </div>
  );

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20 pt-10 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-500 font-medium mt-2">Track your progress with top companies</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Submitted</span>
            <p className="text-2xl font-black text-blue-600">{totalCount}</p>
          </div>
        </header>

        {applications.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No applications yet</h3>
            <p className="text-slate-500 mt-2 mb-8">Start your career journey by applying to jobs.</p>
            <button 
              onClick={() => window.location.href = '/find-jobs'} 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <>
            {/* APPLICATION LIST */}
            <div className="space-y-6">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>

            {/* MODERN PAGINATION BAR */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-5">
                <div className="flex items-center gap-3">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                    <span className="text-sm font-black text-slate-900">
                      {currentPage} <span className="text-slate-200 mx-2">|</span> {totalPages}
                    </span>
                  </div>

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm active:scale-95"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-4 py-1.5 rounded-full">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} Applications
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ app }) {
  const statusConfig = {
    APPLIED: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Timer size={16} />, label: 'Under Review' },
    SHORTLISTED: { color: 'text-purple-600', bg: 'bg-purple-50', icon: <CheckCircle2 size={16} />, label: 'Shortlisted' },
    SCHEDULED: { color: 'text-orange-600', bg: 'bg-orange-50', icon: <Calendar size={16} />, label: 'Interview Scheduled' },
    REJECTED: { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={16} />, label: 'Not Selected' },
    HIRED: { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 size={16} />, label: 'Hired' },
  };

  const currentStatus = statusConfig[app.status] || statusConfig.APPLIED;

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* JOB INFO */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${currentStatus.bg} ${currentStatus.color}`}>
              {currentStatus.icon} {currentStatus.label}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              Applied {new Date(app.applied_at).toLocaleDateString()}
            </span>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
            {app.job?.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400">
                <Briefcase size={14} />
              </div>
              {app.job?.company?.name}
            </div>
            <div className="flex items-center gap-1.5 border-l pl-4 border-slate-200">
              <MapPin size={16} className="text-slate-400" />
              {app.job?.location}
            </div>
          </div>
        </div>

        {/* STATUS / ACTION AREA */}
        <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
          {app.status === 'SCHEDULED' && app.meeting_link ? (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Action Required</p>
              <a 
                href={app.meeting_link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                Join Interview <ExternalLink size={14} />
              </a>
              <p className="text-[10px] text-slate-400 font-medium italic">
                {new Date(app.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          ) : (
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Current Stage</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">
                {app.status === 'APPLIED' ? 'Recruiter is reviewing your profile' : 'Processing your application'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}