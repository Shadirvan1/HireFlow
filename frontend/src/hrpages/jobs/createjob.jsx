import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, DollarSign, Calendar,
  Cpu, Target, Clock, FileText, ListChecks,
  ChevronLeft, Rocket, Sparkles
} from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "ats_ascore") {
      finalValue = Math.max(60, Number(value));
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post("jobs/hr/create/job/", formData);
      setSuccess(true);
      setTimeout(() => navigate("/hr/jobs"), 1500);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full bg-[#0f1117] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/70 transition-all duration-200 hover:border-gray-600";

  const labelStyle =
    "flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide";

  const SectionCard = ({ children, className = "" }) => (
    <div className={`bg-[#0d0f16] border border-gray-800/80 rounded-2xl p-6 md:p-7 shadow-xl ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({ icon, title, subtitle, iconColor = "text-cyan-400" }) => (
    <div className="flex items-start gap-3 mb-6 pb-5 border-b border-gray-800">
      <div className={`w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
        {Array.isArray(errors[field]) ? errors[field][0] : errors[field]}
      </p>
    ) : null;

  const jobTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[35%] h-[50%] bg-purple-900/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-cyan-900/10 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] w-[20%] h-[30%] bg-blue-900/8 blur-[100px] rounded-full" />
      </div>

      {/* Sticky top nav */}
      <div className="border-b border-gray-800/60 bg-[#080a0f]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-200">HireFlow</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Draft autosaved</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">

        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 text-xs text-cyan-400 font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            New job posting
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create a new opportunity
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Fill in the details below. Fields marked <span className="text-red-400">*</span> are required.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Rocket className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 text-sm font-semibold">Job posted successfully!</p>
              <p className="text-green-600 text-xs">Redirecting to your jobs dashboard…</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Role Identity ── */}
          <SectionCard>
            <SectionHeader
              icon={<Briefcase className="w-4 h-4" />}
              title="Role Identity"
              subtitle="Core details about the position"
              iconColor="text-cyan-400"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>
                  <Target className="w-3.5 h-3.5" /> Job title <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text" name="title" value={formData.title}
                  onChange={handleChange} className={inputStyle}
                  placeholder="e.g. Senior Backend Engineer"
                />
                <FieldError field="title" />
              </div>

              <div>
                <label className={labelStyle}>
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <input
                  type="text" name="location" value={formData.location}
                  onChange={handleChange} className={inputStyle}
                  placeholder="e.g. Remote, New York"
                />
                <FieldError field="location" />
              </div>

              <div>
                <label className={labelStyle}>Job type</label>
                <select
                  name="job_type" value={formData.job_type}
                  onChange={handleChange}
                  className={`${inputStyle} cursor-pointer`}
                >
                  {jobTypes.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#0f1117]">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelStyle}>
                  <Clock className="w-3.5 h-3.5" /> Experience required (years)
                </label>
                <input
                  type="number" name="experience_required" min="0"
                  value={formData.experience_required}
                  onChange={handleChange} className={inputStyle}
                  placeholder="e.g. 3"
                />
                <FieldError field="experience_required" />
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>
                  <FileText className="w-3.5 h-3.5" /> Description <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <textarea
                  name="description" value={formData.description}
                  onChange={handleChange} rows="4"
                  className={inputStyle}
                  placeholder="Describe the mission and impact of this role…"
                />
                <FieldError field="description" />
              </div>

              <div>
                <label className={labelStyle}>
                  <ListChecks className="w-3.5 h-3.5" /> Requirements
                </label>
                <textarea
                  name="requirements" value={formData.requirements}
                  onChange={handleChange} rows="3"
                  className={inputStyle}
                  placeholder="Skills, qualifications, certifications…"
                />
                <FieldError field="requirements" />
              </div>

              <div>
                <label className={labelStyle}>
                  <ListChecks className="w-3.5 h-3.5" /> Responsibilities
                </label>
                <textarea
                  name="responsibilities" value={formData.responsibilities}
                  onChange={handleChange} rows="3"
                  className={inputStyle}
                  placeholder="Day-to-day duties and expected outcomes…"
                />
                <FieldError field="responsibilities" />
              </div>
            </div>
          </SectionCard>

          {/* ── Section 2: Logistics ── */}
          <SectionCard>
            <SectionHeader
              icon={<DollarSign className="w-4 h-4" />}
              title="Compensation & Logistics"
              subtitle="Salary range, deadline, and other logistics"
              iconColor="text-green-400"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelStyle}>
                  <DollarSign className="w-3.5 h-3.5" /> Min salary
                </label>
                <input
                  type="number" name="salary_min" value={formData.salary_min}
                  onChange={handleChange} className={inputStyle}
                  placeholder="e.g. 50000"
                />
                <FieldError field="salary_min" />
              </div>
              <div>
                <label className={labelStyle}>
                  <DollarSign className="w-3.5 h-3.5" /> Max salary
                </label>
                <input
                  type="number" name="salary_max" value={formData.salary_max}
                  onChange={handleChange} className={inputStyle}
                  placeholder="e.g. 90000"
                />
                <FieldError field="salary_max" />
              </div>
              <div>
                <label className={labelStyle}>
                  <Calendar className="w-3.5 h-3.5" /> Application deadline
                </label>
                <input
                  type="date" name="deadline" value={formData.deadline}
                  onChange={handleChange} className={inputStyle}
                />
                <FieldError field="deadline" />
              </div>
            </div>
          </SectionCard>

          {/* ── Section 3: AI Automation ── */}
          <div className={`rounded-2xl border-2 p-6 md:p-7 transition-all duration-500 ${
            formData.is_automatic
              ? "border-cyan-500/40 bg-cyan-950/10"
              : "border-gray-800/80 bg-[#0d0f16]"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  formData.is_automatic ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-800 text-gray-500"
                }`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Recruitment Pilot</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Let AI score candidates and send interview invites automatically.
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input
                  type="checkbox" name="is_automatic"
                  checked={formData.is_automatic}
                  onChange={handleChange} className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-cyan-600
                  after:content-[''] after:absolute after:top-0.5 after:left-[3px]
                  after:bg-white after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-6
                  transition-colors duration-300" />
              </label>
            </div>

            {formData.is_automatic && (
              <div className="mt-6 pt-5 border-t border-cyan-800/30 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelStyle}>
                    <Target className="w-3.5 h-3.5 text-cyan-400" /> Min. ATS match score (%)
                  </label>

                  {/* Score display badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Minimum allowed: 60%</span>
                    <span className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-bold px-3 py-1 rounded-lg">
                      {formData.ats_ascore}%
                    </span>
                  </div>

                  <input
                    type="range" name="ats_ascore"
                    min="60" max="100" step="1"
                    value={formData.ats_ascore}
                    onChange={handleChange}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-xs text-gray-600 mt-1.5">
                    <span className="text-gray-500 font-medium">60% <span className="text-gray-700">(min)</span></span>
                    <span className="text-gray-500 font-medium">100% <span className="text-gray-700">(max)</span></span>
                  </div>

                  {/* Visual tick marks */}
                  <div className="flex justify-between mt-1 px-0.5">
                    {[60, 70, 80, 90, 100].map((tick) => (
                      <div key={tick} className="flex flex-col items-center gap-0.5">
                        <div className={`w-px h-1.5 rounded-full ${
                          formData.ats_ascore >= tick ? "bg-cyan-500" : "bg-gray-700"
                        }`} />
                        <span className={`text-[10px] ${
                          formData.ats_ascore >= tick ? "text-cyan-500" : "text-gray-700"
                        }`}>{tick}</span>
                      </div>
                    ))}
                  </div>

                  <FieldError field="ats_ascore" />
                </div>

                {/* Info card */}
                <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-xl p-4 flex flex-col justify-center">
                  <p className="text-xs text-cyan-400 font-semibold mb-1">What is ATS score?</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    The ATS (Applicant Tracking Score) measures how well a candidate's resume matches your job requirements. Only candidates above this threshold will be shortlisted automatically.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between pt-2 pb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-200 border border-transparent hover:border-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || success}
              className={`flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${loading || success
                  ? "bg-cyan-700/50 cursor-not-allowed text-cyan-300/50"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-300/40 border-t-cyan-300 rounded-full animate-spin" />
                  Publishing…
                </>
              ) : success ? (
                <>
                  <span className="text-green-400">✓</span>
                  Published!
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Launch Job Post
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}