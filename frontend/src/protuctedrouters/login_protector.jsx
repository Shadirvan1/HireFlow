import { Navigate } from "react-router-dom";

export default function Login_protector({ children }) {
  const role = localStorage.getItem("role");
  if (role === "ADMIN" ) {
    return <Navigate to="/admin/dashboard" />;
  }
  if (role === "HR") {
    return <Navigate to="/hr/dashboard" />;
  }
  if (role === "CANDIDATE" ) {
    return <Navigate to="/home" />;
  }

  return children;
}