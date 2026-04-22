import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function SecuritySettings() {
  const navigate = useNavigate();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [onlineStatus, setOnlineStatus] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    const fetchMfaStatus = async () => {
      try {
        const res = await api.get("/accounts/hr/setup-mfa/");
        setMfaEnabled(res.data.mfa_enabled);
      } catch (err) {
        console.error("Failed to fetch MFA status");
      } finally {
        setLoading(false);
      }
    };
    fetchMfaStatus();
  }, []);

  const handleMfaClick = () => {
    if (mfaEnabled) {
      navigate("/hr/disable-mfa");
    } else {
      navigate("/hr/setup-mfa");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Security & Privacy
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account security preferences and privacy settings.
          </p>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🔑</span>
              Account Security
            </h2>
          </div>
          <div className="p-4">
            <button
              onClick={() => navigate("/change/password")}
              className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all duration-200 group flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">Change Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* MFA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🛡️</span>
              Multi-Factor Authentication
            </h2>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center px-5 py-4 rounded-xl border border-gray-200 bg-gray-50/40">
              <div>
                <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add an extra layer of security to your account.
                </p>
                {!loading && (
                  <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    mfaEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${mfaEnabled ? "bg-green-500" : "bg-gray-400"}`} />
                    {mfaEnabled ? "Enabled" : "Not enabled"}
                  </span>
                )}
              </div>

              {loading ? (
                <span className="text-gray-400 text-xs animate-pulse">Checking...</span>
              ) : (
                <button
                  onClick={handleMfaClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-sm hover:shadow ${
                    mfaEnabled
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {mfaEnabled ? "Manage / Disable" : "Set Up MFA"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-500 flex items-center justify-center text-sm">⚠️</span>
              Data & Privacy
            </h2>
          </div>
          <div className="p-4">
            <button
              onClick={() => navigate("/hr/delete-account")}
              className="w-full text-left px-5 py-4 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 group flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-red-400 mt-0.5">Permanently remove your account and all data.</p>
              </div>
              <svg className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}