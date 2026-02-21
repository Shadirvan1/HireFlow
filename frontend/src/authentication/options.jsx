import React from "react";
import { useNavigate } from "react-router-dom";

export default function Options() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome</h1>
      <p style={styles.subtitle}>Choose how you want to continue</p>

      <div style={styles.cardContainer}>
        <div style={styles.card} onClick={() => navigate("/hr/profile")}>
          <h2>HR</h2>
          <p>Manage hiring, post jobs, and handle candidates.</p>
          <button style={styles.button}>Continue as HR</button>
        </div>

        <div
          style={styles.card}
          onClick={() => {
            localStorage.setItem("role", "CANDIDATE");
            navigate("/login");
          }}
        >                                                                                                
          <h2>Candidate</h2>
          <p>Apply for jobs and manage your profile.</p>
          <button style={styles.button}>Continue as Candidate</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f9",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  subtitle: {
    marginBottom: "30px",
    color: "#555",
  },
  cardContainer: {
    display: "flex",
    gap: "30px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    width: "280px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  button: {
    marginTop: "15px",
    padding: "10px 15px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
