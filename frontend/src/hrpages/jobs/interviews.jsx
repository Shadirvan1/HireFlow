import React, { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Video, FileText, User, Copy, Check,
  Loader2
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ScheduledInterviews() {

  const [interviews, setInterviews] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scores, setScores] = useState({});

  const navigate = useNavigate();
  const userRole = useSelector((state) => state.user.role);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [intvRes, staffRes] = await Promise.all([
        api.get("jobs/scheduled-interviews/"),
        api.get("jobs/interviewers/list/")
      ]);
      setInterviews(intvRes.data.results || intvRes.data || []);
      setInterviewers(staffRes.data || []);
    } catch (err) {
      toast.error("Failed to sync with server");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInterviewer = async (applicationId, interviewerId) => {
    setAssigningId(applicationId);
    try {
      await api.patch(`jobs/assign/interviewer/${applicationId}/`, {
        interviewer_id: interviewerId || null
      });

      setInterviews(prev => prev.map(item =>
        item.id === applicationId ? { ...item, interviewer: interviewerId } : item
      ));

      toast.success("Assignment updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setAssigningId(null);
    }
  };

  
  const handleScoreChange = (id, field, value) => {
    if (value === "") {
      setScores(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: ""
        }
      }));
      return;
    }

    const num = Number(value);

    if (num < 0 || num > 10) return;

    setScores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: num
      }
    }));
  };

  const submitScores = async (id, scoreData) => {
    try {
      await api.post(`jobs/submit-score/${id}/`, {
        scores: scoreData
      });

      toast.success("Scores submitted successfully");
      loadInitialData();
    } catch {
      toast.error("Submit failed");
    }
  };

  const handleSubmitScores = (interview) => {
    const interviewScore = scores[interview.id];

    if (!interviewScore || Object.keys(interviewScore).length < 4) {
      toast.error("Fill all score fields");
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="text-black font-semibold">
          Confirm score submission?
        </span>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await submitScores(interview.id, interviewScore);
            }}
            className="bg-blue-600 px-3 py-1 rounded text-white"
          >
            Yes
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-700 px-3 py-1 rounded text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const copyLink = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInterviews = interviews.filter(i =>
    i.candidate_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Interviews</h1>

        <input
          type="text"
          placeholder="Search..."
          className="bg-slate-800 px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : filteredInterviews.length > 0 ? (
          filteredInterviews.map((interview) => (
            <div key={interview.id} className="bg-slate-900 p-5 rounded-xl flex flex-col gap-4">

              {/* Candidate Info */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">{interview.candidate_email}</h3>
                  <p className="text-sm text-blue-400">{interview.job_title}</p>
                </div>

                <button
                  onClick={() => navigate(`/hr/application/${interview.id}`)}
                  className="text-slate-400 hover:text-white"
                >
                  <User />
                </button>
              </div>

              {/* Assign Interviewer */}
              {userRole === "HR" && (
                <select
                  value={interview.interviewer || ""}
                  onChange={(e) => handleAssignInterviewer(interview.id, e.target.value)}
                  className="bg-slate-800 p-2 rounded"
                >
                  <option value="">Assign Interviewer</option>
                  {interviewers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              )}

              {/* Score Inputs */}
              {userRole !== "" && (
                <div className="grid grid-cols-2 gap-2">
                  {["communication", "technical", "practical", "attitude"].map(field => (
                    <input
                      key={field}
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      placeholder={field}
                      value={scores[interview.id]?.[field] || ""}
                      onChange={(e) =>
                        handleScoreChange(interview.id, field, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      className="bg-slate-800 p-2 rounded text-sm"
                    />
                  ))}

                  <button
                    onClick={() => handleSubmitScores(interview)}
                    className="col-span-2 bg-green-600 py-2 rounded text-white"
                  >
                    Submit Score (0 - 10)
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {interview.resume && (
                  <a href={interview.resume} target="_blank" rel="noreferrer">
                    <FileText />
                  </a>
                )}

                <button onClick={() => copyLink(interview.meeting_link, interview.id)}>
                  {copiedId === interview.id ? <Check /> : <Copy />}
                </button>

                <a href={interview.meeting_link} target="_blank" rel="noreferrer">
                  <Video />
                </a>
              </div>

            </div>
          ))
        ) : (
          <p className="text-center">No interviews found</p>
        )}
      </div>
    </div>
  );
}
