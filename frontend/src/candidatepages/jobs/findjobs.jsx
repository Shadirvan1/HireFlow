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
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [ordering, setOrdering] = useState('-created_at');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
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

      const initialSavedIds = new Set(results.filter(j => j.is_saved).map(j => j.id));
      setSavedJobIds(initialSavedIds);

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

  useEffect(() => {
    fetchJobs();
  }, [currentPage, dateFilter, ordering, fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
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
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fadeup { animation: fadeUp 0.3s ease both; }
        .hide-scrollbar::-webkit-scrollbar { width: 4px; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .hide-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
      `}</style>

      <div className="min-h-screen bg-slate-50 flex flex-col">

        {/* ── STICKY HEADER ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="w-[90%] mx-auto py-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">

              {/* Title */}
              <div className="relative flex-1 min-w-[200px] group">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, description or company..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-blue-200 focus:ring-0 transition-all"
                />
              </div>

              {/* Location */}
              <div className="relative w-40 group">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-blue-200 transition-all"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none hover:bg-slate-200 focus:bg-white focus:border-blue-200 transition-all"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                </select>
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none hover:bg-slate-200 focus:bg-white focus:border-blue-200 transition-all"
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 whitespace-nowrap"
              >
                Find Jobs
              </button>

              <button
                type="button"
                onClick={resetFilters}
                title="Clear filters"
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <X size={17} />
              </button>

            </form>
          </div>
        </header>

        {/* ── MAIN BODY ── */}
        <div className="w-[90%] mx-auto flex-1 flex flex-col py-5">
          <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white" style={{ height: 'calc(100vh - 130px)' }}>

            {/* ── LEFT: JOB FEED ── */}
            <aside className="w-[400px] shrink-0 border-r border-slate-100 flex flex-col">

              {/* Feed count */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 rounded-tl-2xl">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">
                  {totalCount} Opportunities Found
                </span>
              </div>

              {/* Job list */}
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-3 text-slate-300">
                    <Loader2 size={22} className="animate-spin" />
                    <p className="text-xs font-semibold">Loading roles...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-3 px-8 text-center">
                    <Inbox size={34} className="text-slate-300 opacity-40" />
                    <p className="text-sm font-semibold text-slate-400">No jobs match your search.</p>
                    <button onClick={resetFilters} className="text-xs font-bold text-blue-600 hover:underline mt-1">
                      Show All Jobs
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => {
                    const active = selectedJob?.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`relative px-5 py-4 cursor-pointer border-b border-slate-100 transition-colors
                          ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 rounded-r-sm" />}

                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`text-[14.5px] font-semibold leading-snug transition-colors ${active ? 'text-blue-600' : 'text-slate-900'}`}>
                            {job.title}
                          </h3>
                          <button
                            onClick={(e) => handleToggleSave(e, job.id)}
                            aria-label={savedJobIds.has(job.id) ? 'Unsave' : 'Save'}
                            className={`shrink-0 transition-colors ${savedJobIds.has(job.id) ? 'text-blue-600' : 'text-slate-300 hover:text-blue-400'}`}
                          >
                            <Bookmark size={16} fill={savedJobIds.has(job.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 mb-3">
                          <Building2 size={12} /> {job.company?.name}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                            <MapPin size={9} /> {job.location}
                          </span>
                          <span className="text-[13px] font-bold text-slate-800">
                            ₹{(job.salary_min / 100000).toFixed(1)}L+
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white rounded-bl-2xl">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
                  Page {currentPage} / {totalPages || 1}
                </span>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </aside>

            {/* ── RIGHT: JOB DETAIL ── */}
            <section className="hidden lg:flex flex-1 flex-col overflow-y-auto hide-scrollbar bg-white rounded-r-2xl">
              {selectedJob ? (
                <div className="max-w-2xl mx-auto w-full px-10 py-10 anim-fadeup">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-[52px] h-[52px] rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[20px] font-extrabold shrink-0 shadow-md">
                        {selectedJob.company?.name?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight mb-1">
                          {selectedJob.title}
                        </h2>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.12em]">
                          {selectedJob.company?.name} · Verified Hire
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/candidate/application/${selectedJob.id}`)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-100 transition-all shrink-0"
                    >
                      Apply Now <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-2xl p-1 mb-8">
                    <StatCard label="Yearly Max" val={`₹${(selectedJob.salary_max / 1000).toFixed(0)}k`} />
                    <StatCard label="Experience" val={`${selectedJob.experience_required}Y+`} />
                    <StatCard label="Type" val={selectedJob.job_type?.replace('_', ' ')} />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-8">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.22em] mb-3">
                        Job Overview
                      </p>
                      <p className="text-[15px] text-slate-600 leading-[1.8] font-normal">
                        {selectedJob.description}
                      </p>
                    </div>

                    {selectedJob.requirements && (
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.22em] mb-3">
                          Requirements
                        </p>
                        <ul className="flex flex-col gap-3">
                          {selectedJob.requirements.split('\n').map((req, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[14px] font-medium text-slate-800 leading-snug">
                              <Plus size={14} className="text-blue-600 mt-0.5 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300">
                  <Briefcase size={42} className="opacity-20" />
                  <p className="text-[10.5px] font-bold uppercase tracking-widest">
                    Select a role to view details
                  </p>
                </div>
              )}
            </section>

          </div>
        </div>

      </div>
    </>
  );
}

function StatCard({ label, val }) {
  return (
    <div className="bg-white rounded-xl py-4 px-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-base font-extrabold text-slate-900 uppercase tracking-tight">{val}</p>
    </div>
  );
}