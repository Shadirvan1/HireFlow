import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function HrLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    hr_password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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

  const validate = () => {
    let errors = {};

    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    if (!formData.hr_password) errors.hr_password = "HR Password is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("accounts/hr/login/", formData);

      // Save token or email if needed
      localStorage.setItem("email", formData.email);

      navigate("/hr-dashboard");

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Login failed");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          HR Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Account Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* HR Password */}
          <div>
            <input
              type="password"
              name="hr_password"
              placeholder="HR Password"
              value={formData.hr_password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            {fieldErrors.hr_password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.hr_password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}