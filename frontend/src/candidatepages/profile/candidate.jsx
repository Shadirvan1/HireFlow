import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

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
  const [preview, setPreview] = useState(null); // For image preview

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
    setFormData({ ...formData, profile_image: file });
    setPreview(URL.createObjectURL(file)); // Create local preview URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
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

  // Helper component for labels
  const Label = ({ text, optional }) => (
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {text} {optional && <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>}
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500">Set up your presence for potential recruiters.</p>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {message && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-pulse">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Photo & Links */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block">
                <img src={preview || "https://via.placeholder.com/150"} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 mx-auto" />
                <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg border cursor-pointer hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input type="file" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <h3 className="mt-4 font-bold text-gray-800">{formData.first_name} {formData.last_name}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="font-semibold text-gray-700 border-b pb-2">Social Profiles</h4>
              <div>
                <Label text="LinkedIn" optional />
                <input name="linkedin_url" value={formData.linkedin_url || ""} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <Label text="GitHub" optional />
                <input name="github_url" value={formData.github_url || ""} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm" placeholder="https://github.com/..." />
              </div>
            </div>
          </div>

          {/* Right Column: Information Forms */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="First Name" />
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <Label text="Last Name" />
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <Label text="Location" />
                  <input name="current_location" value={formData.current_location} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="City, Country" />
                </div>
              </div>
            </section>

            {/* Professional Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
                Professional Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Total Experience (Years)" />
                  <input type="number" name="total_experience" value={formData.total_experience} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <Label text="Notice Period (Days)" />
                  <input type="number" name="notice_period_days" value={formData.notice_period_days} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <Label text="Current Company" optional />
                  <input name="current_company" value={formData.current_company || ""} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <Label text="Current CTC" optional />
                  <input type="number" name="current_ctc" value={formData.current_ctc || ""} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <Label text="Expected CTC" optional />
                  <input type="number" name="expected_ctc" value={formData.expected_ctc || ""} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}