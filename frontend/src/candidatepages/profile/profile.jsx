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
      console.log("Backend logout failed, proceeding with local logout");
    } finally {
      localStorage.clear();
      dispatch(logout());
      navigate("/login");
    }
  };

  // OTP Logic
  const handleVerifyRequest = async () => {
    if (!phoneNumber.startsWith("+")) {
      alert("Include country code (e.g. +91)");
      return;
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtpInput(true);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-bounce w-4 h-4 bg-blue-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">


      <div className="max-w-5xl mx-auto px-4 pt-10">
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 gap-4">
              <div className="flex flex-col md:flex-row items-end gap-6">
                <img
                  src={profile?.profile_image || `https://ui-avatars.com/api/?name=${profile?.user?.username}&background=0D8ABC&color=fff`}
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

              <div className="flex gap-3 mb-2 w-full md:w-auto">
                <Link to="/candidate/profile/edit" className="flex-1 md:flex-none text-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition active:scale-95">
                  Edit Profile
                </Link>
                <button onClick={handleLogout} className="flex-1 md:flex-none bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Sidebar */}
          <div className="space-y-6">
            {/* Verification Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Security</h3>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-slate-500">Phone Status</span>
                {profile?.user?.is_number_verified ? (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified</span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Unverified</span>
                )}
              </div>

              <div id="recaptcha-container"></div>

              {!profile?.user?.is_number_verified && (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                    placeholder="+91 00000 00000"
                  />
                  <button onClick={handleVerifyRequest} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition">
                    {showOtpInput ? "Resend OTP" : "Send Verification Code"}
                  </button>

                  {showOtpInput && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <input
                        type="text"
                        placeholder="6-digit code"
                        className="w-full text-center text-xl font-bold tracking-widest p-2 bg-transparent border-b-2 border-blue-300 outline-none"
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button onClick={handleOtpSubmit} className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                        Confirm Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-6">
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

              <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resume / CV</h4>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">candidate_resume_2026.pdf</span>
                  <button className="text-blue-600 font-bold text-sm hover:underline">Download</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isHighlight }) {
  return (
    <div className="group">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1 group-hover:text-blue-500 transition-colors">{label}</p>
      <p className={`text-lg font-bold ${isHighlight ? "text-blue-600" : "text-slate-800"}`}>
        {value || "Not Specified"}
      </p>
    </div>
  );
}