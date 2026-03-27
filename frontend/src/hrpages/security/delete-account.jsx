import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/userReducer";
import api from "../../api/api";
import { toast, Toaster } from "react-hot-toast";
import { FiAlertTriangle, FiMail, FiLock, FiTrash2 } from "react-icons/fi";

// Helper to mask email → j***@gmail.com
const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  const masked = local[0] + "***";
  return `${masked}@${domain}`;
};

export default function DeleteAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state) => state.user.email); // adjust if needed

  const [step, setStep] = useState(1); // 1 = password, 2 = OTP
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // ── Start countdown timer for resend
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("accounts/delete-account/request/", { password });
      toast.success("OTP sent to your email!");
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.password?.[0] || err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError("");

    try {
      await api.post("accounts/delete-account/request/", { password });
      toast.success("OTP resent!");
      startCountdown();
    } catch (err) {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Confirm Delete
  const handleConfirmDelete = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.delete("accounts/delete-account/confirm/", {
        data: { otp },
      });

      dispatch(logout());
      toast.success("Account deleted.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.otp?.[0] || err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiTrash2 size={28} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Delete Account</h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            This will <strong>permanently delete</strong> your account and all your data. This cannot be undone.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-red-600">
            All your applications, saved jobs, and profile data will be permanently removed.
          </p>
        </div>

        {/* ── STEP 1: Password */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Confirm your password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                />
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all
                ${loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button
              onClick={() => navigate("/hr/security")}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP 2: OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <FiMail className="text-blue-500 shrink-0" size={16} />
              <p className="text-sm text-blue-700">
                OTP sent to <strong>{maskEmail(email)}</strong>. Valid for 5 minutes.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "")); // numbers only
                  setError("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-center text-xl tracking-widest font-bold"
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* Resend countdown */}
            <p className="text-center text-sm text-gray-500">
              {countdown > 0 ? (
                <>Resend OTP in <strong className="text-gray-700">{countdown}s</strong></>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </p>

            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all
                ${loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              Go Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}