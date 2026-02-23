import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateJob() {
  const navigate = useNavigate();

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
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.post("jobs/hr/create/job/", formData);
      navigate("/hr/jobs");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-800">

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Create New Job
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Job Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.title && <p className="text-red-400 text-sm">{errors.title[0]}</p>}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Location (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.location && <p className="text-red-400 text-sm">{errors.location[0]}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm text-gray-300">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.description && <p className="text-red-400 text-sm">{errors.description[0]}</p>}
          </div>

          {/* Requirements */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm text-gray-300">Requirements *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.requirements && <p className="text-red-400 text-sm">{errors.requirements[0]}</p>}
          </div>

          {/* Responsibilities */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm text-gray-300">Responsibilities (Optional)</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows="4"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.responsibilities && <p className="text-red-400 text-sm">{errors.responsibilities[0]}</p>}
          </div>

          {/* Salary Min */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Minimum Salary</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.salary_min && <p className="text-red-400 text-sm">{errors.salary_min[0]}</p>}
          </div>

          {/* Salary Max */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Maximum Salary</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.salary_max && <p className="text-red-400 text-sm">{errors.salary_max[0]}</p>}
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Experience Required (Years)</label>
            <input
              type="number"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.experience_required && <p className="text-red-400 text-sm">{errors.experience_required[0]}</p>}
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Application Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.deadline && <p className="text-red-400 text-sm">{errors.deadline[0]}</p>}
          </div>

          {/* Job Type */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Job Type *</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
            {errors.job_type && <p className="text-red-400 text-sm">{errors.job_type[0]}</p>}
          </div>

          {/* Global Errors */}
          {errors.non_field_errors && (
            <div className="md:col-span-2">
              <p className="text-red-400 text-sm">{errors.non_field_errors[0]}</p>
            </div>
          )}

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Create Job
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}