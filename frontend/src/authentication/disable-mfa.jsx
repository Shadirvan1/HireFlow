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
      const res = await api.post("accounts/hr/disable-mfa/", {
        otp: otp,
      });

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-200 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Disable MFA
        </h2>

        <p className="text-sm text-gray-600 text-center mb-4">
          Enter the 6-digit code from your Authenticator app to disable MFA.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleDisable} className="space-y-4">

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-60"
          >
            {loading ? "Processing..." : "Disable MFA"}
          </button>

        </form>

      </div>
    </div>
  );
}