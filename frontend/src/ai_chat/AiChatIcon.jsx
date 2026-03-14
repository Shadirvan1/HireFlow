import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import api from "../api/api";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {  message: "Hello! I'm your HR assistant. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const constraintsRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Replace with your actual backend endpoint
      const response = await api.post("/ai/chat/", { message: input });
      
      const aiResponse = { 
        role: "ai", 
        content: response.data.reply || response.data.message 
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999]">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        className="fixed pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ left: 'calc(100vw - 80px)', top: 'calc(100vh - 80px)' }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all"
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </button>

        {isOpen && (
          <div 
            className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col border border-slate-200 overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()} 
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold text-sm">HireFlow AI Assistant</span>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-sm p-2 bg-slate-100 rounded-lg outline-none focus:ring-1 ring-blue-500"
              />
              <button 
                type="submit" 
                disabled={isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}