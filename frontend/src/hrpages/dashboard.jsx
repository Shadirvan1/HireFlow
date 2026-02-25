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



  return (
    <div className="min-h-screen bg-gray-100 flex">


    

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