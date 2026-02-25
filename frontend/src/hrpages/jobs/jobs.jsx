import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("jobs/hr/get/companyjobs/");
      setJobs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    navigate("/hr/create-job");
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`jobs/hr/companyjobs/${id}/`, {
        is_active: !currentStatus,
      });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === id ? { ...job, is_active: !job.is_active } : job
        )
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      await api.delete(`jobs/hr/companyjobs/${id}/`);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Jobs
          </h1>
          <p className="text-gray-500 mt-3 text-sm">
            Manage and control your company job postings
          </p>
        </div>

        <button
          onClick={handleCreateJob}
          className="px-8 py-3 rounded-2xl 
                     bg-gradient-to-r from-indigo-600 to-blue-600 
                     text-white font-semibold 
                     shadow-lg hover:shadow-xl 
                     hover:-translate-y-0.5 
                     transition-all duration-300"
        >
          Create Job
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 text-lg">
          Loading jobs...
        </div>
      )}

      {/* No Jobs */}
      {!loading && jobs.length === 0 && (
        <div className="text-center text-gray-500 text-lg">
          No jobs available
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 
                         shadow-lg hover:shadow-2xl hover:-translate-y-1 
                         transition-all duration-500"
            >
              {/* Title & Job Type */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
                  {job.title}
                </h2>
                <span
                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                    job.job_type === "FULL_TIME"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {job.job_type.replace("_", " ")}
                </span>
              </div>

              {/* Job Meta */}
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-500">Location:</span> {job.location}</p>
                <p><span className="font-medium text-gray-500">Salary:</span> {formatSalary(job.salary_min)} – {formatSalary(job.salary_max)}</p>
                <p><span className="font-medium text-gray-500">Experience:</span> {job.experience_required} years</p>
                <p><span className="font-medium text-gray-500">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</p>
                <p><span className="font-medium text-gray-500">Company ID:</span> {job.company}</p>
                <p><span className="font-medium text-gray-500">Created:</span> {new Date(job.created_at).toLocaleDateString()}</p>
                <p><span className="font-medium text-gray-500">Updated:</span> {new Date(job.updated_at).toLocaleDateString()}</p>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-500 mb-2 font-medium">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-500 mb-2 font-medium">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {job.requirements.split("\n").map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div className="mt-6">
                <h3 className="text-sm text-gray-500 mb-2 font-medium">Responsibilities</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {job.responsibilities.split("\n").map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </div>

              {/* Status Badges */}
              <div className="flex justify-between items-center mt-8">
                <span className={`px-4 py-1 rounded-full text-xs font-semibold ${
                  job.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {job.is_active ? "Active" : "Inactive"}
                </span>
                <span className={`px-4 py-1 rounded-full text-xs font-semibold ${
                  job.is_approve
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {job.is_approve ? "Approved" : "Pending"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleToggle(job.id, job.is_active)}
                  className={`flex-1 py-3 rounded-2xl font-semibold text-white
                             transition-all duration-300 shadow-md hover:shadow-lg ${
                               job.is_active
                                 ? "bg-gradient-to-r from-orange-500 to-red-500 hover:-translate-y-0.5"
                                 : "bg-gradient-to-r from-emerald-500 to-green-500 hover:-translate-y-0.5"
                             }`}
                >
                  {job.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white
                             bg-gradient-to-r from-rose-500 to-red-600
                             shadow-md hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}