import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, IndianRupee, ChevronLeft, 
  Upload, Send, CheckCircle2, Clock, Briefcase, User, FileText
} from 'lucide-react';
import api from '../../api/api';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cover_letter: '',
    resume: null
    // REMOVED email from initial state
  });

  useEffect(() => {
    const fetchApplicationContext = async () => {
      try {
        const res = await api.get(`jobs/get/job/${jobId}/`);
        setData(res.data);
        
        if (res.data.candidate) {
          const { first_name, last_name } = res.data.candidate;
          setFormData(prev => ({
            ...prev,
            full_name: `${first_name} ${last_name}`.trim()
            // REMOVED email mapping here
          }));
        }
      } catch (err) {
        console.error("Error fetching context:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicationContext();
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) return alert("Please upload your resume");
    
    setSubmitting(true);

    const uploadData = new FormData();
    uploadData.append('job', jobId);
    uploadData.append('full_name', formData.full_name);
    // REMOVED email append
    uploadData.append('cover_letter', formData.cover_letter);
    uploadData.append('resume', formData.resume);

    try {
      await api.post(`jobs/job/apply/${jobId}/`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Already applied");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-semibold tracking-wide animate-pulse uppercase text-xs">Preparing your application...</p>
    </div>
  );

  const job = data?.job;

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Sent!</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Your application for <span className="text-indigo-600 font-bold">{job?.title}</span> has been successfully sent to <span className="text-slate-800 font-bold">{job?.company?.name}</span>.
        </p>
        <button 
          onClick={() => navigate('/candidate/jobs')} 
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
        >
          Explore more opportunities
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 py-4 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Job
          </button>
          <div className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-400">Application Portal</div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 grid lg:grid-cols-2 gap-12 mt-8">

        {/* Job Info Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-tighter rounded-lg mb-4">Applying For</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">{job?.title}</h2>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg mb-6">
                 <Briefcase size={18} /> {job?.company?.name}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin size={18} className="text-indigo-500" /></div>
                  <span className="font-semibold">{job?.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><IndianRupee size={18} className="text-indigo-500" /></div>
                  <span className="font-semibold text-slate-900 italic">₹{job?.salary_min?.toLocaleString()} - ₹{job?.salary_max?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm"><Clock size={18} className="text-indigo-500" /></div>
                  <span className="font-semibold">{job?.job_type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center">
            <p className="text-slate-400 text-sm font-medium italic">Make sure your details match your professional profile.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-10"></div>
          
          <form onSubmit={handleSubmit} className="relative bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-white space-y-6">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4 mb-2 flex items-center gap-2">
              <FileText size={20} className="text-indigo-500" /> Candidate Details
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-4 text-slate-400" />
                <input
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full p-4 pl-12 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* EMAIL SECTION REMOVED FROM HERE */}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cover Letter</label>
              <textarea
                name="cover_letter"
                value={formData.cover_letter}
                onChange={handleInputChange}
                rows={4}
                placeholder="Briefly explain why you're a great fit..."
                className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Resume / CV (PDF)</label>
              <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <input
                  required
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="p-6 text-center">
                  <Upload size={24} className="mx-auto text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all mb-2" />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                    {formData.resume ? formData.resume.name : "Click to upload resume"}
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={submitting}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-xl ${
                submitting 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-slate-900 hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Submit Application <Send size={18} />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}