import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, Calendar, Cpu, Target, Clock, Loader2, Rocket } from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();

  // New state for loading and success
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    salary_min: "",
    salary_max: "",
    job_type: "FULL_TIME",
    experience_required: 0,
    deadline: "",
    is_automatic: false,
    is_interviewer: "",
    ats_ascore: 70,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true); // Start loading

    try {
      await api.post("jobs/hr/create/job/", formData);
      setSuccess(true); // Trigger success state
      
      // Delay navigation slightly so user sees the success state
      setTimeout(() => {
        navigate("/hr/jobs");
      }, 1500);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      setLoading(false); // Stop loading if error occurs
    }
  };

  const inputStyle = "w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200";
  const labelStyle = "flex items-center gap-2 text-sm font-medium text-gray-400 mb-1.5";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 selection:bg-cyan-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Create New Opportunity
          </h1>
          <p className="text-gray-400 mt-2">Define the role and set up automated AI screening.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Details Section */}
          <section className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Briefcase className="text-cyan-400 w-5 h-5" /> Role Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className={labelStyle}><Target className="w-4 h-4" /> Job Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputStyle} placeholder="e.g. Senior Backend Engineer" required />
                {errors.title && <span className="text-xs text-red-400 mt-1">{errors.title[0]}</span>}
              </div>
              <div className="flex flex-col">
                <label className={labelStyle}><MapPin className="w-4 h-4" /> Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputStyle} placeholder="Remote, New York, etc." />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={inputStyle} placeholder="Describe the core mission of this role..." required />
              </div>
            </div>
          </section>

          {/* AI Automation Section */}
          <section className={`transition-all duration-500 border-2 ${formData.is_automatic ? 'border-cyan-500/50 bg-cyan-900/5' : 'border-gray-800 bg-gray-900/40'} p-6 md:p-8 rounded-3xl backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Cpu className={`${formData.is_automatic ? 'text-cyan-400' : 'text-gray-500'} w-5 h-5 transition-colors`} /> 
                  AI Recruitment Pilot
                </h3>
                <p className="text-sm text-gray-400 mt-1">Enable AI to score candidates and send interview invites automatically.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="is_automatic" checked={formData.is_automatic} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
            {formData.is_automatic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col">
                  <label className={labelStyle}><Target className="w-4 h-4" /> Min. ATS Match Score (%)</label>
                  <input type="number" name="ats_ascore" value={formData.ats_ascore} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
            )}
          </section>

          {/* Logistics Section */}
          <section className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="text-green-400 w-5 h-5" /> Logistics & Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Salary Range (Min/Max)</label>
                <div className="flex gap-2">
                  <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} className={inputStyle} placeholder="Min" />
                  <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} className={inputStyle} placeholder="Max" />
                </div>
              </div>
              <div>
                <label className={labelStyle}><Clock className="w-4 h-4" /> Experience (Yrs)</label>
                <input type="number" name="experience_required" value={formData.experience_required} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}><Calendar className="w-4 h-4" /> Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputStyle} />
              </div>
            </div>
          </section>

          {/* Action Buttons with Loading State */}
          <div className="flex items-center justify-end gap-4 pb-12">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              disabled={loading}
              className="px-8 py-3 rounded-xl font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={loading || success}
              className={`flex items-center gap-2 px-10 py-3 rounded-xl font-bold shadow-lg transition-all 
                ${success 
                  ? 'bg-green-600 shadow-green-500/25' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
                } 
                disabled:opacity-80 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : success ? (
                <>
                  <Rocket className="w-5 h-5 animate-bounce" />
                  Success!
                </>
              ) : (
                "Launch Job Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}