import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, DollarSign, Calendar,
  Cpu, Target, Clock, FileText, ListChecks,
  ChevronLeft, Rocket, Sparkles
} from "lucide-react";

/* =========================
   Reusable Components
========================= */

const inputStyle =
  "w-full bg-[#0f1117] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/70 transition-all duration-200 hover:border-gray-600";

const labelStyle =
  "flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide";

const SectionCard = React.memo(({ children }) => (
  <div className="bg-[#0d0f16] border border-gray-800/80 rounded-2xl p-6 md:p-7 shadow-xl">
    {children}
  </div>
));

const SectionHeader = React.memo(({ icon, title, subtitle, iconColor }) => (
  <div className="flex items-start gap-3 mb-6 pb-5 border-b border-gray-800">
    <div className={`w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center ${iconColor}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
));

const FieldError = React.memo(({ error }) =>
  error ? (
    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
      {Array.isArray(error) ? error[0] : error}
    </p>
  ) : null
);

/* =========================
   Main Component
========================= */

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
    ats_ascore: 70,
  });

  const [errors, setErrors] = useState({});

  /* =========================
     Handlers
  ========================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = type === "checkbox" ? checked : value;

    if (name === "ats_ascore") {
      finalValue = Math.max(60, Number(value));
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

  
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const jobTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
  ];

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* HEADER */}
      <div className="border-b border-gray-800/60 sticky top-0 z-20 bg-[#080a0f]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">HireFlow</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 font-semibold">Job posted successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ROLE */}
          <SectionCard>
            <SectionHeader
              icon={<Briefcase className="w-4 h-4" />}
              title="Role Identity"
              subtitle="Core job details"
              iconColor="text-cyan-400"
            />

            <input
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleChange}
              className={inputStyle}
            />
            <FieldError error={errors.title} />
          </SectionCard>

          {/* LOGISTICS */}
          <SectionCard>
            <SectionHeader
              icon={<DollarSign className="w-4 h-4" />}
              title="Compensation"
              subtitle="Salary & deadline"
              iconColor="text-green-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="salary_min"
                placeholder="Min Salary"
                value={formData.salary_min}
                onChange={handleChange}
                className={inputStyle}
              />

              <input
                name="salary_max"
                placeholder="Max Salary"
                value={formData.salary_max}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </SectionCard>

          {/* AI */}
          <SectionCard>
            <SectionHeader
              icon={<Cpu className="w-4 h-4" />}
              title="AI Automation"
              subtitle="Enable ATS scoring"
              iconColor="text-cyan-400"
            />

            <input
              type="range"
              name="ats_ascore"
              min="60"
              max="100"
              value={formData.ats_ascore}
              onChange={handleChange}
              className="w-full"
            />

            <p className="text-sm text-gray-400 mt-2">
              Score: {formData.ats_ascore}%
            </p>
          </SectionCard>

          {/* ACTION */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 px-6 py-2 rounded-xl font-semibold"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}