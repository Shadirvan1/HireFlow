import React, { useState, useEffect, useRef } from "react";

const ChatWindow = ({ selectedUser, messages, onSend, currentUser, loading }) => {
    const [text, setText] = useState("");
    const bottomRef = useRef(null);

    // Auto-scroll to the latest message
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        const trimmedText = text.trim();
        if (!trimmedText) return;
        
        onSend(trimmedText); 
        setText("");
    };

    // Safety check for auth state
    if (!currentUser?.id) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400 italic">
                Verifying session...
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col bg-white h-full border-l border-gray-200">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                            src={selectedUser?.profileImage || `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`} 
                            className="w-10 h-10 rounded-full border border-gray-100 object-cover" 
                            alt="avatar"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight">
                            {selectedUser?.username || "Chat"}
                        </h2>
                        <p className="text-[11px] text-gray-500">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="text-gray-400 text-sm animate-pulse">Syncing messages...</div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = String(msg.sender_id) === String(currentUser.id);
                        
                        // ✅ FIX: Safe check for temp status using Optional Chaining
                        const isTemp = msg.id?.toString().startsWith('temp-');

                        return (
                            <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[75%] shadow-sm relative ${
                                    isMe 
                                    ? "bg-blue-600 text-white rounded-tr-none" 
                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                                }`}>
                                    <p className="text-[15px] leading-relaxed break-words">
                                        {msg.message}
                                    </p>
                                    
                                    <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${
                                        isMe ? "text-blue-100" : "text-gray-400"
                                    }`}>
                                        {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                        
                                        {/* Status Icon for my messages */}
                                        {isMe && (
                                            <span className="ml-1">
                                                {isTemp ? (
                                                    <span className="inline-block animate-spin">◌</span>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 max-w-5xl mx-auto items-center">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="flex-1 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all text-sm"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow hover:shadow-lg active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;