import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/api';
import { 
  MapPin, ArrowUpRight, Bookmark, Briefcase, Plus, 
  Building2, Search, ChevronLeft, ChevronRight, Calendar, 
  Inbox, Loader2, ArrowUpDown, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FindJobs() {
  const navigate = useNavigate();
  
  // Data State
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter & Search State
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [ordering, setOrdering] = useState('-created_at'); // Default: Newest First
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Note: Added v1 prefix if you are using URLPathVersioning
      const response = await api.get('jobs/get/all/jobs/', {
        params: {
          search: searchTitle,
          location: searchLocation,
          date_posted: dateFilter,
          ordering: ordering,
          page: currentPage
        }
      });

      const results = response.data.results || [];
      const count = response.data.count || 0;

      setJobs(results);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10));

      // Sync saved status
      const initialSavedIds = new Set(results.filter(j => j.is_saved).map(j => j.id));
      setSavedJobIds(initialSavedIds);

      // Auto-select first job on load
      if (results.length > 0) {
        setSelectedJob(results[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFilter, searchTitle, searchLocation, ordering]);

  // Effect: Auto-fetch when filters or pages change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, dateFilter, ordering, fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchJobs();
  };

  const resetFilters = () => {
    setSearchTitle('');
    setSearchLocation('');
    setDateFilter('all');
    setOrdering('-created_at');
    setCurrentPage(1);
  };

  const handleToggleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      await api.post(`jobs/job/save/${jobId}/`);
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.has(jobId) ? newSet.delete(jobId) : newSet.add(jobId);
        return newSet;
      });
    } catch (error) {
      console.error("Save failed");
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans flex flex-col">
      
      {/* 1. SEARCH & FILTER HEADER */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            
            {/* Title Search */}
            <div className="flex-1 min-w-[250px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
              <input 
                type="text"
                placeholder="Job title, description or company..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="w-full lg:w-48 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="text"
                placeholder="Location..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-blue-100 rounded-2xl outline-none font-bold text-sm transition-all"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            {/* Sort Logic */}
            <div className="relative">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
              <select 
                className="pl-10 pr-8 py-3 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
              <select 
                className="pl-10 pr-8 py-3 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
              Find Jobs
            </button>

            <button type="button" onClick={resetFilters} className="p-3 text-slate-400 hover:text-red-500 transition-colors" title="Clear Filters">
              <X size={20} />
            </button>
          </form>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-[1600px] mx-auto flex flex-1 w-full overflow-hidden">
        
        {/* LEFT: JOB FEED */}
        <aside className="w-full lg:w-[450px] border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {totalCount} Opportunities Found
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-xs font-bold uppercase italic tracking-widest">Syncing roles...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Inbox size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">No jobs match your search.</p>
                <button onClick={resetFilters} className="text-blue-600 text-xs font-black uppercase mt-2 hover:underline">Show All Jobs</button>
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 cursor-pointer border-b border-slate-100 transition-all relative ${selectedJob?.id === job.id ? 'bg-white shadow-md z-10' : 'hover:bg-white'}`}
                >
                  {selectedJob?.id === job.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg leading-tight ${selectedJob?.id === job.id ? 'text-blue-600' : 'text-slate-900'}`}>
                      {job.title}
                    </h3>
                    <button onClick={(e) => handleToggleSave(e, job.id)} className="text-slate-300 hover:text-blue-600">
                      <Bookmark size={18} fill={savedJobIds.has(job.id) ? "currentColor" : "none"} className={savedJobIds.has(job.id) ? "text-blue-600" : ""} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                    <Building2 size={14} /> {job.company?.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-500">
                      <MapPin size={10} /> {job.location}
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{(job.salary_min/100000).toFixed(1)}L+</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
            <button 
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button 
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </aside>

        {/* RIGHT: JOB DETAIL VIEW */}
        <section className="hidden lg:block flex-1 bg-white overflow-y-auto">
          {selectedJob ? (
            <div className="max-w-4xl mx-auto py-16 px-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl shadow-slate-200">
                    {selectedJob.company?.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter mb-2">{selectedJob.title}</h2>
                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">{selectedJob.company?.name} • Verified Hire</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/candidate/application/${selectedJob.id}`)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"
                >
                  Apply Now <ArrowUpRight size={18} />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-[2.5rem] mb-16">
                <StatCard label="Yearly Max" val={`₹${(selectedJob.salary_max/1000).toFixed(0)}k`} />
                <StatCard label="Experience" val={`${selectedJob.experience_required}Y+`} />
                <StatCard label="Type" val={selectedJob.job_type?.replace('_', ' ')} />
              </div>

              {/* Content sections */}
              <div className="space-y-12">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Job Overview</h4>
                  <p className="text-slate-600 text-xl leading-relaxed font-medium">{selectedJob.description}</p>
                </div>
                {selectedJob.requirements && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Requirements</h4>
                    <ul className="space-y-4">
                      {selectedJob.requirements.split('\n').map((req, i) => (
                        <li key={i} className="flex gap-3 text-slate-800 font-bold items-start">
                          <Plus size={16} className="text-blue-600 mt-1 shrink-0" /> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <Briefcase size={48} className="mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-[10px]">Select a role to view details</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, val }) {
  return (
    <div className="bg-white py-6 rounded-[2.2rem] text-center shadow-sm">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900 uppercase">{val}</p>
    </div>
  );
}