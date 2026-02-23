import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
export default function SetupMFA() {
  const [otpUri, setOtpUri] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate=useNavigate()
  useEffect(() => {
    async function fetchMFA() {
      try {
        const res = await api.get("accounts/hr/setup-mfa/");
        setOtpUri(res.data.otp_uri);

      } catch (err) {
        console.log(err.response?.data);
        setMessage(err.response?.data?.error || "Failed to load MFA setup");
      }
    }
    
    fetchMFA();
  }, []);

  const verifyMFA = async () => {
    try {
      const res = await api.post(
        "accounts/hr/setup-mfa/",
        { otp }
      );
              setTimeout(() => {
          navigate("/hr/dashboard")
        }, 1000);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Setup MFA</h2>

        {otpUri && (
          <div className="flex flex-col items-center mb-6">
            <p className="mb-2 text-gray-700 text-center">
              Scan this QR code in Google Authenticator
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                otpUri
              )}&size=200x200`}
              alt="MFA QR Code"
              className="border p-2 rounded-lg shadow-md"
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Enter OTP from app"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none mb-4"
        />

        <button
          onClick={verifyMFA}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Enable MFA
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}