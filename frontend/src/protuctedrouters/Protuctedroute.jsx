import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, authChecked } = useSelector((state) => state.user);

  // ⛔ Wait until auth check completes
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // ⛔ Only redirect AFTER auth is checked
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}