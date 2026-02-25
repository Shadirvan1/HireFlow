import React, { useState } from "react";

export default function SecuritySettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Security & Privacy Settings
        </h1>


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

            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Manage Active Sessions
            </button>
          </div>
        </div>


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
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`px-4 py-2 rounded-lg text-white transition-colors duration-300 ${
                mfaEnabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {mfaEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="space-y-2">
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Setup Backup Codes
            </button>
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Regenerate MFA QR
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

            <div className="flex justify-between items-center border p-4 rounded-xl">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts for suspicious logins.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex justify-between items-center border p-4 rounded-xl">
              <div>
                <p className="font-medium">Login Alerts</p>
                <p className="text-sm text-gray-500">Get notified for new device logins.</p>
              </div>
              <input
                type="checkbox"
                checked={loginAlerts}
                onChange={() => setLoginAlerts(!loginAlerts)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex justify-between items-center border p-4 rounded-xl">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-500">Receive promotional emails and offers.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={() => setMarketingEmails(!marketingEmails)}
                className="w-5 h-5"
              />
            </div>
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

            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              GDPR Compliance Info
            </button>

            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Data Retention Policy
            </button>
          </div>
        </div>

        {/* API & Access Control */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            API & Access Control
          </h2>

          <div className="space-y-3">
            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Manage API Keys
            </button>

            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Role Permissions
            </button>

            <button className="w-full text-left p-4 border rounded-xl hover:bg-gray-50">
              Invite Restrictions
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}