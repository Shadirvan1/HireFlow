import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api"; // Ensure this path is correct

export default function SecuritySettings() {
  const navigate = useNavigate();
  
  // Logic from Dashboard
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Other UI states
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // 1. Fetch MFA Status on load (Logic from Dashboard)
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

  // 2. Handle Navigation (Logic from Dashboard)
  const handleMfaClick = () => {
    if (mfaEnabled) {
      navigate("/hr/disable-mfa");
    } else {
      navigate("/hr/setup-mfa");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Security & Privacy Settings
        </h1>

        {/* Account Security */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Account Security
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Change Password
            </button>
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              View Login Activity
            </button>
            <button className="w-full text-left p-4 border rounded-xl hover:bg-red-50 text-red-600">
              Logout All Devices
            </button>
          </div>
        </div>

        {/* Multi-Factor Authentication (Logic Integrated Here) */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Multi-Factor Authentication (MFA)
          </h2>

          <div className="flex justify-between items-center border p-4 rounded-xl mb-4">
            <div>
              <p className="font-medium">Enable MFA</p>
              <p className="text-sm text-gray-500">
                Add extra layer of security to your account.
              </p>
            </div>
            
            {loading ? (
              <span className="text-gray-400 text-sm">Checking...</span>
            ) : (
              <button
                onClick={handleMfaClick} // Navigates based on status
                className={`px-4 py-2 rounded-lg text-white transition-all duration-300 ${
                  mfaEnabled 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {mfaEnabled ? "Manage / Disable" : "Set Up MFA"}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Setup Backup Codes
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Privacy Settings
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border p-4 rounded-xl">
              <div>
                <p className="font-medium">Show Online Status</p>
                <p className="text-sm text-gray-500">Let others see when you are online.</p>
              </div>
              <input
                type="checkbox"
                checked={onlineStatus}
                onChange={() => setOnlineStatus(!onlineStatus)}
                className="w-5 h-5"
              />
            </div>
            {/* ... other checkboxes remain same ... */}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Data & Privacy
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Download My Data
            </button>
            <button className="w-full text-left p-4 border rounded-xl hover:bg-red-50 text-red-600">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}