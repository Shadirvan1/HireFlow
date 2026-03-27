import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../api/api";
import { logout } from "../../redux/userReducer";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCAuGkmwpGanSarXQvL8oS2TwRh5_yYzuA",
  authDomain: "otp-sender-9f2be.firebaseapp.com",
  projectId: "otp-sender-9f2be",
  storageBucket: "otp-sender-9f2be.firebasestorage.app",
  messagingSenderId: "711191463461",
  appId: "1:711191463461:web:983aa67f409f40b2efa1cc",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export default function CandidateProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [sendError, setSendError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("accounts/candidate/profile/");
      setProfile(response.data);
      setPhoneNumber(response.data.user?.phone_number || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("accounts/logout/");
    } catch (e) {
      // silent
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/login");
    }
  };

  // ─── OTP: Send Verification Code ────────────────────────────────────────────
  const handleVerifyRequest = async () => {
    setSendError("");
    if (!phoneNumber.startsWith("+")) {
      setSendError("Include country code (e.g. +91)");
      return;
    }
    setOtpLoading(true);
    try {
      // Clear any previous RecaptchaVerifier instance
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );

      setConfirmationResult(result); // ✅ store in state, not on window
      setShowOtpInput(true);
      setOtp("");
    } catch (error) {
      console.error("OTP send error:", error);
      setSendError(error.message || "Failed to send OTP. Try again.");
      // Clear broken verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── OTP: Confirm Code ───────────────────────────────────────────────────────
  const handleOtpSubmit = async () => {
    setOtpError("");
    if (!otp || otp.length !== 6) {
      setOtpError("Enter a valid 6-digit code.");
      return;
    }
    if (!confirmationResult) {
      setOtpError("Session expired. Please resend the code.");
      return;
    }
    setVerifyLoading(true);
    try {
      // 1️⃣ Confirm with Firebase
      await confirmationResult.confirm(otp);

      // 2️⃣ Notify backend → update is_number_verified = True
      await api.post("accounts/verify-phone/", { phone_number: phoneNumber });

      // 3️⃣ Refresh profile to show Verified badge
      await fetchProfile();
      setShowOtpInput(false);
      setConfirmationResult(null);
    } catch (error) {
      console.error("OTP verify error:", error);
      setOtpError("Invalid code. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex gap-2">
          <div className="animate-bounce w-3 h-3 bg-blue-600 rounded-full" style={{ animationDelay: "0ms" }}></div>
          <div className="animate-bounce w-3 h-3 bg-blue-400 rounded-full" style={{ animationDelay: "150ms" }}></div>
          <div className="animate-bounce w-3 h-3 bg-blue-200 rounded-full" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">

      <div className="max-w-5xl mx-auto px-4 pt-10">

        {/* ── Hero Card ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 gap-4">
              <div className="flex flex-col md:flex-row items-end gap-6">
                <img
                  src={
                    profile?.profile_image ||
                    `https://ui-avatars.com/api/?name=${profile?.user?.username}&background=0D8ABC&color=fff`
                  }
                  className="w-36 h-36 rounded-3xl border-8 border-white object-cover shadow-xl bg-slate-100"
                  alt="Profile"
                />
                <div className="mb-2">
                  <h1 className="text-3xl font-black text-slate-900">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Available for opportunities
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-2 w-full md:w-auto flex-wrap">
                <Link
                  to="/candidate/profile/edit"
                  className="flex-1 md:flex-none text-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition active:scale-95"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => navigate("/change/password")}
                  className="flex-1 md:flex-none bg-green-100 text-green-600 px-6 py-3 rounded-2xl font-bold hover:bg-green-200 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 md:flex-none bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Sidebar */}
          <div className="space-y-6">

            {/* Phone Verification Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Security</h3>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-slate-500">Phone Status</span>
                {profile?.user?.is_number_verified ? (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Unverified
                  </span>
                )}
              </div>

              {/* Invisible reCAPTCHA mount point */}
              <div id="recaptcha-container"></div>

              {!profile?.user?.is_number_verified && (
                <div className="space-y-3">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setSendError("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="+91 00000 00000"
                  />

                  {sendError && (
                    <p className="text-xs text-red-500 font-medium">{sendError}</p>
                  )}

                  <button
                    onClick={handleVerifyRequest}
                    disabled={otpLoading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Sending…
                      </>
                    ) : showOtpInput ? (
                      "Resend OTP"
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>

                  {showOtpInput && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                      <p className="text-xs text-blue-600 font-semibold text-center">
                        Code sent to {phoneNumber}
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={otp}
                        className="w-full text-center text-2xl font-bold tracking-[0.6em] p-2 bg-transparent border-b-2 border-blue-300 outline-none focus:border-blue-600 transition"
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                      />
                      {otpError && (
                        <p className="text-xs text-red-500 font-medium text-center">{otpError}</p>
                      )}
                      <button
                        onClick={handleOtpSubmit}
                        disabled={verifyLoading || otp.length !== 6}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {verifyLoading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Verifying…
                          </>
                        ) : (
                          "Confirm Code"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {profile?.user?.is_number_verified && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">Phone Verified</p>
                    <p className="text-xs text-emerald-600">{profile?.user?.phone_number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Email</p>
                    <p className="text-sm font-semibold text-slate-700">{profile?.user?.email || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Phone</p>
                    <p className="text-sm font-semibold text-slate-700">{profile?.user?.phone_number || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Professional Summary */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Professional Summary</h3>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <DetailItem label="Current Role" value={profile?.current_company || "Looking for opportunities"} />
                <DetailItem label="Total Experience" value={profile?.total_experience ? `${profile.total_experience} Years` : "Fresher"} />
                <DetailItem label="Location" value={profile?.current_location} />
                <DetailItem label="Notice Period" value={profile?.notice_period_days ? `${profile.notice_period_days} Days` : "Immediate Joiner"} isHighlight />
              </div>

              {/* Resume */}
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Resume / CV</h4>
                {profile?.resume ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-slate-700 font-semibold text-sm">Resume.pdf</span>
                    </div>
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm italic">No resume uploaded yet</span>
                    <Link to="/candidate/profile/edit" className="text-blue-600 font-bold text-sm hover:underline">
                      Upload
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Skills (if available) */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Skills</h3>
                  <div className="h-1 w-20 bg-purple-500 rounded-full"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-blue-100 hover:text-blue-700 transition cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio (if available) */}
            {profile?.bio && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">About Me</h3>
                  <div className="h-1 w-20 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isHighlight }) {
  return (
    <div className="group">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1 group-hover:text-blue-500 transition-colors">
        {label}
      </p>
      <p className={`text-lg font-bold ${isHighlight ? "text-blue-600" : "text-slate-800"}`}>
        {value || "Not Specified"}
      </p>
    </div>
  );
}