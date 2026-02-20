import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function HrProfile() {
  const navigate = useNavigate();
  const storedEmail = localStorage.getItem("email");

  /* ------------------ STATES ------------------ */

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editableEmail, setEditableEmail] = useState(storedEmail || "");

  const [formData, setFormData] = useState({

    linkedin_url: "",
    designation: "",
    department: "",
    experience_years: "",
    receive_notifications: true,
    profile_image: null,
    certifications: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [generalErrors, setGeneralErrors] = useState([]);
  const [success, setSuccess] = useState("");

  /* ------------------ HANDLERS ------------------ */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "profile_image" && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFieldErrors({});
    setNonFieldErrors([]);
    setGeneralErrors([]);
    setSuccess("");

    const data = new FormData();
    data.append("email", editableEmail);

    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (value !== null && value !== "" && value !== undefined) {
        if (["experience_years", "company_id"].includes(key)) {
          value = Number(value);
        }
        data.append(key, value);
      }
    });

    setLoading(true);

    try {
      await api.post("/accounts/hr/profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Profile saved successfully!");
      localStorage.setItem("email",editableEmail)

      setTimeout(() => {
        navigate("/hr/company-details");
      }, 1500);

      setFormData({
        email:editableEmail,
        linkedin_url: "",
        designation: "",
        department: "",
        experience_years: "",
        receive_notifications: true,
        profile_image: null,
        certifications: null,
        
      });

      setPreview(null);
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        const fields = {};
        const nonFields = [];
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            if (key === "non_field_errors") {
              nonFields.push(...data[key]);
            } else {
              fields[key] = data[key];
            }
          } else {
            nonFields.push(`${key}: ${data[key]}`);
          }
        });

        setFieldErrors(fields);
        setNonFieldErrors(nonFields);
      } else {
        setGeneralErrors(["Something went wrong. Please try again later."]);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (field) => {
    if (fieldErrors[field]) {
      return (
        <p className="text-red-500 text-sm mt-1">
          {Array.isArray(fieldErrors[field])
            ? fieldErrors[field][0]
            : fieldErrors[field]}
        </p>
      );
    }
    return null;
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          HR Profile
        </h2>

        {/* Errors */}
        {nonFieldErrors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {nonFieldErrors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {generalErrors.length > 0 && (
          <div className="bg-red-200 text-red-800 p-2 rounded mb-3">
            {generalErrors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-3">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <div className="flex gap-2">
              <input
                type="email"
                value={editableEmail}
                readOnly={!isEditingEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
                className={`w-full border px-3 py-2 rounded focus:outline-none ${
                  isEditingEmail
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-400"
                    : "border-gray-300 bg-gray-100 text-gray-600"
                }`}
              />

              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                {isEditingEmail ? "Lock" : "Edit"}
              </button>
            </div>
          </div>


          {/* LinkedIn */}
          <div>
            <input
              type="url"
              name="linkedin_url"
              placeholder="LinkedIn URL"
              value={formData.linkedin_url}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
            />
            {renderFieldError("linkedin_url")}
          </div>

          {/* Designation */}
          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={formData.designation}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
          />

          {/* Department */}
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
          />

          {/* Experience */}
          <input
            type="number"
            name="experience_years"
            placeholder="Experience (Years)"
            value={formData.experience_years}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
          />

          {/* Notifications */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="receive_notifications"
              checked={formData.receive_notifications}
              onChange={handleChange}
              className="mr-2"
            />
            <label>Receive Notifications</label>
          </div>

          <div>
            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover mt-2 rounded"
              />
            )}
          </div>

          <input
            type="file"
            name="certifications"
            onChange={handleFileChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          go to add{" "}
          <span
            onClick={() => navigate("/hr/company-details")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Company
          </span>
        </p>
        <p className="text-center text-sm text-gray-600 mt-6">
          Account{" "}
          <span
            onClick={() => navigate("/resend/link")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            verify
          </span>
        </p>
        <p className="text-center text-sm text-gray-600 mt-6">
          go to {" "}
          <span
            onClick={() => navigate("/hr/login")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}