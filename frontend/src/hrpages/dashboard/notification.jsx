import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Trash2, Clock, MailOpen, Mail, Inbox } from "lucide-react";
import api from "../../api/api";

export default function HRNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("management/add/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const openNotification = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.patch(`management/notifications/${notif.id}/`, { is_read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`management/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
       
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <Bell size={24} strokeWidth={2.5} />
              </div>
              {notifications.some(n => !n.is_read) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-slate-500 font-medium">
                You have <span className="text-indigo-600 font-bold">{notifications.filter(n => !n.is_read).length}</span> unread messages
              </p>
            </div>
          </div>

          <button 
            onClick={fetchNotifications}
            className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Refresh Feed
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium italic">Fetching updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-slate-100 p-16 rounded-[2rem] shadow-sm text-center">
              <div className="inline-flex p-5 bg-emerald-50 rounded-full mb-6">
                <CheckCircle className="text-emerald-500" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
              <p className="text-slate-500 mt-2">Your inbox is clean and tidy.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => openNotification(notif)}
                className={`group relative cursor-pointer bg-white rounded-2xl transition-all duration-300 
                  ${notif.is_read 
                    ? "opacity-75 grayscale-[0.5] hover:grayscale-0 border border-slate-100" 
                    : "shadow-md shadow-indigo-100/50 border border-indigo-100 ring-1 ring-indigo-50"
                  } hover:scale-[1.01] active:scale-[0.99] flex overflow-hidden`}
              >
                {/* Visual Status Bar */}
                <div className={`w-1.5 ${notif.is_read ? "bg-slate-200" : "bg-indigo-600"}`} />

                <div className="flex gap-5 p-6 flex-1 items-start">
                  {/* Status Icon */}
                  <div className={`p-3 rounded-xl transition-colors ${
                    notif.is_read ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"
                  }`}>
                    {notif.is_read ? <MailOpen size={20} /> : <Mail size={20} />}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                      <h3 className={`text-lg font-bold truncate ${notif.is_read ? "text-slate-600" : "text-slate-900"}`}>
                        {notif.title || "System Update"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md w-fit">
                        <Clock size={12} />
                        {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${notif.is_read ? "text-slate-500" : "text-slate-700"}`}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center ml-2">
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete notification"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Footer Hint --- */}
        {!loading && notifications.length > 0 && (
            <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                End of notifications
            </p>
        )}
      </div>
    </div>
  );
}