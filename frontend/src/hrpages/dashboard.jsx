import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function HrDashboard() {
  const navigate = useNavigate();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchMfaStatus = async () => {
      try {
        const res = await api.get("/accounts/hr/setup-mfa/");
        setMfaEnabled(res.data.mfa_enabled);
        console.log(res.data)
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

  const handleLogout = async () => {
    try {
      await api.post("/accounts/logout/");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">


      <aside className="w-64 bg-indigo-700 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">HireFlow HR</h2>

        <nav className="space-y-4">
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Dashboard
          </button>
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Candidates
          </button>
          <button className="block w-full text-left hover:bg-indigo-600 p-2 rounded">
            Settings
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full bg-red-500 hover:bg-red-600 transition py-2 rounded"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            HR Dashboard
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Multi-Factor Authentication
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Secure your account with an additional verification step.
            </p>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : (
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${
                    mfaEnabled ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {mfaEnabled ? "Enabled" : "Disabled"}
                </span>

                <button
                  onClick={handleMfaClick}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    mfaEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full transition ${
                      mfaEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}