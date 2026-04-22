import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function DisableMFA() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDisable = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("accounts/hr/disable-mfa/", { otp });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/hr/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-red-50 to-rose-100 px-4">
      <div className="bg-white shadow-xl border border-gray-100 rounded-3xl w-full max-w-md p-8 flex flex-col items-center">

        {/* Header Icon */}
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Disable Two-Factor Auth
        </h2>
        <p className="text-sm text-gray-400 mt-1 mb-6 text-center">
          Enter your 6-digit code from the authenticator app to confirm.
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="w-full flex items-start gap-3 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-4">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleDisable} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              One-Time Password
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-gray-900 text-sm bg-gray-50 placeholder-gray-400 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Disable Two-Factor Authentication"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}