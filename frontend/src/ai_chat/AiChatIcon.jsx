import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../api/api";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
    if (isOpen) {
      // Small delay ensures the transition finish before focusing
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const fetchHistory = async (timestamp = null) => {
    setIsLoadingHistory(true);
    try {
      const url = timestamp ? `/ai/chat/?last_timestamp=${timestamp}` : "/ai/chat/";
      const response = await api.get(url);
      
      let fetchedHistory = response.data.history || [];
      
      /** * CRITICAL FIX: Robust Sorting
       * We convert all timestamps to numbers to ensure accurate comparison.
       */
      const sortedHistory = [...fetchedHistory].sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      if (timestamp) {
        // Prepending historical messages
        const container = scrollRef.current;
        const oldHeight = container.scrollHeight;
        
        setMessages((prev) => [...sortedHistory, ...prev]);
        
        // Use requestAnimationFrame for more reliable scroll positioning
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - oldHeight;
          }
        });
      } else {
        setMessages(sortedHistory);
        requestAnimationFrame(scrollToBottom);
      }

      setLastEvaluatedKey(response.data.last_evaluated_key);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = (e) => {
    const el = e.target;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
    
    // Trigger infinite scroll when hitting the top
    if (el.scrollTop === 0 && lastEvaluatedKey && !isLoadingHistory) {
      fetchHistory(lastEvaluatedKey.timestamp);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Use current time for the user message
    const userMessage = { role: "user", content: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Quick scroll to show the user's message
    requestAnimationFrame(scrollToBottom);

    try {
      const response = await api.post("/ai/chat/", { message: input });
      
      // Handle different response formats safely
      const botContent = typeof response.data.response === "string" 
        ? response.data.response 
        : JSON.stringify(response.data.response);

      const botResponse = { 
        role: "ai", 
        content: botContent, 
        timestamp: Date.now() 
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Connection error. Please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestions = [
    "What jobs are available?",
    "How do I improve my resume?",
    "Tips for interviews?",
  ];

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] group"
        >
          <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 text-white">
            <Bot size={26} />
            <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500/30" />
          </div>
          <div className="absolute -top-10 right-0 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Ask HireFlow AI
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] sm:max-h-[780px] bg-[#0a0c12] border border-gray-800/80 sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-blue-600/80 backdrop-blur-sm" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-white text-base">HireFlow AI</h2>
                      <span className="flex items-center gap-1 bg-green-400/20 border border-green-400/30 text-green-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <p className="text-indigo-200 text-xs">Your personal hiring assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="relative w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Messages Area */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#0a0c12]"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#1e2030 transparent" }}
              >
                {isLoadingHistory && (
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-full px-4 py-2">
                      <Loader2 size={14} className="animate-spin text-indigo-400" />
                      <span className="text-xs text-gray-400">Loading history…</span>
                    </div>
                  </div>
                )}

                {messages.length === 0 && !isLoadingHistory && (
                  <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-3xl flex items-center justify-center">
                      <Sparkles size={28} className="text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-semibold text-base">How can I help you?</h3>
                      <p className="text-gray-500 text-sm mt-1">Ask me anything about jobs, hiring, or your career.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center px-4">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          className="bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/60 hover:border-indigo-500/50 text-gray-300 hover:text-white text-xs px-4 py-2 rounded-xl transition-all duration-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={`${idx}-${msg.timestamp}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={14} className="text-indigo-400" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20"
                          : "bg-[#13161f] border border-gray-700/50 text-gray-200 rounded-tl-sm"
                      }`}>
                        {msg.role === "ai" ? (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-gray-100 prose-code:text-indigo-300 prose-code:bg-indigo-950/50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
                            <ReactMarkdown>{String(msg.content)}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{String(msg.content)}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-indigo-300 text-xs font-bold">U</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} className="text-indigo-400" />
                    </div>
                    <div className="bg-[#13161f] border border-gray-700/50 px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-indigo-400"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Scroll Button */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-24 right-6 w-9 h-9 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all shadow-lg z-10"
                  >
                    <ChevronDown size={18} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Input Footer */}
              <div className="px-4 py-4 border-t border-gray-800/80 bg-[#0d0f18] flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2.5">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask anything… (Enter to send)"
                      rows={1}
                      className="w-full bg-[#13161f] border border-gray-700/60 hover:border-gray-600 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 text-gray-200 placeholder-gray-600 text-sm rounded-2xl px-4 py-3 resize-none outline-none transition-all duration-200 leading-relaxed"
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      input.trim() && !isTyping
                        ? "bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700/60"
                    }`}
                  >
                    {isTyping ? (
                      <Loader2 size={18} className="animate-spin text-gray-500" />
                    ) : (
                      <Send size={17} className={input.trim() ? "text-white" : "text-gray-600"} />
                    )}
                  </button>
                </form>
                <p className="text-center text-[10px] text-gray-700 mt-2.5">
                  HireFlow AI · Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}