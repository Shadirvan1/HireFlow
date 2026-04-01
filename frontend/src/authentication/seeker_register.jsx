import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Seeker_register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setGeneralError("");
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      setErrors({});
      setGeneralError("");

      const data = await api.post("accounts/register/", formData);

      localStorage.setItem("id", data.data.user.id);
      localStorage.setItem("email", data.data.user.email);
      localStorage.setItem("role", data.data.user.role);
      alert("Verification link sent to your email address");
      navigate("/login");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;
      const data = await api.post("accounts/auth/google/", { token });

      localStorage.setItem("id", data.data.user.id);
      localStorage.setItem("email", data.data.user.email);

      navigate("/login");
    } catch (err) {
      alert("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-gray-50 hover:bg-white";

  const eyeBtn =
    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition text-sm select-none cursor-pointer";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-3">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-indigo-700">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">Sign up to get started today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              required
              onChange={handleChange}
              className={`${inputBase} ${errors.username ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.username[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={handleChange}
              className={`${inputBase} ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              placeholder="Enter your phone number"
              required
              onChange={handleChange}
              className={`${inputBase} ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                required
                onChange={handleChange}
                className={`${inputBase} pr-10 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              <span className={eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm_password"
                placeholder="Re-enter your password"
                required
                value={confirmPassword}
                onChange={handleConfirmChange}
                className={`${inputBase} pr-10 ${confirmPasswordError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              <span className={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{confirmPasswordError}</p>
            )}
            {confirmPassword && formData.password && !confirmPasswordError && confirmPassword === formData.password && (
              <p className="text-green-500 text-xs mt-1 ml-1">✓ Passwords match</p>
            )}
          </div>

          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl text-center">
              {generalError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm transition duration-300 flex items-center justify-center mt-2 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-3 text-gray-400 text-xs font-medium">OR CONTINUE WITH</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* Google */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
            />
          )}
        </div>

        {/* Footer links */}
        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Login
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Need to verify your account?{" "}
            <span onClick={() => navigate("/resend/link")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Verify
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Are you an HR?{" "}
            <span onClick={() => navigate("/hr/register")} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Register here
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}