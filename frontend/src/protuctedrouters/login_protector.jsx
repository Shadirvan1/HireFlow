import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LoginProtector({ children }) {
  const { role, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    return children; 
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "HR") {
    return <Navigate to="/hr/dashboard" replace />;
  }

  if (role === "CANDIDATE") {
    return <Navigate to="/home" replace />;
  }

  return children;
}