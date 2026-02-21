import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function HrLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    hr_password: "",
    otp: "",
  });

  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});
    setLoading(true);

    try {

      const response = await api.post("accounts/hr/login/", formData);


      if (response.data.mfa_required) {
        setMfaRequired(true);
        setError("Enter the 6-digit code from Google Authenticator");
        return;
      }

 
      localStorage.setItem('role',response.data.user.role)
      localStorage.setItem('id',response.data.user.id)
      localStorage.setItem('email',response.data.user.email)
      
      setTimeout(()=>{navigate("/hr/dashboard")},1000)

    } catch (err) {
      console.log(err.response)
  if (err.response && err.response.data) {

    const data = err.response.data;

    if (data.mfa_required) {
      setMfaRequired(true);
      setError("Enter OTP from Google Authenticator");
      return;
    }

    if (data.mfa_setup_required) {
      navigate("/hr/setup-mfa");
      return;
    }

    setError("Login failed");
  } else {
    setError("Something went wrong.");
  }
} finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 relative">

    <div className="absolute top-6 left-6">
      <button
        onClick={() => navigate("/login")}
        className="text-sm text-slate-600 hover:text-indigo-600 transition"
      >
        ← Back to Seeker Login
      </button>
    </div>

    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-200">

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          HR Portal Login
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Secure access for recruiters
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <input
            type="email"
            name="email"
            placeholder="Work Email"
            value={formData.email}
            onChange={handleChange}
            disabled={mfaRequired}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Account Password"
            value={formData.password}
            onChange={handleChange}
            disabled={mfaRequired}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <input
            type="password"
            name="hr_password"
            placeholder="HR Authorization Password"
            value={formData.hr_password}
            onChange={handleChange}
            disabled={mfaRequired}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {mfaRequired && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="text-xs text-gray-500 block mb-2">
              Enter 6-digit code from Google Authenticator
            </label>
            <input
              type="text"
              name="otp"
              placeholder="123456"
              maxLength={6}
              value={formData.otp}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-center tracking-widest text-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition shadow-sm disabled:opacity-60"
        >
          {loading
            ? "Processing..."
            : mfaRequired
            ? "Verify OTP"
            : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2 text-sm">
        <p className="text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

        <p className="text-gray-600">
          Account not verified?{" "}
          <span
            onClick={() => navigate("/resend/link")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Verify now
          </span>
        </p>
      </div>

    </div>
  </div>
);
}