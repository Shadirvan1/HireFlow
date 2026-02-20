import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Seekerlogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    try {
      const response = await api.post("accounts/login/", formData);

      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("role", response.data.user.role);

      navigate("/home");
    } catch (error) {
      console.log(error.response)
      if (error.response?.data) {
        setErrors(error.response.data);
        
      } else {
        setGeneralError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;

      const response = await api.post("accounts/auth/google/", { token });

      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("role", response.data.user.role);

      navigate("/home");
    } catch (err) {
      setGeneralError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          Job Seeker Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <input
              type="text"
              name="email"
              placeholder="Email or Phone"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition duration-200 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400 bg-red-50"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.phone_email && (
              <p className="text-red-600 text-sm mt-1 font-medium animate-fadeIn">
                {errors.phone_email[0]}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition duration-200 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400 bg-red-50"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1 font-medium animate-fadeIn">
                {errors.password[0]}
              </p>
            )}
          </div>

          {generalError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg border border-red-300 animate-fadeIn">
              {generalError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center">
          {loading ? (
            <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setGeneralError("Google login failed")}
            />
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
           <p className="text-center text-sm text-gray-600 mt-6"> Account{" "} <span onClick={()=>navigate("/resend/link")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> verify </span> </p>
        </p>

      </div>
    </div>
  );
}
