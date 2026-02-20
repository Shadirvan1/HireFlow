import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginOptions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        {/* Top Button */}
        <button
          onClick={() => navigate("/get-hr-password")}
          className="w-full mb-6 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition duration-300 shadow-md"
        >
          🔑 Get HR Password
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Choose Login Type
        </h2>

        <div className="space-y-4">

          {/* HR Login */}
          <button
            onClick={() => navigate("/login/hr")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg hover:scale-105"
          >
            👔 Login as HR
          </button>
          <button
            onClick={() => navigate("/login/candidate")}
            className="w-full py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition duration-300 shadow-lg hover:scale-105"
          >
            👤 Login as Candidate
          </button>

        </div>
      </div>
    </div>
  );
}