import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post(
        "accounts/logout/",
      );


    
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <h2>This is candidate Dashboard</h2>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Logout
      </button>
    </div>
  );
}