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
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const fetchHistory = async (timestamp = null) => {
    setIsLoadingHistory(true);
    try {
      const url = timestamp ? `/ai/chat/?last_timestamp=${timestamp}` : "/ai/chat/";
      const response = await api.get(url);
      
      let fetchedHistory = response.data.history || [];
      
  
      const sortedHistory = [...fetchedHistory].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) return timeA - timeB;
      if (a.role === "user" && b.role === "ai") return -1;
      if (a.role === "ai" && b.role === "user") return 1;
      return 0;
      });
      

      if (timestamp) {
        const container = scrollRef.current;
        const oldHeight = container.scrollHeight;
        setMessages((prev) => [...sortedHistory, ...prev]);
        requestAnimationFrame(() => {
          if (container) container.scrollTop = container.scrollHeight - oldHeight;
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
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const el = e.target;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
    if (el.scrollTop === 0 && lastEvaluatedKey && !isLoadingHistory) {
      fetchHistory(lastEvaluatedKey.timestamp);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userTimestamp = Date.now();
    const userMessage = { role: "user", content: input, timestamp: userTimestamp };
    
    // 1. Add User message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    requestAnimationFrame(scrollToBottom);

    try {
      const response = await api.post("/ai/chat/", { message: input });
      
      const botContent = typeof response.data.response === "string" 
        ? response.data.response 
        : JSON.stringify(response.data.response);


      const botTimestamp = Math.max(Date.now(), userTimestamp + 1);

      const botResponse = { 
        role: "ai", 
        content: botContent, 
        timestamp: botTimestamp 
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error. Try again.", timestamp: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] group"
        >
          <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 text-white">
            <Bot size={26} />
            <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500/30" />
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.95 }}
              className="w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] sm:max-h-[780px] bg-[#0a0c12] border border-gray-800/80 sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20"><Bot size={20} className="text-white" /></div>
                  <div>
                    <h2 className="font-bold text-white text-base">HireFlow AI</h2>
                    <p className="text-indigo-200 text-xs">Online</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="relative z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center"><X size={16} className="text-white" /></button>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#0a0c12]">
                {isLoadingHistory && <div className="text-center text-xs text-gray-500">Loading...</div>}
                
                {messages.map((msg, idx) => (
                  <motion.div key={`${msg.timestamp}-${idx}`} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && <div className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center mt-1"><Bot size={14} className="text-indigo-400" /></div>}
                    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-[#13161f] border border-gray-700/50 text-gray-200 rounded-tl-sm"}`}>
                        {msg.role === "ai" ? <ReactMarkdown className="prose prose-invert prose-sm">{String(msg.content)}</ReactMarkdown> : <p>{msg.content}</p>}
                      </div>
                      <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                    </div>
                    {msg.role === "user" && <div className="w-7 h-7 rounded-xl bg-indigo-900/50 flex items-center justify-center mt-1"><span className="text-indigo-300 text-xs font-bold">U</span></div>}
                  </motion.div>
                ))}
                
                {isTyping && <div className="text-indigo-400 text-xs animate-pulse ml-10">AI is thinking...</div>}
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-gray-800 bg-[#0d0f18]">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <textarea
                    ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(e)}
                    placeholder="Type here..." className="flex-1 bg-[#13161f] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none"
                  />
                  <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}