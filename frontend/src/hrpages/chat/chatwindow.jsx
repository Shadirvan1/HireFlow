import React, { useState, useEffect, useRef } from "react";

const ChatWindow = ({ selectedUser, messages, onSend, currentUser, loading }) => {
    const [text, setText] = useState("");
    const bottomRef = useRef(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Define handleSend inside the component, but outside any useEffect
    const handleSend = () => {
        const trimmedText = text.trim();
        if (!trimmedText) return;
        
        console.log("Sending message:", trimmedText);
        onSend(trimmedText); // This triggers the handleSend in ChatDashboard
        setText("");
    };
    if (!currentUser || !currentUser.id) {
    return <div className="flex-1 flex items-center justify-center">Authenticating...</div>;
}
console.table(currentUser)
    return (
        <div className="flex flex-1 flex-col bg-white h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">
                <img 
                    src={selectedUser?.profileImage || `https://ui-avatars.com/api/?name=${selectedUser?.username}`} 
                    className="w-10 h-10 rounded-full border" 
                    alt="avatar"
                />
                <span className="font-bold text-gray-700">{selectedUser?.username}</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center py-10 text-gray-400 italic">Loading history...</div>
                ) : (
                    messages.map((msg, index) => {
                        
                        const isMe = String(msg.sender_id) === String(currentUser?.id);

                        return (
                            <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[75%] shadow-sm ${
                                    isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                    <span className={`text-[10px] block mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-2 max-w-4xl mx-auto">
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
                        className="flex-1 border border-gray-300 rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full transition-colors font-medium shadow-md"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;