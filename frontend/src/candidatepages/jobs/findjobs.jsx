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
        /* ── RESET & BASE ── */
        .fj-root *, .fj-root *::before, .fj-root *::after { box-sizing: border-box; }
        .fj-root {
          background: #f5f7fa;
          min-height: 100vh;
          color: #1a1f36;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── SEARCH HEADER ── */
        .fj-header {
          border-bottom: 1px solid #e8eaef;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .fj-header-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 14px 24px;
        }
        .fj-search-form {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        /* input group */
        .fj-input-wrap {
          position: relative;
          flex: 1;
          min-width: 240px;
        }
        .fj-input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.15s;
        }
        .fj-input-wrap:focus-within svg { color: #2563eb; }

        .fj-input {
          width: 100%;
          padding: 10px 14px 10px 42px;
          background: #f3f4f6;
          border: 1.5px solid transparent;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1f36;
          outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .fj-input::placeholder { color: #9ca3af; font-weight: 400; }
        .fj-input:focus {
          background: #fff;
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }

        .fj-input-loc {
          width: 100%;
          max-width: 200px;
        }

        /* selects */
        .fj-select-wrap {
          position: relative;
        }
        .fj-select-wrap svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .fj-select {
          padding: 10px 36px 10px 38px;
          background: #f3f4f6;
          border: 1.5px solid transparent;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .fj-select:hover { background: #e9ebee; }
        .fj-select:focus { border-color: #93c5fd; background: #fff; }

        /* buttons */
        .fj-btn-search {
          padding: 10px 24px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.18);
        }
        .fj-btn-search:hover { background: #1d4ed8; box-shadow: 0 4px 14px rgba(37,99,235,0.28); }
        .fj-btn-search:active { transform: scale(0.97); }

        .fj-btn-clear {
          padding: 10px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .fj-btn-clear:hover { color: #ef4444; background: #fef2f2; }

        /* ── MAIN LAYOUT ── */
        .fj-main {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex: 1;
          width: 100%;
          overflow: hidden;
        }

        /* ── LEFT PANEL (feed) ── */
        .fj-feed {
          width: 420px;
          flex-shrink: 0;
          border-right: 1px solid #e8eaef;
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        @media (max-width: 1024px) { .fj-feed { width: 100%; } }

        .fj-feed-header {
          padding: 12px 20px;
          border-bottom: 1px solid #f0f1f5;
          background: #fafbfc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fj-feed-count {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        .fj-feed-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e2e5eb transparent;
        }
        .fj-feed-list::-webkit-scrollbar { width: 4px; }
        .fj-feed-list::-webkit-scrollbar-track { background: transparent; }
        .fj-feed-list::-webkit-scrollbar-thumb { background: #e2e5eb; border-radius: 4px; }

        /* loading / empty states */
        .fj-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 260px;
          color: #c0c4ce;
          gap: 10px;
        }
        .fj-state p { font-size: 13px; font-weight: 500; }
        .fj-state-btn {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background: none;
          border: none;
          cursor: pointer;
          margin-top: 4px;
          text-decoration: underline;
        }

        /* job card in feed */
        .fj-job-card {
          padding: 18px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f1f5;
          position: relative;
          transition: background 0.12s;
          background: #fff;
        }
        .fj-job-card:hover { background: #f8f9fc; }
        .fj-job-card.selected { background: #eff6ff; }
        .fj-job-card.selected::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #2563eb;
          border-radius: 0 2px 2px 0;
        }

        .fj-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5px;
        }
        .fj-card-title {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
          color: #1a1f36;
          transition: color 0.12s;
        }
        .fj-job-card.selected .fj-card-title { color: #2563eb; }

        .fj-save-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          padding: 2px;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .fj-save-btn:hover { color: #2563eb; }
        .fj-save-btn.saved { color: #2563eb; }

        .fj-card-company {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 14px;
        }

        .fj-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .fj-location-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
        }
        .fj-salary {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a1f36;
        }

        /* pagination */
        .fj-pagination {
          padding: 12px 16px;
          background: #fff;
          border-top: 1px solid #f0f1f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fj-page-btn {
          padding: 7px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #e8eaef;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.12s;
        }
        .fj-page-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
        .fj-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .fj-page-info {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── RIGHT PANEL (detail) ── */
        .fj-detail {
          flex: 1;
          background: #fff;
          overflow-y: auto;
          display: none;
          scrollbar-width: thin;
          scrollbar-color: #e2e5eb transparent;
        }
        .fj-detail::-webkit-scrollbar { width: 4px; }
        .fj-detail::-webkit-scrollbar-thumb { background: #e2e5eb; border-radius: 4px; }
        @media (min-width: 1024px) { .fj-detail { display: block; } }

        .fj-detail-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 48px 80px;
          animation: fjFadeUp 0.3s ease;
        }
        @keyframes fjFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fj-detail-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 36px;
          gap: 16px;
        }
        .fj-detail-left { display: flex; align-items: center; gap: 18px; }

        .fj-company-logo {
          width: 56px;
          height: 56px;
          background: #1a1f36;
          color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(26,31,54,0.18);
        }

        .fj-detail-job-title {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #1a1f36;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .fj-detail-company {
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .fj-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 12px 24px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.22);
        }
        .fj-apply-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.28);
        }

        /* stats bar */
        .fj-stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          background: #f0f1f5;
          border-radius: 16px;
          padding: 3px;
          margin-bottom: 40px;
        }
        .fj-stat-card {
          background: #fff;
          border-radius: 13px;
          padding: 18px 12px;
          text-align: center;
        }
        .fj-stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9ca3af;
          margin-bottom: 5px;
        }
        .fj-stat-val {
          font-size: 17px;
          font-weight: 800;
          color: #1a1f36;
          text-transform: uppercase;
          letter-spacing: -0.3px;
        }

        /* content sections */
        .fj-content { display: flex; flex-direction: column; gap: 36px; }
        .fj-section-label {
          font-size: 10px;
          font-weight: 800;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin-bottom: 14px;
        }
        .fj-description {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.75;
          font-weight: 400;
        }
        .fj-req-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .fj-req-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 14.5px;
          font-weight: 500;
          color: #1a1f36;
          line-height: 1.5;
        }
        .fj-req-icon {
          color: #2563eb;
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* empty detail state */
        .fj-detail-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          gap: 12px;
        }
        .fj-detail-empty p {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
      `}</style>

      <div className="fj-root">

        {/* 1. SEARCH & FILTER HEADER */}
        <header className="fj-header">
          <div className="fj-header-inner">
            <form onSubmit={handleSearchSubmit} className="fj-search-form">

              <div className="fj-input-wrap">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Job title, description or company..."
                  className="fj-input"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                />
              </div>

              <div className="fj-input-wrap" style={{ flex: '0 1 200px', minWidth: '160px' }}>
                <MapPin size={17} />
                <input
                  type="text"
                  placeholder="Location..."
                  className="fj-input fj-input-loc"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="fj-select-wrap">
                <ArrowUpDown size={15} />
                <select className="fj-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                </select>
              </div>

              <div className="fj-select-wrap">
                <Calendar size={15} />
                <select className="fj-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <button type="submit" className="fj-btn-search">Find Jobs</button>

              <button type="button" onClick={resetFilters} className="fj-btn-clear" title="Clear Filters">
                <X size={19} />
              </button>
            </form>
          </div>
        </header>

        {/* 2. MAIN CONTENT AREA */}
        <main className="fj-main">

          {/* LEFT: JOB FEED */}
          <aside className="fj-feed">
            <div className="fj-feed-header">
              <span className="fj-feed-count">{totalCount} Opportunities Found</span>
            </div>

            <div className="fj-feed-list">
              {loading ? (
                <div className="fj-state">
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Loading roles...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : jobs.length === 0 ? (
                <div className="fj-state">
                  <Inbox size={36} style={{ opacity: 0.25 }} />
                  <p>No jobs match your search.</p>
                  <button className="fj-state-btn" onClick={resetFilters}>Show All Jobs</button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`fj-job-card${selectedJob?.id === job.id ? ' selected' : ''}`}
                  >
                    <div className="fj-card-top">
                      <h3 className="fj-card-title">{job.title}</h3>
                      <button
                        onClick={(e) => handleToggleSave(e, job.id)}
                        className={`fj-save-btn${savedJobIds.has(job.id) ? ' saved' : ''}`}
                        aria-label={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                      >
                        <Bookmark size={17} fill={savedJobIds.has(job.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="fj-card-company">
                      <Building2 size={13} /> {job.company?.name}
                    </div>
                    <div className="fj-card-bottom">
                      <span className="fj-location-tag">
                        <MapPin size={10} /> {job.location}
                      </span>
                      <span className="fj-salary">₹{(job.salary_min / 100000).toFixed(1)}L+</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PAGINATION */}
            <div className="fj-pagination">
              <button
                className="fj-page-btn"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="fj-page-info">Page {currentPage} / {totalPages || 1}</span>
              <button
                className="fj-page-btn"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </aside>

          {/* RIGHT: JOB DETAIL VIEW */}
          <section className="fj-detail">
            {selectedJob ? (
              <div className="fj-detail-inner">
                <div className="fj-detail-head">
                  <div className="fj-detail-left">
                    <div className="fj-company-logo">{selectedJob.company?.name?.charAt(0)}</div>
                    <div>
                      <h2 className="fj-detail-job-title">{selectedJob.title}</h2>
                      <p className="fj-detail-company">{selectedJob.company?.name} · Verified Hire</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/candidate/application/${selectedJob.id}`)}
                    className="fj-apply-btn"
                  >
                    Apply Now <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="fj-stats-bar">
                  <StatCard label="Yearly Max" val={`₹${(selectedJob.salary_max / 1000).toFixed(0)}k`} />
                  <StatCard label="Experience" val={`${selectedJob.experience_required}Y+`} />
                  <StatCard label="Type" val={selectedJob.job_type?.replace('_', ' ')} />
                </div>

                <div className="fj-content">
                  <div>
                    <p className="fj-section-label">Job Overview</p>
                    <p className="fj-description">{selectedJob.description}</p>
                  </div>
                  {selectedJob.requirements && (
                    <div>
                      <p className="fj-section-label">Requirements</p>
                      <ul className="fj-req-list">
                        {selectedJob.requirements.split('\n').map((req, i) => (
                          <li key={i} className="fj-req-item">
                            <Plus size={15} className="fj-req-icon" /> {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="fj-detail-empty">
                <Briefcase size={44} style={{ opacity: 0.18 }} />
                <p>Select a role to view details</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

function StatCard({ label, val }) {
  return (
    <div className="fj-stat-card">
      <p className="fj-stat-label">{label}</p>
      <p className="fj-stat-val">{val}</p>
    </div>
  );
}