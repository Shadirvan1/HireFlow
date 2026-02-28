import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, IndianRupee, ChevronLeft, 
  Upload, Send, CheckCircle2, Star, Clock 
} from 'lucide-react';
import api from '../../api/api';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null); // Holds { job, candidate }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume: null
  });

  useEffect(() => {
    const fetchApplicationContext = async () => {
      try {
        const res = await api.get(`jobs/get/job/${jobId}/`);
        setData(res.data);
        
        // Auto-fill form with candidate data from your API
        if (res.data.candidate) {
          const { first_name, last_name, user } = res.data.candidate;
          setFormData(prev => ({
            ...prev,
            full_name: `${first_name} ${last_name}`.trim(),
            email: user?.email || '',
            phone: user?.phone_number || ''
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
    uploadData.append('email', formData.email);
    uploadData.append('phone', formData.phone);
    uploadData.append('cover_letter', formData.cover_letter);
    uploadData.append('resume', formData.resume);

    try {
      await api.post(`jobs/job/apply/${jobId}/`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium italic">Preparing your application...</p>
    </div>
  );

  const job = data?.job;

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">You're all set!</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Your application for <strong>{job?.title}</strong> has been successfully sent to <strong>{job?.company?.name}</strong>.
        </p>
        <button onClick={() => navigate('/candidate/jobs')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          Explore more opportunities
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 font-semibold hover:text-indigo-600 transition-colors">
            <ChevronLeft size={20} /> Back to Job
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Application Portal</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT SIDE: Job Insights */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100">
                {job?.company?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{job?.title}</h2>
                <p className="text-indigo-600 font-bold text-sm">{job?.company?.name}</p>
              </div>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <MapPin size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold">{job?.location}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <IndianRupee size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold">₹{Number(job?.salary_min).toLocaleString()} - ₹{Number(job?.salary_max).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <Clock size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold">{job?.job_type?.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Key Requirements</h4>
              <div className="flex flex-wrap gap-2">
                {job?.requirements?.split('\n').map((req, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">
                    {req.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Application Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900">Personal Details</h3>
              <p className="text-slate-500 text-sm mt-1">We've pre-filled some info from your profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required name="full_name" value={formData.full_name} onChange={handleInputChange} type="text" className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Letter (Optional)</label>
                <textarea name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} rows="4" placeholder="Highlight your skills..." className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume / Portfolio</label>
                <div className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all group ${formData.resume ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                  <input required type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex flex-col items-center">
                    <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${formData.resume ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {formData.resume ? formData.resume.name : "Select your Resume"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">PDF or DOC up to 10MB</p>
                  </div>
                </div>
              </div>

              <button  disabled={submitting} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {submitting ? "Processing..." : <>Send Application <Send size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}