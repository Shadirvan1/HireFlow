import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function SeekerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

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

      navigate("/candidate/dashboard");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setGeneralError("Something went wrong. Please try again.");
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
  

      navigate("/options");
    } catch {
      setGeneralError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 relative px-4">


      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/hr/login")}
          className="bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full border border-white/30 hover:bg-white/30 transition duration-300 shadow-md"
        >
          Login as HR →
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/30">

        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-2">
          Welcome Back 
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Login to continue your job search journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

        
          <div>
            <input
              type="text"
              name="email"
              placeholder="Email or Phone"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition duration-200 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400 bg-red-50"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email[0]}
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
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition duration-200 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400 bg-red-50"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password[0]}
              </p>
            )}
          </div>

          {generalError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg border border-red-300">
              {generalError}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition duration-300 flex items-center justify-center ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl"
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
        <div className="text-center mt-8 space-y-2 text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>

          <p className="text-gray-600">
            Account not verified?{" "}
            <span
              onClick={() => navigate("/resend/link")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Verify now
            </span>
          </p>
          <p className="text-gray-600">
            Password {" "}
            <span
              onClick={() => navigate("/forgot/password")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Forgot ? 
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}