import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EmailResend() {
  const [email, setEmail] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      setDisabled(true);
    }
  }, []);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const startTimer = () => {
    setCountdown(60);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEditEmail = () => {
    setDisabled(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("accounts/resend/link/", {
        email: email,
      });
      setMessage(response.data.message || "Verification link resent successfully!");
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
      startTimer();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-6">
          Resend Verification Email
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="email"
              value={email}
              disabled={disabled}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 transition duration-200 ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {disabled && (
              <p
                onClick={handleEditEmail}
                className="text-sm text-indigo-600 mt-1 cursor-pointer hover:underline"
              >
                Not your email?
              </p>
            )}
          </div>

          {message && (
            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg border border-green-300">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || countdown > 0}
            className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
              loading || countdown > 0
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Link"
            )}
          </button>

          {countdown > 0 && (
            <div>
              <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                />
              </div>
              <p className="text-xs text-indigo-500 text-center mt-1">
                You can resend in {countdown} second{countdown !== 1 ? "s" : ""}
              </p>
            </div>
          )}

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Go to login page{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}