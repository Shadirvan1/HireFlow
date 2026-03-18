import React, { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import LiveApi from "../../api/Liveapi";
import { connectSocket, disconnectSocket, sendMessage } from "../../api/socket";
import ChatSidebar from "./chatsidebar";
import ChatWindow from "./chatwindow";

const ChatDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [loading, setLoading] = useState(false);

    // Ref to prevent stale closures in the socket callback
    const messageHandlerRef = useRef(null);

    // 1. Load User Profile and Employee List
    useEffect(() => {
        const loadData = async () => {
            try {
                const [me, emp] = await Promise.all([
                    api.get("/accounts/me/"),
                    api.get("/management/get/all/employees/")
                ]);
                setCurrentUser({ id: String(me.data.user_id) });
                setUsers(emp.data.map(e => ({
                    id: String(e.user?.id),
                    username: e.user?.username,
                    profileImage: e.profile_image
                })));
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        loadData();
        return () => disconnectSocket();
    }, []);

    // 2. Strict Message Handling Logic (Solves Duplication)
    useEffect(() => {
        messageHandlerRef.current = (data) => {
            if (data.type === "presence") {
                setOnlineUsers(prev => ({
                    ...prev,
                    [data.user_id]: data.status === "online"
                }));
            } else if (data.type === "chat") {
                setMessages(prev => {
                    // Check if message ID already exists (Real ID from server)
                    const existsReal = prev.some(m => String(m.id) === String(data.id));
                    if (existsReal) return prev;

                    // Find if there is a temporary optimistic message that matches this incoming real message
                    const tempIndex = prev.findIndex(m => 
                        m.id?.toString().startsWith('temp-') && 
                        m.message === data.message && 
                        String(m.sender_id) === String(data.sender_id)
                    );

                    if (tempIndex !== -1) {
                        // REPLACE: Found the temp message, swap it with the real data from server
                        const newList = [...prev];
                        newList[tempIndex] = data;
                        return newList;
                    }

                    // ADD: It's a brand new message (likely from the other person)
                    return [...prev, data];
                });
            }
        };
    }, [selectedUser, currentUser]);

    // 3. Socket Lifecycle management
    useEffect(() => {
        if (!selectedUser?.id) return;

        connectSocket(selectedUser.id, (data) => {
            if (messageHandlerRef.current) {
                messageHandlerRef.current(data);
            }
        });
    }, [selectedUser?.id]);

    // 4. Interaction Handlers
    const handleSelectUser = async (user) => {
        if (selectedUser?.id === user.id) return;
        
        setSelectedUser(user);
        setMessages([]);
        setLoading(true);

        try {
            const res = await LiveApi.get(`history/${user.id}/`);
            // Ensure all IDs are strings for consistent comparison
            const history = res.data.map(m => ({ ...m, id: String(m.id || m.message_id) }));
            setMessages(history);
        } catch (err) {
            console.error("History fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (text) => {
        if (!text.trim() || !currentUser) return;

        // 1. Create a unique temporary ID
        const tempId = `temp-${Date.now()}`;
        
        const tempMessage = {
            id: tempId,
            message: text,
            sender_id: currentUser.id,
            timestamp: new Date().toISOString()
        };

        // 2. Update UI immediately (Optimistic)
        setMessages(prev => [...prev, tempMessage]);
        
        // 3. Send to Server via WebSocket
        sendMessage(text);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar with User List */}
            <ChatSidebar
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onlineUsers={onlineUsers}
            />

            {/* Main Chat Area */}
            {selectedUser ? (
                <ChatWindow
                    selectedUser={selectedUser}
                    messages={messages}
                    onSend={handleSend}
                    currentUser={currentUser}
                    loading={loading}
                />
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.3.025-.603.04-.907.045l-7.858.135V19.75a.75.75 0 01-1.5 0v-2.583l-1.376-.02a2.25 2.25 0 01-2.25-2.25V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V8.51z" />
                        </svg>
                    </div>
                    <div className="text-xl font-semibold text-gray-400">Your Messages</div>
                    <p className="text-sm">Select a user to start a conversation.</p>
                </div>
            )}
        </div>
    );
};

export default ChatDashboard;