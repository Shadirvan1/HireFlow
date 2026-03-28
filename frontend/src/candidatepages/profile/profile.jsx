import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../api/api";
import { logout } from "../../redux/userReducer";

export default function CandidateProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("accounts/candidate/profile/");
      setProfile(response.data);
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

            {/* Contact Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Details</h3>
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

             
            </div>

            {/* Skills */}
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

            {/* Bio */}
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