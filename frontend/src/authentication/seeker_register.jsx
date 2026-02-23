import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import publicApi from "../api/publicapi";

export default function Seeker_register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
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

    try {
      setErrors({});
      setGeneralError("");

      const data = await publicApi.post("accounts/register/", formData);

      localStorage.setItem("id", data.data.user.id);
      localStorage.setItem("email", data.data.user.email);
      localStorage.setItem("role", data.data.user.role);
      alert("Verification link sent to your email address")
      navigate("/options");
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


      navigate("/options");
    } catch (err) {
      alert("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">
           Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username[0]}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email[0]}</p>
          )}

          <input
            type="text"
            name="phone_number"
            placeholder="Phone number"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone[0]}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password[0]}</p>
          )}

          {generalError && (
            <p className="text-red-500 text-center">{generalError}</p>
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
              "Create Account"
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center ">
          {loading ? (
            <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
            />
          )}
        </div>
        <p className="text-center text-sm text-gray-600 mt-6"> Already have an account? {" "} <span onClick={()=>navigate("/login")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> Login </span> </p>
        <p className="text-center text-sm text-gray-600 mt-6"> Account{" "} <span onClick={()=>navigate("/resend/link")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> verify </span> </p>
      </div>
    </div>
  );
}
