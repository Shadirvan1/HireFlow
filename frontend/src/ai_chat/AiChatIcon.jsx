import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import api from "../api/api";

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  
  const scrollRef = useRef(null);

  // Fetch initial history
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async (timestamp = null) => {
    setIsLoadingHistory(true);
    try {
      // Pass the timestamp as a query param if it exists
      const url = timestamp ? `/ai/chat/?last_timestamp=${timestamp}` : "/ai/chat/";
      const response = await api.get(url);
      
      const newMessages = response.data.history || [];
      
      if (timestamp) {
        // If loading more, prepend to the top and maintain scroll
        const container = scrollRef.current;
        const oldHeight = container.scrollHeight;
        
        setMessages(prev => [...newMessages, ...prev]);
        
        // Adjust scroll after DOM updates to keep position
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - oldHeight;
        }, 0);
      } else {
        setMessages(newMessages);
        setTimeout(scrollToBottom, 100);
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleScroll = (e) => {
    // If we hit the top and have a key to fetch more
    if (e.target.scrollTop === 0 && lastEvaluatedKey && !isLoadingHistory) {
      fetchHistory(lastEvaluatedKey.timestamp);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setTimeout(scrollToBottom, 10);

    try {
      const response = await api.post("/ai/chat/", { message: input });
      // Ensure we extract the string from the response
      const botResponse = typeof response.data.response === 'string' 
                          ? response.data.response 
                          : JSON.stringify(response.data.response);
                          
      setMessages((prev) => [...prev, { role: "ai", content: botResponse, timestamp: Date.now() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", content: "Connection error.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 10);
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-[9999] bg-blue-600 p-4 rounded-full shadow-2xl text-white"
        >
          <Bot size={28} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-4xl h-full max-h-[800px] bg-white shadow-2xl rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bot size={24} />
                  <h2 className="font-bold">HireFlow AI</h2>
                </div>
                <button onClick={() => setIsOpen(false)}><X size={24} /></button>
              </div>

              <div 
                ref={scrollRef} 
                onScroll={handleScroll}
                className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4"
              >
                {isLoadingHistory && (
                  <div className="flex justify-center p-2">
                    <Loader2 size={20} className="animate-spin text-blue-400" />
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border text-slate-800"
                    }`}>
                      <div className="text-sm md:text-base prose prose-blue max-w-none">
                        <ReactMarkdown>
                          {String(msg.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border p-4 rounded-2xl flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-medium">Send</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}