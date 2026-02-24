import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout, authCheckComplete } from "../redux/userReducer";
import api from "../api/api";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;   // prevent double run
    hasRun.current = true;

    const checkAuth = async () => {
      try {
        const response = await api.get("accounts/me/");
        const user = response.data;

        dispatch(
          loginSuccess({
            user_id: user.id,
            role: user.role,
          })
        );
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(authCheckComplete());
      }
    };

    checkAuth();
  }, [dispatch]);

  return children;
}