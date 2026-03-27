import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Linkedin, Github, User } from "lucide-react"; // Added icons

export default function CandidateProfile() {
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", date_of_birth: "",
    current_location: "", total_experience: "", current_company: "",
    current_ctc: "", expected_ctc: "", notice_period_days: "",
    portfolio_url: "", linkedin_url: "", github_url: "",
    receive_notifications: true, profile_image: null,
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/candidate/profile/");
      setFormData(res.data);
      if (res.data.profile_image) setPreview(res.data.profile_image);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await api.put("accounts/candidate/profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/candidate/dashboard"), 1500);
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data);
    } finally { setLoading(false); }
  };

  const Label = ({ text, optional }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {text} {optional && <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>}
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500">Set up your presence for potential recruiters.</p>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex justify-center"
          >
            {loading ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>

        {message && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center shadow-sm">
            <ShieldCheck size={20} className="mr-2" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Photo & Links */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block group">
                <img 
                  src={preview || "https://via.placeholder.com/150"} 
                  alt="Avatar" 
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md mx-auto ring-1 ring-gray-100" 
                />
                <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-lg border border-white cursor-pointer hover:bg-blue-700 transition-colors text-white">
                  <Camera size={18} />
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
              <h3 className="mt-4 font-bold text-xl text-gray-800 tracking-tight">
                {formData.first_name || "New"} {formData.last_name || "User"}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest border-b pb-2">Links</h4>
              <div>
                <Label text="LinkedIn" optional />
                <div className="relative">
                  <input name="linkedin_url" value={formData.linkedin_url || ""} onChange={handleChange} className="w-full p-2.5 pl-9 border rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="linkedin.com/in/user" />
                  <Linkedin size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div>
                <Label text="GitHub" optional />
                <div className="relative">
                  <input name="github_url" value={formData.github_url || ""} onChange={handleChange} className="w-full p-2.5 pl-9 border rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="github.com/user" />
                  <Github size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information Forms */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User size={22} className="mr-3 text-blue-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label text="First Name" />
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <Label text="Last Name" />
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <Label text="Current Location" />
                  <input name="current_location" value={formData.current_location} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all" placeholder="e.g., New York, NY" />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></div>
                Professional Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label text="Total Experience (Years)" />
                  <input type="number" step="0.5" name="total_experience" value={formData.total_experience} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <Label text="Notice Period (Days)" />
                  <input type="number" name="notice_period_days" value={formData.notice_period_days} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <Label text="Current Company" optional />
                  <input name="current_company" value={formData.current_company || ""} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <Label text="Current CTC (Annual)" optional />
                  <input type="number" name="current_ctc" value={formData.current_ctc || ""} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., 85000" />
                </div>
                <div>
                  <Label text="Expected CTC (Annual)" optional />
                  <input type="number" name="expected_ctc" value={formData.expected_ctc || ""} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., 105000" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}