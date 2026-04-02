import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function HRDetails() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRDetails = async () => {
      try {
        const res = await api.get("admin/hr/details/");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching HR details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHRDetails();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`admin/hr/${id}/approve/`);
      alert("HR Approved ");
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`admin/hr/${id}/reject/`);
      alert("HR Rejected ");
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };
 
  if (loading) {
    return <div className="p-6 text-lg">Loading HR details...</div>;
  }
return (
    <div className="p-10 bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            HR Verification Queue
          </h2>
          <p className="text-slate-500 mt-2">Review and manage company HR representative applications.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
          Pending Requests: <span className="text-blue-600">{data.length}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No pending HR profiles found.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
          {data.map((hr) => (
            <div
              key={hr.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
            >
              <div className="p-8">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                        <img
                        src={hr.profile_image}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {hr.user.username}
                      </h3>
                      <p className="text-slate-500 font-medium">{hr.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {hr.designation}
                        </span>
                        <span className="bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {hr.department}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 mb-6">
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest mb-1">Experience</p>
                    <p className="text-sm font-semibold text-slate-700">{hr.experience_years} Years Professional</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest mb-1">LinkedIn</p>
                    <a href={hr.linkedin_url} target="_blank" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      Verified Profile 
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                </div>

                {/* Company Card Section */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={hr.company.logo} alt="Logo" className="w-12 h-12 rounded-lg bg-white p-1 border shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-800">{hr.company.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{hr.company.industry} • {hr.company.company_size} Employees</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic mb-4">"{hr.company.description}"</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">HQ: <span className="text-slate-700 font-medium">{hr.company.headquarters}</span></span>
                    <a href={hr.company.website} className="bg-white border border-slate-200 px-3 py-1 rounded-md hover:bg-slate-50 font-bold text-slate-700">Website</a>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center gap-4">
                  <a
                    href={hr.certifications}
                    target="_blank"
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    title="View Documents"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </a>
                  
                  <button
                    onClick={() => handleReject(hr.id)}
                    className="flex-1 px-6 py-3 border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-all"
                  >
                    Reject Application
                  </button>
                  
                  <button
                    onClick={() => handleApprove(hr.id)}
                    className="flex-[2] px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-blue-600 shadow-lg shadow-slate-200 hover:shadow-blue-200 transition-all"
                  >
                    Approve HR Access
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}