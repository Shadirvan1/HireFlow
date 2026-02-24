import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { loginSuccess } from "../redux/userReducer";
import {useDispatch} from "react-redux"

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });


  const [mfaRequired, setMfaRequired] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setNonFieldErrors([]);
    setGeneralError("");
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setFieldErrors({});
  setNonFieldErrors([]);
  setGeneralError("");

  try {
    const response = await api.post("accounts/login/", formData);

    if (response.data.mfa_required && !formData.otp) {
      setMfaRequired(true);
      setLoading(false);
      return;
    }

    const user = response.data.user;
    const access_token = response.data.access_token;

    dispatch(
      loginSuccess({
        user_id: user.id,
        role: user.role,
        access_token: access_token,
      })
    );

    redirectUser(user.role);

  } catch (error) {
    if (error.response?.data) {
      const data = error.response.data;

      const fieldErrorData = {};
      Object.keys(data).forEach((key) => {
        if (key !== "non_field_errors" && key !== "error") {
          fieldErrorData[key] = data[key][0];
        }
      });

      setFieldErrors(fieldErrorData);

      if (data.non_field_errors) {
        setNonFieldErrors(data.non_field_errors);
      }

      if (data.error) {
        setGeneralError(data.error);
      }
    } else {
      setGeneralError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
  const redirectUser = (role) => {
    if (role === "HR") {
      navigate("/hr/dashboard");
    } else if (role === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/candidate/dashboard");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;

      const response = await api.post("accounts/auth/google/", {
        token,
      });

      const user = response.data.user;

      localStorage.setItem("id", user.id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);

      redirectUser(user.role);
    } catch {
      setGeneralError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 px-4">
      <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/30">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-2">
          Welcome Back
        </h2>

        <p className="text-center text-gray-500 mb-8 text-sm">
          Login to continue your job search journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl border-gray-300"
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl border-gray-300"
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {mfaRequired && (
            <div>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 border rounded-xl border-gray-300 text-center text-lg tracking-widest"
              />
              {fieldErrors.otp && (
                <p className="text-red-600 text-sm mt-1">
                  {fieldErrors.otp}
                </p>
              )}
            </div>
          )}

          {nonFieldErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {nonFieldErrors.map((err, index) => (
                <p key={index}>{err}</p>
              ))}
            </div>
          )}

          {generalError && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {generalError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {!mfaRequired && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGeneralError("Google login failed")}
              />
            </div>
          </>
        )}
         <p className="text-center text-sm text-gray-600 mt-6"> Don't have a account?{" "} <span onClick={()=>navigate("/register")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> Register </span> </p>
          <p className="text-center text-sm text-gray-600 mt-6"> Account{" "} <span onClick={()=>navigate("/resend/link")} className="text-indigo-600 font-medium cursor-pointer hover:underline"> verify </span> </p>
       
      </div>
    </div>
  );
}