import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/api";
import { loginSuccess } from "../redux/userReducer";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const [mfaRequired, setMfaRequired] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Handle Input Change
  // -------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear errors on change
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setNonFieldErrors([]);
    setGeneralError("");
  };

  // -------------------------
  // Handle Normal Login
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submit

    setLoading(true);
    setFieldErrors({});
    setNonFieldErrors([]);
    setGeneralError("");

    try {
      const { data } = await api.post("accounts/login/", formData);

      // If MFA required
      if (data.mfa_required && !formData.otp) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      const user = data.user;

      dispatch(
        loginSuccess({
          user_id: user.id,
          role: user.role,
        })
      );

      redirectUser(user.role);

    } catch (error) {
      const data = error.response?.data;

      if (data) {
        const fieldErrorData = {};

        Object.keys(data).forEach((key) => {
          if (key !== "non_field_errors" && key !== "error") {
            fieldErrorData[key] = data[key][0];
          }
        });

        setFieldErrors(fieldErrorData);
        setNonFieldErrors(data.non_field_errors || []);
        setGeneralError(data.error || "");
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Handle Google Login
  // -------------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;
    setLoading(true);
    setGeneralError("");

    try {
      const token = credentialResponse.credential;

      const { data } = await api.post("accounts/auth/google/", {
        token,
      });

      const user = data.user;

      dispatch(
        loginSuccess({
          user_id: user.id,
          role: user.role,
        })
      );

      redirectUser(user.role);

    } catch {
      setGeneralError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Redirect Based On Role
  // -------------------------
  const redirectUser = (role) => {
    if (role === "HR") {
      navigate("/hr/dashboard");
    } else if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/candidate/dashboard");
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 px-4">
      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/30">
        
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-2">
          Welcome Back
        </h2>

        <p className="text-center text-gray-500 mb-8 text-sm">
          Login to continue your journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl border-gray-300"
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl border-gray-300"
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* OTP */}
          {mfaRequired && (
            <div>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 border rounded-xl border-gray-300 text-center text-lg tracking-widest"
              />
              {fieldErrors.otp && (
                <p className="text-red-600 text-sm mt-1">
                  {fieldErrors.otp}
                </p>
              )}
            </div>
          )}

          {/* Non Field Errors */}
          {nonFieldErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {nonFieldErrors.map((err, index) => (
                <p key={index}>{err}</p>
              ))}
            </div>
          )}

          {/* General Error */}
          {generalError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {generalError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Google Login */}
        {!mfaRequired && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGeneralError("Google login failed")}
              />
            </div>
          </>
        )}

        {/* Links */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

        <p className="text-center text-sm text-gray-600 mt-2">
          Verify Account?{" "}
          <span
            onClick={() => navigate("/resend/link")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Click here
          </span>
        </p>

      </div>
    </div>
  );
}