import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CandidateProfile() {

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    current_location: "",
    total_experience: "",
    current_company: "",
    current_ctc: "",
    expected_ctc: "",
    notice_period_days: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
    receive_notifications: true,
    profile_image: null,
  });
 const navigate = useNavigate()
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/candidate/profile/");
      setFormData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({ ...errors, [name]: "" });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      profile_image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await api.put("accounts/candidate/profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      setTimeout(()=>{
navigate("/candidate/dashboard")
      },1000)
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8">

        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Candidate Profile
        </h2>

        {message && (
          <div className="mb-4 text-green-600 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

          {["first_name", "last_name", "current_location"].map((field) => (
            <div key={field}>
              <input
                name={field}
                placeholder={field.replace("_", " ").toUpperCase()}
                value={formData[field] || ""}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl ${
                  errors[field] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field][0]}
                </p>
              )}
            </div>
          ))}

          <div>
            <input
              type="number"
              name="total_experience"
              placeholder="Total Experience"
              value={formData.total_experience || ""}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl ${
                errors.total_experience ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.total_experience && (
              <p className="text-red-500 text-sm mt-1">
                {errors.total_experience[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              name="notice_period_days"
              placeholder="Notice Period"
              value={formData.notice_period_days || ""}
              onChange={handleChange}
              className={`w-full p-3 border rounded-xl ${
                errors.notice_period_days ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.notice_period_days && (
              <p className="text-red-500 text-sm mt-1">
                {errors.notice_period_days[0]}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <input type="file" onChange={handleImageChange} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
        <p className="text-gray-600">
            Skip for now{" "}
            <span
              onClick={() => navigate("/candidate/dashboard")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Skip
            </span>
          </p>
      </div>
    </div>
  );
}