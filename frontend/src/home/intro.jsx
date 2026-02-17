import React from "react";
import { FaUsers, FaBriefcase, FaChartLine, FaClipboardCheck, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
export default function Intro() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-indigo-100">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px]"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-100/50 rounded-full blur-[80px]"></div>

      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-20 relative z-10">

        <div className="space-y-10 flex flex-col justify-center">
          
          <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Recruitment 2.0
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
            Hire at the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Speed of Light
            </span>
          </h1>

          <p className="text-slate-500 text-xl max-w-lg leading-relaxed font-light">
            Experience the next evolution of talent acquisition. 
            Intelligent matching, transparent pipelines, and a seamless interface 
            designed for the modern workforce.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button className="group px-8 py-4 bg-slate-900 text-white font-medium rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2" onClick={()=>navigate("/hrlogin")}>
              Start Hiring
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="px-8 py-4 bg-white text-slate-700 font-medium rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300" onClick={()=>navigate("/login")}>
              Find a Job
            </button>
          </div>

          <div className="flex gap-8 pt-8 border-t border-slate-200/60">
            <div>
              <p className="text-3xl font-bold text-slate-900">10k+</p>
              <p className="text-sm text-slate-500 font-medium">Companies</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">2M+</p>
              <p className="text-sm text-slate-500 font-medium">Candidates</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">99%</p>
              <p className="text-sm text-slate-500 font-medium">Satisfaction</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 justify-center perspective-1000">
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl"></div>
            
            <div className="relative p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Dashboard Overview</h3>
                  <p className="text-sm text-slate-500">Real-time analytics</p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FaChartLine className="text-indigo-500" />
                </div>
              </div>

              <div className="h-40 flex items-end justify-between gap-2 mb-8">
                {[35, 55, 40, 70, 50, 85, 65, 90, 75, 60, 80, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-gradient-to-t from-indigo-100 to-indigo-500/80 rounded-t-md opacity-80 hover:opacity-100 transition-all duration-300"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <GlassStat label="Interviews" value="24" trend="+12%" />
                <GlassStat label="Offers" value="8" trend="+5%" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 md:static md:transform md:translate-x-12 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-lg flex items-center gap-4 animate-[float_6s_ease-in-out_infinite]">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FaClipboardCheck />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">New Application</p>
              <p className="text-xs text-slate-500">Sarah J. applied for Senior Dev</p>
            </div>
            <div className="ml-auto text-xs font-mono text-slate-400">2m ago</div>
          </div>

        </div>

      </div>

      <footer className="max-w-7xl mx-auto w-full py-8 text-center text-sm text-slate-400 relative z-10">
        <p>© 2024 FutureHire Inc. Designed for the next generation.</p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

function GlassStat({ label, value, trend }) {
  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/60 backdrop-blur-sm">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
    </div>
  );
}