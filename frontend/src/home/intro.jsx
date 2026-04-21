import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JOB_CATEGORIES = [
  { label: "Software Eng.",    icon: "💻", href: "/candidate/jobs?category=software-engineering",  count: "4,200+ jobs" },
  { label: "Data & AI",        icon: "📊", href: "/candidate/jobs?category=data-science",          count: "1,800+ jobs" },
  { label: "Cloud & DevOps",   icon: "☁️", href: "/candidate/jobs?category=cloud-devops",          count: "1,100+ jobs" },
  { label: "Design & UX",      icon: "🎨", href: "/candidate/jobs?category=design",                count: "900+ jobs"   },
  { label: "Finance",          icon: "💰", href: "/candidate/jobs?category=finance",               count: "1,500+ jobs" },
  { label: "Marketing",        icon: "📣", href: "/candidate/jobs?category=marketing",             count: "2,100+ jobs" },
];

const FILTERS = ["All", "Remote", "Full-time", "Fresher friendly", "₹10L+", "Urgent hiring"];

const POPULAR = [
  { label: "Fresher Jobs",           href: "/candidate/jobs?experience=fresher"        },
  { label: "Remote Jobs India",      href: "/candidate/jobs?type=remote"               },
  { label: "Work From Home",         href: "/candidate/jobs?type=work-from-home"       },
  { label: "IT Jobs Bangalore",      href: "/candidate/jobs?location=bangalore&cat=it" },
  { label: "Jobs in Kerala",         href: "/candidate/jobs?location=kerala"           },
  { label: "Part Time Jobs",         href: "/candidate/jobs?type=part-time"            },
  { label: "Internships India",      href: "/candidate/jobs?type=internship"           },
  { label: "Python Developer Jobs",  href: "/candidate/jobs?q=python-developer"        },
  { label: "React Developer Jobs",   href: "/candidate/jobs?q=react-developer"        },
  { label: "Data Analyst Jobs",      href: "/candidate/jobs?q=data-analyst"           },
];

const SAMPLE_JOBS = [
  { logo: "IN", logoColor: "#0052CC", title: "Senior React Developer",   company: "Infosys",   location: "Bangalore", type: "Hybrid",  salary: "₹18–24 LPA", posted: "2h ago",  tags: ["React", "TypeScript", "Node.js"], isNew: true,  isRemote: false },
  { logo: "ZO", logoColor: "#1D9E75", title: "Python Backend Engineer",  company: "Zoho",      location: "Chennai",   type: "Remote",  salary: "₹14–20 LPA", posted: "4h ago",  tags: ["Python", "FastAPI", "PostgreSQL"], isNew: true,  isRemote: true  },
  { logo: "FK", logoColor: "#F26522", title: "Data Scientist",           company: "Flipkart",  location: "Bangalore", type: "On-site", salary: "₹20–30 LPA", posted: "6h ago",  tags: ["ML", "Python", "Spark"],          isNew: false, isRemote: false },
  { logo: "SW", logoColor: "#FC8019", title: "UI/UX Designer",           company: "Swiggy",    location: "Hyderabad", type: "Remote",  salary: "₹10–16 LPA", posted: "1d ago",  tags: ["Figma", "Prototyping", "Research"], isNew: false, isRemote: true  },
  { logo: "TC", logoColor: "#003087", title: "DevOps Engineer",          company: "TCS",       location: "Mumbai",    type: "Hybrid",  salary: "₹16–22 LPA", posted: "1d ago",  tags: ["Kubernetes", "AWS", "Terraform"], isNew: false, isRemote: false },
  { logo: "CR", logoColor: "#1A1A2E", title: "Product Manager",          company: "CRED",      location: "Bangalore", type: "On-site", salary: "₹25–40 LPA", posted: "2d ago",  tags: ["Strategy", "Agile", "SQL"],       isNew: false, isRemote: false },
];

export default function Intro() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All India");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCat, setActiveCat] = useState(0);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(4);

  const toggleSave = (e, idx) => {
    e.stopPropagation();
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/candidate/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <style>{`
        .hf-page {
          min-height: 100vh;
          background: #f4f6f9;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          color: #1a1f36;
          padding: 2.5rem 1.25rem 5rem;
        }
        .hf-inner {
          max-width: 920px;
          margin: 0 auto;
        }

        /* ── HERO ── */
        .hf-hero {
          background: #ffffff;
          border: 1px solid #e8eaef;
          border-radius: 20px;
          padding: 2.5rem 2.25rem 2rem;
          margin-bottom: 1.25rem;
        }
        .hf-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #eef9f5;
          border: 1px solid #b3e6d3;
          border-radius: 99px;
          padding: 4px 13px;
          font-size: 12px;
          font-weight: 500;
          color: #0d7a56;
          margin-bottom: 1.25rem;
        }
        .hf-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1D9E75;
        }
        .hf-hero h1 {
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 700;
          line-height: 1.2;
          color: #1a1f36;
          margin-bottom: 0.6rem;
          letter-spacing: -0.5px;
        }
        .hf-hero h1 span {
          color: #185FA5;
        }
        .hf-hero p {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.65;
          max-width: 500px;
          margin-bottom: 1.75rem;
        }

        /* ── SEARCH BAR ── */
        .hf-search {
          display: flex;
          gap: 8px;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .hf-search-input {
          flex: 1;
          min-width: 180px;
          font-size: 14px;
          padding: 11px 15px;
          border: 1.5px solid #e2e5eb;
          border-radius: 10px;
          background: #f9fafb;
          color: #1a1f36;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .hf-search-input:focus {
          border-color: #378ADD;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(55,138,221,0.12);
        }
        .hf-search-select {
          font-size: 14px;
          padding: 11px 13px;
          border: 1.5px solid #e2e5eb;
          border-radius: 10px;
          background: #f9fafb;
          color: #1a1f36;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .hf-search-select:focus {
          border-color: #378ADD;
        }
        .hf-search-btn {
          padding: 11px 24px;
          background: #185FA5;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, transform 0.1s;
        }
        .hf-search-btn:hover {
          background: #1472c4;
        }
        .hf-search-btn:active {
          transform: scale(0.98);
        }

        /* ── STATS ── */
        .hf-stats {
          display: flex;
          gap: 2.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f0f1f5;
          flex-wrap: wrap;
        }
        .hf-stat-val {
          font-size: 22px;
          font-weight: 700;
          color: #1a1f36;
          letter-spacing: -0.5px;
        }
        .hf-stat-lbl {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }

        /* ── SECTION LABEL ── */
        .hf-section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin: 1.75rem 0 0.75rem;
        }

        /* ── CATEGORIES ── */
        .hf-cats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
          margin-bottom: 1.5rem;
        }
        .hf-cat {
          background: #fff;
          border: 1.5px solid #e8eaef;
          border-radius: 12px;
          padding: 14px 10px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
          text-align: center;
          text-decoration: none;
          display: block;
        }
        .hf-cat:hover {
          border-color: #93c5fd;
          background: #f0f7ff;
          transform: translateY(-1px);
        }
        .hf-cat.active {
          border-color: #185FA5;
          background: #eff6ff;
        }
        .hf-cat.active .hf-cat-lbl {
          color: #185FA5;
        }
        .hf-cat-icon {
          font-size: 20px;
          margin-bottom: 7px;
          display: block;
        }
        .hf-cat-lbl {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          display: block;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .hf-cat-count {
          font-size: 11px;
          color: #9ca3af;
        }

        /* ── FILTERS ── */
        .hf-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .hf-filter-btn {
          font-size: 12px;
          font-weight: 500;
          padding: 5px 13px;
          border: 1.5px solid #e8eaef;
          border-radius: 99px;
          background: #fff;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.12s;
        }
        .hf-filter-btn:hover {
          border-color: #93c5fd;
          background: #f0f7ff;
          color: #185FA5;
        }
        .hf-filter-btn.active {
          background: #eff6ff;
          color: #185FA5;
          border-color: #93c5fd;
        }

        /* ── JOB CARDS ── */
        .hf-jobs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hf-job-card {
          background: #fff;
          border: 1.5px solid #e8eaef;
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .hf-job-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 2px 12px rgba(24,95,165,0.07);
        }
        .hf-job-logo {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .hf-job-main {
          flex: 1;
          min-width: 0;
        }
        .hf-job-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1f36;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hf-job-co {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 9px;
        }
        .hf-job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .hf-tag {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 99px;
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e8eaef;
        }
        .hf-tag-remote {
          background: #eef9f5;
          color: #0d7a56;
          border-color: #b3e6d3;
        }
        .hf-tag-new {
          background: #eff6ff;
          color: #185FA5;
          border-color: #bfdbfe;
        }
        .hf-job-right {
          text-align: right;
          flex-shrink: 0;
        }
        .hf-job-salary {
          font-size: 13px;
          font-weight: 600;
          color: #1a1f36;
          margin-bottom: 3px;
        }
        .hf-job-time {
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        .hf-save-btn {
          padding: 5px 13px;
          font-size: 12px;
          font-weight: 500;
          background: transparent;
          border: 1.5px solid #e8eaef;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.12s;
        }
        .hf-save-btn:hover {
          background: #f3f4f6;
        }
        .hf-save-btn.saved {
          background: #eff6ff;
          color: #185FA5;
          border-color: #93c5fd;
        }

        /* ── LOAD MORE ── */
        .hf-load-more {
          width: 100%;
          margin-top: 1rem;
          padding: 12px;
          background: #fff;
          border: 1.5px solid #e8eaef;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .hf-load-more:hover {
          background: #f9fafb;
          border-color: #93c5fd;
          color: #185FA5;
        }

        /* ── POPULAR SEARCHES ── */
        .hf-popular {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e8eaef;
        }
        .hf-popular-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .hf-popular-tag {
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border: 1.5px solid #e8eaef;
          border-radius: 99px;
          background: #fff;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.12s;
        }
        .hf-popular-tag:hover {
          background: #eff6ff;
          color: #185FA5;
          border-color: #93c5fd;
        }

        @media (max-width: 600px) {
          .hf-hero { padding: 1.75rem 1.25rem 1.5rem; }
          .hf-search { flex-direction: column; }
          .hf-search-select { width: 100%; }
          .hf-search-btn { width: 100%; text-align: center; }
          .hf-stats { gap: 1.25rem; }
          .hf-job-right { display: none; }
        }
      `}</style>

      <div className="hf-page">
        <div className="hf-inner">

          {/* ── HERO ── */}
          <section className="hf-hero">
            <div className="hf-badge">
              <span className="hf-badge-dot" />
              11,200+ openings today
            </div>

            <h1>
              Find your next job<br />
              <span>in India</span>
            </h1>
            <p>
              Fresher, remote, senior — browse thousands of verified openings
              across India and apply in one click.
            </p>

            <div className="hf-search">
              <input
                className="hf-search-input"
                type="text"
                placeholder="Job title, skills, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search jobs"
              />
              <select
                className="hf-search-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Select location"
              >
                {["All India","Bangalore","Mumbai","Hyderabad","Kerala","Chennai","Remote"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <button className="hf-search-btn" onClick={handleSearch}>
                Search jobs
              </button>
            </div>

            <dl className="hf-stats">
              {[
                { val: "2M+",  lbl: "Registered candidates" },
                { val: "10k+", lbl: "Hiring companies"       },
                { val: "99%",  lbl: "Satisfaction rate"      },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <dd className="hf-stat-val">{val}</dd>
                  <dt className="hf-stat-lbl">{lbl}</dt>
                </div>
              ))}
            </dl>
          </section>

          {/* ── CATEGORIES ── */}
          <p className="hf-section-label">Browse by category</p>
          <nav aria-label="Job categories">
            <ul className="hf-cats" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {JOB_CATEGORIES.map((cat, i) => (
                <li key={cat.href}>
                  <a
                    href={cat.href}
                    className={`hf-cat${activeCat === i ? " active" : ""}`}
                    onClick={(e) => { e.preventDefault(); setActiveCat(i); }}
                    title={`${cat.label} jobs in India`}
                  >
                    <span className="hf-cat-icon" aria-hidden="true">{cat.icon}</span>
                    <span className="hf-cat-lbl">{cat.label}</span>
                    <span className="hf-cat-count">{cat.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── FILTERS ── */}
          <p className="hf-section-label">Recommended for you</p>
          <div className="hf-filters" role="group" aria-label="Job filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`hf-filter-btn${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── JOB CARDS ── */}
          <div className="hf-jobs" role="list">
            {SAMPLE_JOBS.slice(0, visibleCount).map((job, idx) => (
              <article
                key={idx}
                className="hf-job-card"
                role="listitem"
                onClick={() => navigate(`/candidate/jobs/${idx}`)}
                aria-label={`${job.title} at ${job.company}`}
              >
                <div
                  className="hf-job-logo"
                  style={{ background: job.logoColor }}
                  aria-hidden="true"
                >
                  {job.logo}
                </div>

                <div className="hf-job-main">
                  <div className="hf-job-title">{job.title}</div>
                  <div className="hf-job-co">{job.company} · {job.location} · {job.type}</div>
                  <div className="hf-job-tags">
                    {job.isNew    && <span className="hf-tag hf-tag-new">New</span>}
                    {job.isRemote && <span className="hf-tag hf-tag-remote">Remote</span>}
                    {job.tags.map((t) => (
                      <span key={t} className="hf-tag">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="hf-job-right">
                  <div className="hf-job-salary">{job.salary}</div>
                  <div className="hf-job-time">{job.posted}</div>
                  <button
                    className={`hf-save-btn${savedJobs.has(idx) ? " saved" : ""}`}
                    onClick={(e) => toggleSave(e, idx)}
                    aria-label={savedJobs.has(idx) ? "Unsave job" : "Save job"}
                  >
                    {savedJobs.has(idx) ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {visibleCount < SAMPLE_JOBS.length && (
            <button
              className="hf-load-more"
              onClick={() => setVisibleCount((v) => Math.min(v + 2, SAMPLE_JOBS.length))}
            >
              Load more jobs
            </button>
          )}

          {/* ── POPULAR SEARCHES ── */}
          <nav className="hf-popular" aria-labelledby="popular-heading">
            <p className="hf-section-label" id="popular-heading">Popular searches</p>
            <ul className="hf-popular-tags" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {POPULAR.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hf-popular-tag">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </div>
    </>
  );
}