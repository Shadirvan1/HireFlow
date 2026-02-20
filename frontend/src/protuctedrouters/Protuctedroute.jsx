import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");



  if (!role) {
    return <Navigate to="/login"  />;
  }


  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/"  />;
  }

  return children;
}