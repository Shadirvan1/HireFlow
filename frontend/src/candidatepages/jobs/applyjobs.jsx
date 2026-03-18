import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/api';
import { Bookmark, MapPin, Building2, ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('jobs/get/saved/', {
        params: { page: currentPage }
      });
      // Handle DRF structure: { results: [], count: X }
      setJobs(response.data.results || []);
      const count = response.data.count || 0;
      setTotalPages(Math.ceil(count / 10)); // Assuming 10 per page
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Opportunities</h1>
        <p className="text-slate-500">Jobs you've bookmarked for later.</p>
      </header>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-bold">No saved jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center hover:shadow-lg transition-all">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                  {job.company?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <div className="flex gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Building2 size={12}/> {job.company?.name}</span>
                    <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                  </div>
                </div>
              </div>
              <button className="text-indigo-600 font-bold text-sm hover:underline">View Details</button>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-black text-slate-600">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}