import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react';

export default function HRApplications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');

  // Mock data - replace with your api.get('jobs/hr/get/applications/')
  useEffect(() => {
    const mockData = [
      { id: 1, name: "Arjun Mehta", email: "arjun@example.com", role: "Frontend Developer", status: "Pending", date: "2024-03-20" },
      { id: 2, name: "Sara Khan", email: "sara.k@example.com", role: "UI/UX Designer", status: "Shortlisted", date: "2024-03-18" },
      { id: 3, name: "Priya Das", email: "priya@example.com", role: "Backend Engineer", status: "Rejected", date: "2024-03-15" },
    ];
    setApplications(mockData);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incoming Applications</h1>
            <p className="text-slate-500 font-medium">Review and manage candidates applying to your roles</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Received', count: '124', icon: <FileText className="text-blue-500"/> },
            { label: 'Shortlisted', count: '12', icon: <CheckCircle className="text-emerald-500"/> },
            { label: 'Pending Review', count: '48', icon: <Clock className="text-amber-500"/> },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.count}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-t-[2rem] p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Pending', 'Shortlisted', 'Rejected'].map((s) => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filter === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white border border-slate-200 border-t-0 rounded-b-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Role</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{app.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12}/> {app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{app.role}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{app.date}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Profile">
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Shortlist">
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">Showing 1 to 10 of 124 applications</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Previous</button>
              <button className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg shadow-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}