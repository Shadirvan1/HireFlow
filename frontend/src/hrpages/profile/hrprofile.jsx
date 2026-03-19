import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { 
  User, Briefcase, Linkedin, Camera, FileText, 
  Save, Edit2, Loader2, Mail, Building, 
  Award, Shield, CheckCircle, XCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function HRProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/hr/profile/");
      setProfile(res.data);
    } catch (err) {
      toast.error("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    // We handle 'is_active' separately via confirmation toast
    if (name === "is_active") return; 

    setProfile((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  // --- Confirmation Toast for Status Toggle ---
  const confirmStatusChange = (checked) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm font-semibold text-slate-800">
          Set profile to <span className={checked ? "text-green-600" : "text-red-600"}>
            {checked ? "ACTIVE" : "INACTIVE"}
          </span>?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setProfile((prev) => ({ ...prev, is_active: checked }));
              toast.dismiss(t.id);
              toast.success(`Status updated to ${checked ? 'Active' : 'Inactive'}`);
            }}
            className={`px-3 py-1 text-xs text-white rounded-md font-bold ${
              checked ? "bg-green-600" : "bg-red-600"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();

    // Fields allowed for update based on your Serializer
    const editableFields = [
      "linkedin_url",
      "designation",
      "department",
      "experience_years",
      "receive_notifications",
      "is_active",
    ];

    editableFields.forEach((field) => {
      if (profile[field] !== undefined && profile[field] !== null) {
        formData.append(field, profile[field]);
      }
    });

    // Append File objects
    if (profile.profile_image instanceof File) {
      formData.append("profile_image", profile.profile_image);
    }
    if (profile.certifications instanceof File) {
      formData.append("certifications", profile.certifications);
    }

    // Using toast.promise for better UX
    await toast.promise(
      api.patch("accounts/hr/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: "Saving your profile...",
        success: (res) => {
          setProfile(res.data);
          setIsEditing(false);
          setSaving(false);
          return "Profile successfully updated!";
        },
        error: (err) => {
          setSaving(false);
          const errorData = err.response?.data;
          if (typeof errorData === "object") {
             return Object.values(errorData)[0][0] || "Save failed";
          }
          return "Could not save profile.";
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Main Profile Container */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          
          {/* Visual Header / Banner */}
          <div className="h-44 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative">
            <div className="absolute -bottom-16 left-10 flex items-end gap-6">
              <div className="relative group">
                <div className="w-36 h-36 rounded-[2rem] bg-slate-800 border-[6px] border-[#0F172A] overflow-hidden shadow-2xl">
                  {profile.profile_image && typeof profile.profile_image === "string" ? (
                    <img src={profile.profile_image} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <User className="w-full h-full p-10 text-slate-600" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all rounded-[2rem]">
                    <Camera className="text-white" size={28} />
                    <input type="file" name="profile_image" hidden onChange={handleInputChange} />
                  </label>
                )}
              </div>
              <div className="mb-6">
                <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                  {profile.user?.username || "HR Manager"}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-blue-200 text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    <Mail size={14} /> {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 text-sm bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                    <Building size={14} /> {profile.company?.name || "Independent"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* COLUMN 1: ACCOUNT DETAILS */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                <Shield size={20} className="text-indigo-500" /> Account Security
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Login Email</label>
                  <div className="mt-1.5 p-3.5 bg-slate-800/30 border border-slate-800 rounded-2xl text-slate-500 text-sm flex items-center justify-between italic">
                    {profile.email} <CheckCircle size={16} className="text-green-500/50"/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Designation</label>
                  <input 
                    name="designation" 
                    disabled={!isEditing} 
                    value={profile.designation || ""} 
                    onChange={handleInputChange}
                    placeholder="e.g. Talent Acquisition Lead"
                    className="w-full mt-1.5 bg-slate-800/50 border border-slate-700 rounded-2xl p-3.5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all disabled:opacity-40" 
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: PROFESSIONAL INFO */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                <Briefcase size={20} className="text-indigo-500" /> Professional
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</label>
                  <input 
                    name="department" 
                    disabled={!isEditing} 
                    value={profile.department || ""} 
                    onChange={handleInputChange}
                    className="w-full mt-1.5 bg-slate-800/50 border border-slate-700 rounded-2xl p-3.5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all disabled:opacity-40" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Years of Experience</label>
                  <input 
                    name="experience_years" 
                    type="number" 
                    disabled={!isEditing} 
                    value={profile.experience_years || 0} 
                    onChange={handleInputChange}
                    className="w-full mt-1.5 bg-slate-800/50 border border-slate-700 rounded-2xl p-3.5 text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all disabled:opacity-40" 
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 3: VERIFICATION & DOCS */}
            <div className="space-y-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                <Award size={20} className="text-indigo-500" /> Verification
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LinkedIn Profile URL</label>
                  <div className="relative mt-1.5">
                    <Linkedin size={18} className="absolute left-4 top-4 text-slate-500" />
                    <input 
                      name="linkedin_url" 
                      disabled={!isEditing} 
                      value={profile.linkedin_url || ""} 
                      onChange={handleInputChange}
                      className="w-full pl-12 bg-slate-800/50 border border-slate-700 rounded-2xl p-3.5 text-white text-sm outline-none focus:ring-2 ring-indigo-500/50 transition-all disabled:opacity-40" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Certification File</label>
                  <div className="mt-1.5">
                    {isEditing ? (
                      <label className="flex items-center gap-3 p-3 bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all">
                        <div className="bg-indigo-500/10 p-2 rounded-lg"><FileText size={20} className="text-indigo-400" /></div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-300 truncate">
                            {profile.certifications instanceof File ? profile.certifications.name : "Click to re-upload"}
                          </p>
                          <p className="text-[10px] text-slate-500">PDF or Image (Max 10MB)</p>
                        </div>
                        <input type="file" name="certifications" hidden onChange={handleInputChange} />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/20 border border-slate-800 rounded-2xl">
                        <FileText size={20} className="text-slate-600" />
                        <span className="text-xs text-slate-500 font-medium italic">Document Securely Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS & STATUS */}
            <div className="md:col-span-2 lg:col-span-3 border-t border-slate-800/50 pt-10 mt-6 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Toggles Group */}
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={profile.is_active} 
                      onChange={(e) => isEditing && confirmStatusChange(e.target.checked)} 
                      className="sr-only peer" 
                      disabled={!isEditing}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 opacity-50 peer-enabled:opacity-100"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-400">Profile Status: {profile.is_active ? "Active" : "Hidden"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name="receive_notifications" 
                    id="notif" 
                    disabled={!isEditing} 
                    checked={profile.receive_notifications} 
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer disabled:opacity-30" 
                  />
                  <label htmlFor="notif" className="text-sm font-medium text-slate-400">Email Alerts for Applications</label>
                </div>
              </div>

              {/* Save/Edit Buttons */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="flex-1 lg:flex-none px-8 py-3.5 rounded-2xl text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={saving} 
                      className="flex-1 lg:flex-none px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="w-full lg:w-auto px-10 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all hover:border-slate-500"
                  >
                    <Edit2 size={18} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}