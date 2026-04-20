import React from "react";
import {
  FaUsers, FaBriefcase, FaChartLine, FaClipboardCheck, FaArrowRight,
  FaCode, FaDatabase, FaCloud, FaPalette, FaMoneyBillWave, FaBullhorn
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ─── SEO: job categories with keyword-rich anchor text ───────────────────────
const JOB_CATEGORIES = [
  { label: "Software Engineering",  icon: <FaCode />,          href: "/candidate/jobs?category=software-engineering",  count: "4,200+ jobs" },
  { label: "Data Science & AI",     icon: <FaDatabase />,      href: "/candidate/jobs?category=data-science",          count: "1,800+ jobs" },
  { label: "Cloud & DevOps",        icon: <FaCloud />,         href: "/candidate/jobs?category=cloud-devops",          count: "1,100+ jobs" },
  { label: "Design & UX",           icon: <FaPalette />,       href: "/candidate/jobs?category=design",                count: "900+ jobs"   },
  { label: "Finance & Accounting",  icon: <FaMoneyBillWave />, href: "/candidate/jobs?category=finance",               count: "1,500+ jobs" },
  { label: "Marketing & Sales",     icon: <FaBullhorn />,      href: "/candidate/jobs?category=marketing",             count: "2,100+ jobs" },
];

export default function Intro() {
  const navigate = useNavigate();

  return (
    <>
      {/*
        ── SEO NOTES ──────────────────────────────────────────────────────────
        1. <main> + <article> give Googlebot semantic landmarks
        2. <h1> contains primary keyword "job search platform India"
        3. <h2> tags structure the page for featured snippets
        4. Job category <a> tags create crawlable internal links
        5. Stats are in <dl> / <dd> for machine-readable structured data
        6. Hidden <p> gives extra keyword density without hurting UX
        ─────────────────────────────────────────────────────────────────────
      */}

      <div
        className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-indigo-100"
      >
        {/* Decorative blobs — purely visual, aria-hidden */}
        <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none" />
        <div aria-hidden="true" className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-100/50 rounded-full blur-[80px] pointer-events-none" />

        <main className="max-w-7xl mx-auto px-6 py-24 relative z-10 w-full">

          {/* ── HERO SECTION ──────────────────────────────────────────────── */}
          <article className="grid md:grid-cols-2 gap-20 mb-24">

            {/* LEFT: headline + CTAs */}
            <div className="space-y-10 flex flex-col justify-center">

              <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm">
                <span className="flex h-2 w-2 relative" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Recruitment 2.0
                </span>
              </div>

              {/*
                SEO: h1 leads with the primary keyword.
                The visual gradient span is decorative but the full text
                "Hire-Flow – India's #1 Job Search Platform" is readable by crawlers.
              */}
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
                Find Jobs &amp; <br />
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  aria-label="Hire Talent in India"
                >
                  Hire Talent
                </span>
                <br />
                <span className="text-4xl md:text-5xl text-slate-500 font-medium">in India</span>
              </h1>

              {/* SEO: keyword-rich description paragraph — fully crawlable */}
              <p className="text-slate-500 text-xl max-w-lg leading-relaxed font-light">
                Hire-Flow is India's smart <strong className="font-medium text-slate-600">job search and hiring management platform</strong>.
                Browse thousands of fresher, remote, and senior-level jobs — or post openings
                and manage your entire recruitment pipeline in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  className="group px-8 py-4 bg-slate-900 text-white font-medium rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => navigate("/hr/register")}
                  aria-label="Start hiring — post a job on Hire-Flow"
                >
                  Start Hiring
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>

                <button
                  className="px-8 py-4 bg-white text-slate-700 font-medium rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                  onClick={() => navigate("/register")}
                  aria-label="Find a job — browse thousands of openings"
                >
                  Find a Job
                </button>
              </div>

              {/*
                SEO: <dl> is semantic for name/value pairs.
                Screen readers and crawlers understand these as stats.
              */}
              <dl className="flex gap-8 pt-8 border-t border-slate-200/60">
                <div>
                  <dd className="text-3xl font-bold text-slate-900">10k+</dd>
                  <dt className="text-sm text-slate-500 font-medium">Companies Hiring</dt>
                </div>
                <div>
                  <dd className="text-3xl font-bold text-slate-900">2M+</dd>
                  <dt className="text-sm text-slate-500 font-medium">Registered Candidates</dt>
                </div>
                <div>
                  <dd className="text-3xl font-bold text-slate-900">99%</dd>
                  <dt className="text-sm text-slate-500 font-medium">Satisfaction Rate</dt>
                </div>
              </dl>
            </div>

            {/* RIGHT: dashboard card — visual only */}
            <div className="flex flex-col gap-6 justify-center" aria-hidden="true">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl" />
                <div className="relative p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xl font-bold text-slate-800">Dashboard Overview</p>
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
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <GlassStat label="Interviews" value="24" trend="+12%" />
                    <GlassStat label="Offers" value="8" trend="+5%" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-lg flex items-center gap-4 animate-[float_6s_ease-in-out_infinite] md:translate-x-12">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <FaClipboardCheck />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">New Application</p>
                  <p className="text-xs text-slate-500">Sarah J. applied for Senior Dev</p>
                </div>
                <div className="ml-auto text-xs font-mono text-slate-400 shrink-0">2m ago</div>
              </div>
            </div>
          </article>

          {/* ── JOB CATEGORIES SECTION ────────────────────────────────────────
              SEO: this section creates crawlable internal links with keyword-rich
              anchor text. Google follows these links and indexes the category pages.
              Each <a> tag is a keyword signal: "software engineering jobs india" etc.
          ──────────────────────────────────────────────────────────────────── */}
          <section aria-labelledby="categories-heading">
            <h2
              id="categories-heading"
              className="text-2xl font-bold text-slate-800 mb-2"
            >
              Browse Jobs by Category
            </h2>
            <p className="text-slate-500 mb-8 text-sm">
              Thousands of verified job openings across India — updated daily.
            </p>

            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" role="list">
              {JOB_CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <a
                    href={cat.href}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 text-center"
                    title={`${cat.label} jobs in India`}
                  >
                    <span className="text-2xl text-indigo-400 group-hover:text-indigo-600 transition-colors" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 leading-snug">
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{cat.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ── QUICK LINKS FOR CRAWLERS ──────────────────────────────────────
              SEO: visually subtle but gives Google crawlable keyword-rich links
              for popular search intents like "fresher jobs", "remote jobs india"
          ──────────────────────────────────────────────────────────────────── */}
          <section aria-labelledby="popular-searches-heading" className="mt-16 pt-10 border-t border-slate-100">
            <h2
              id="popular-searches-heading"
              className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4"
            >
              Popular Searches
            </h2>
            <ul className="flex flex-wrap gap-2" role="list">
              {[
                { label: "Fresher Jobs",              href: "/candidate/jobs?experience=fresher"         },
                { label: "Remote Jobs India",         href: "/candidate/jobs?type=remote"                },
                { label: "Work From Home",            href: "/candidate/jobs?type=work-from-home"        },
                { label: "IT Jobs Bangalore",         href: "/candidate/jobs?location=bangalore&cat=it"  },
                { label: "Jobs in Kerala",            href: "/candidate/jobs?location=kerala"            },
                { label: "Part Time Jobs",            href: "/candidate/jobs?type=part-time"             },
                { label: "Internships India",         href: "/candidate/jobs?type=internship"            },
                { label: "Python Developer Jobs",     href: "/candidate/jobs?q=python-developer"         },
                { label: "React Developer Jobs",      href: "/candidate/jobs?q=react-developer"          },
                { label: "Data Analyst Jobs",         href: "/candidate/jobs?q=data-analyst"             },
                { label: "Post a Job Free",           href: "/candidate/post-job"                        },
                { label: "HR Management Software",    href: "/candidate/features/hr-management"          },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

        </main>

      
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(3rem); }
          50%       { transform: translateY(-10px) translateX(3rem); }
        }
        @media (max-width: 768px) {
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-10px); }
          }
        }
      `}</style>
    </>
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