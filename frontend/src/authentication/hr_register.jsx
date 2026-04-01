import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function HRRegister() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    company_name: "",
    website: "",
    industry: "",
    company_size: "",
    headquarters: "",
    linkedin_url: "",
    designation: "",
    department: "",
    experience_years: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [nonFieldError, setNonFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setNonFieldError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrors({});
    setNonFieldError("");

    try {
      await api.post("accounts/hr/register/", formData);
      localStorage.setItem("email", formData.email);
      alert("Registered Successfully");
      setFormData({
        email: "", username: "", password: "", company_name: "",
        website: "", industry: "", company_size: "", headquarters: "",
        linkedin_url: "", designation: "", department: "", experience_years: "",
      });
      navigate("/login");
    } catch (err) {
      if (err.response?.data) {
        const backendErrors = err.response.data;
        setErrors(backendErrors);
        if (backendErrors.non_field_errors) {
          setNonFieldError(backendErrors.non_field_errors[0]);
        }
      } else {
        setNonFieldError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50 hover:bg-white focus:bg-white
     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
     transition duration-200 placeholder-gray-400 text-gray-800
     ${errors[field] ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-200"}`;

  const EyeIcon = ({ show, onClick }) => (
    <button type="button" onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition">
      {show ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  const FieldError = ({ field }) =>
    errors[field] ? <p className="text-red-500 text-xs mt-1 ml-0.5">{errors[field]}</p> : null;

  const Label = ({ children }) => (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-0.5">{children}</label>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Left Sidebar ── */}
      <div className="hidden lg:flex w-72 xl:w-80 bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-10 fixed top-0 left-0 h-full">

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">HireFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-white leading-snug">
            Start hiring<br />smarter today
          </h2>
          <p className="text-indigo-200 text-sm mt-3 leading-relaxed">
            Create your HR account and unlock powerful tools to find, evaluate, and hire top talent — faster.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-5">
            {[
              { step: "01", title: "Create your account", desc: "Set up your HR profile in minutes" },
              { step: "02", title: "Add company details", desc: "Let candidates know who you are" },
              { step: "03", title: "Start posting jobs", desc: "Reach thousands of qualified seekers" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{item.step}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-4">
          <p className="text-white text-sm font-semibold">Trusted by 10,000+ companies</p>
          <p className="text-indigo-300 text-xs mt-1">From startups to Fortune 500s worldwide</p>
        </div>
      </div>

      {/* ── Main Form Area ── */}
      <div className="flex-1 lg:ml-72 xl:ml-80 px-6 py-10 flex items-start justify-center">
        <div className="w-full max-w-3xl">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <span className="text-indigo-700 text-xl font-bold">HireFlow</span>
          </div>

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">HR Registration</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in the details below to create your HR account</p>
          </div>

          {nonFieldError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {nonFieldError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section 1: Account Info ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Account Information</h3>
                  <p className="text-xs text-gray-400">Your login credentials</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label>Username</Label>
                  <input name="username" placeholder="e.g. john_hr" value={formData.username} onChange={handleChange} className={inputClass("username")} />
                  <FieldError field="username" />
                </div>
                <div>
                  <Label>Email address</Label>
                  <input type="email" name="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} className={inputClass("email")} />
                  <FieldError field="email" />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} className={`${inputClass("password")} pr-10`} />
                    <EyeIcon show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                  </div>
                  <FieldError field="password" />
                </div>
                <div>
                  <Label>Confirm password</Label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(""); }}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 text-gray-800 pr-10 ${confirmPasswordError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    <EyeIcon show={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
                  </div>
                  {confirmPasswordError && <p className="text-red-500 text-xs mt-1 ml-0.5">{confirmPasswordError}</p>}
                  {confirmPassword && formData.password && !confirmPasswordError && confirmPassword === formData.password && (
                    <p className="text-green-500 text-xs mt-1 ml-0.5">✓ Passwords match</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 2: Company Details ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Company Details</h3>
                  <p className="text-xs text-gray-400">Tell us about your organization</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label>Company name</Label>
                  <input name="company_name" placeholder="e.g. Acme Corp" value={formData.company_name} onChange={handleChange} className={inputClass("company_name")} />
                  <FieldError field="company_name" />
                </div>
                <div>
                  <Label>Website</Label>
                  <input name="website" placeholder="https://yourcompany.com" value={formData.website} onChange={handleChange} className={inputClass("website")} />
                  <FieldError field="website" />
                </div>
                <div>
                  <Label>Industry</Label>
                  <input name="industry" placeholder="e.g. Technology, Finance" value={formData.industry} onChange={handleChange} className={inputClass("industry")} />
                  <FieldError field="industry" />
                </div>
                <div>
                  <Label>Company size</Label>
                  <select name="company_size" value={formData.company_size} onChange={handleChange}
                    className={`${inputClass("company_size")} cursor-pointer`}>
                    <option value="">Select company size</option>
                    <option value="1-10">1–10 employees</option>
                    <option value="11-50">11–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-500">201–500 employees</option>
                    <option value="501-1000">501–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                  <FieldError field="company_size" />
                </div>
                <div className="md:col-span-2">
                  <Label>Headquarters</Label>
                  <input name="headquarters" placeholder="e.g. New York, USA" value={formData.headquarters} onChange={handleChange} className={inputClass("headquarters")} />
                  <FieldError field="headquarters" />
                </div>
              </div>
            </div>

            {/* ── Section 3: HR Details ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">HR Details</h3>
                  <p className="text-xs text-gray-400">Your professional information</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label>Designation</Label>
                  <input name="designation" placeholder="e.g. HR Manager" value={formData.designation} onChange={handleChange} className={inputClass("designation")} />
                  <FieldError field="designation" />
                </div>
                <div>
                  <Label>Department</Label>
                  <input name="department" placeholder="e.g. Human Resources" value={formData.department} onChange={handleChange} className={inputClass("department")} />
                  <FieldError field="department" />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <input type="number" name="experience_years" placeholder="e.g. 5" min="0" value={formData.experience_years} onChange={handleChange} className={inputClass("experience_years")} />
                  <FieldError field="experience_years" />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <input name="linkedin_url" placeholder="https://linkedin.com/in/yourname" value={formData.linkedin_url} onChange={handleChange} className={inputClass("linkedin_url")} />
                  <FieldError field="linkedin_url" />
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition duration-200 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create HR Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">Login</span>
            </p>
            <p className="text-sm text-gray-500">
              Are you a candidate?{" "}
              <span onClick={() => navigate("/register")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">Register here</span>
            </p>
            <p className="text-sm text-gray-500">
              Need to verify your account?{" "}
              <span onClick={() => navigate("/resend/link")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">Resend link</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HRRegister;