import React, { useState } from "react";
import {
  FaUsers, FaBriefcase, FaChartLine, FaClipboardCheck, FaArrowRight,
  FaCode, FaDatabase, FaCloud, FaPalette, FaMoneyBillWave, FaBullhorn,
  FaSearch, FaMapMarkerAlt, FaRocket, FaShieldAlt, FaMagic
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const JOB_CATEGORIES = [
  { label: "Software Engineering",  icon: <FaCode />,         href: "/candidate/jobs?category=software-engineering",  count: "4,200+ jobs" },
  { label: "Data Science & AI",     icon: <FaDatabase />,      href: "/candidate/jobs?category=data-science",          count: "1,800+ jobs" },
  { label: "Cloud & DevOps",        icon: <FaCloud />,         href: "/candidate/jobs?category=cloud-devops",          count: "1,100+ jobs" },
  { label: "Design & UX",           icon: <FaPalette />,       href: "/candidate/jobs?category=design",                count: "900+ jobs"   },
  { label: "Finance & Accounting",  icon: <FaMoneyBillWave />, href: "/candidate/jobs?category=finance",               count: "1,500+ jobs" },
  { label: "Marketing & Sales",     icon: <FaBullhorn />,      href: "/candidate/jobs?category=marketing",             count: "2,100+ jobs" },
];

export default function Intro() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col relative overflow-hidden selection:bg-indigo-100">
        
        {/* Background Blobs */}
        <div aria-hidden="true" className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] pointer-events-none" />

        <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 w-full">
          
          {/* ── HERO SECTION ──────────────────────────────────────────────── */}
          <article className="flex flex-col items-center text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                New: AI-Powered Job Matching is Live
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tight text-slate-900 mb-6">
              Your Dream Job is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                One Click Away
              </span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed font-light mb-10">
              Stop searching, start landing. Connect with 10,000+ top-tier companies in India. 
              From high-growth startups to Fortune 500s, find the role that fits your life.
            </p>

            {/* ── SMART SEARCH BAR ────────────────────────────────────────── */}
            <div className="w-full max-w-4xl bg-white p-2 md:p-4 rounded-2xl md:rounded-full shadow-2xl shadow-indigo-200/50 border border-slate-100 flex flex-col md:flex-row gap-2 mb-12">
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
                <FaSearch className="text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="Job title, skills, or company..." 
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 gap-3 py-2 md:py-0">
                <FaMapMarkerAlt className="text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="City or Remote" 
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <button 
                onClick={() => navigate("/candidate/jobs")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl md:rounded-full font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-200"
              >
                Find Jobs
              </button>
            </div>

            {/* Candidate Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                <p className="w-full text-xs font-bold uppercase tracking-widest text-slate-400 mb-[-1rem]">Trusted by talent from</p>
                <span className="font-bold text-xl text-slate-400">Google</span>
                <span className="font-bold text-xl text-slate-400">Zomato</span>
                <span className="font-bold text-xl text-slate-400">TCS</span>
                <span className="font-bold text-xl text-slate-400">CRED</span>
                <span className="font-bold text-xl text-slate-400">Microsoft</span>
            </div>
          </article>

          {/* ── WHY FIND JOBS HERE? ───────────────────────────────────────── */}
          <section className="grid md:grid-cols-3 gap-8 mb-24">
            <FeatureCard 
              icon={<FaMagic className="text-purple-500" />}
              title="AI Resume Match"
              desc="Our algorithm matches your skills to the best paying jobs automatically."
            />
            <FeatureCard 
              icon={<FaShieldAlt className="text-blue-500" />}
              title="Verified Employers"
              desc="No ghost jobs. Every single job posting is verified by our compliance team."
            />
            <FeatureCard 
              icon={<FaRocket className="text-orange-500" />}
              title="Quick Apply"
              desc="Apply to 20+ jobs in under 5 minutes with your pre-filled Hire-Flow profile."
            />
          </section>

          {/* ── CATEGORIES ────────────────────────────────────────────────── */}
          <section aria-labelledby="categories-heading" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 id="categories-heading" className="text-3xl font-bold text-slate-900 mb-2">Explore by Interest</h2>
                    <p className="text-slate-500">Tailored opportunities in your specific field.</p>
                </div>
                <button onClick={() => navigate("/candidate/jobs")} className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                    View all categories <FaArrowRight />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {JOB_CATEGORIES.map((cat) => (
                <a
                  key={cat.href}
                  href={cat.href}
                  className="group flex items-center gap-5 p-6 rounded-2xl bg-slate-50 border border-transparent hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  <div className="text-3xl p-4 rounded-xl bg-white text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{cat.label}</h3>
                    <p className="text-sm text-slate-500">{cat.count}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* ── RECRUITER CTA (Secondary) ─────────────────────────────────── */}
          <section className="mt-24 p-8 md:p-16 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-md">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you hiring?</h2>
                    <p className="text-slate-400 text-lg">Post your job to India's largest talent community and find your next star employee today.</p>
                </div>
                <button 
                  onClick={() => navigate("/hr/register")}
                  className="w-full md:w-auto px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl"
                >
                    Post a Job for Free
                </button>
            </div>
            {/* Decorative background for CTA */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </section>
        </main>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}