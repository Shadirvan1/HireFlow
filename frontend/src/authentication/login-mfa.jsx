import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/api";
import { loginSuccess } from "../redux/userReducer";
import { FiShield } from "react-icons/fi";

export default function MfaLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  
  const { email, password, fcmToken } = location.state || {};

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 
  if (!email || !password) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("accounts/login/", {
        email,
        password,
        otp,
        fcm_token: fcmToken,
      });

      const user = data.user;
      dispatch(loginSuccess({
        user_id: user.id,
        role: user.role,
        email: user.email,
      }));

      

    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.otp?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.error ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 px-4">
      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/30">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <FiShield size={28} className="text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <input
              type="text"
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "")); 
                setError("");
              }}
              maxLength={6}
              className="w-full px-4 py-4 border rounded-xl border-gray-300 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}
