import React, { useState } from "react";
import api from "../api/api";

export default function HrCompanyDetails() {
  const emailFromStorage = localStorage.getItem("email");

  const [formData, setFormData] = useState({
    email: emailFromStorage || "",
    name: "",
    website: "",
    industry: "",
    company_size: "",
    headquarters: "",
    description: "",
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    let errors = {};

    if (!formData.email) errors.email = "Email is required";
    if (!formData.name) errors.name = "Company name is required";
    if (!formData.industry) errors.industry = "Industry is required";
    if (!formData.company_size)
      errors.company_size = "Company size is required";
    if (!formData.headquarters)
      errors.headquarters = "Headquarters is required";

    if (
      formData.website &&
      !formData.website.startsWith("http://") &&
      !formData.website.startsWith("https://")
    ) {
      errors.website = "Website must start with http:// or https://";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFieldErrors({});
    setGeneralError("");
    setSuccess("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    setLoading(true);

    try {
      const response = await api.post("accounts/hr/company/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(response.data.message || "Company saved successfully!");
      setFieldErrors({});
      setTimeout(() => {
        navigate("/hr/login");
      }, 1000);
    } catch (err) {
      if (err.response && err.response.data) {
        setFieldErrors(err.response.data);
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg p-8">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Company Details
        </h2>

        {generalError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {generalError}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="HR Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Company Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <input
              type="url"
              name="website"
              placeholder="Website (https://...)"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.website && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.website}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <input
              type="text"
              name="industry"
              placeholder="Industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.industry && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.industry}</p>
            )}
          </div>

          {/* Company Size */}
          <div>
            <input
              type="text"
              name="company_size"
              placeholder="Company Size (e.g., 50-200)"
              value={formData.company_size}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.company_size && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.company_size}</p>
            )}
          </div>

          {/* Headquarters */}
          <div>
            <input
              type="text"
              name="headquarters"
              placeholder="Headquarters"
              value={formData.headquarters}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.headquarters && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.headquarters}</p>
            )}
          </div>

          {/* Description */}
          <textarea
            name="description"
            placeholder="Company Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-24 resize-none"
          />

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Company Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm"
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover mt-3 rounded-lg border shadow-sm"
              />
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Company"}
          </button>

        </form>
      </div>
    </div>
  );
}