import api from "../api/api";
import { logoutSuccess } from "../redux/userReducer";

export const logoutUser = () => async (dispatch) => {
  try {
    await api.post("accounts/logout/");

  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    

    dispatch(logoutSuccess());
    window.location.href = "/login";
  }
};