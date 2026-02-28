import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
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

    useEffect(() => {
        const loadData = async () => {
            const meRes = await api.get("/accounts/me/");
            const empRes = await api.get("/management/get/all/employees/");

            setCurrentUser({ id: meRes.data.user_id });

            const formatted = empRes.data.map(emp => ({
                id: emp.user?.id,
                username: emp.user?.username,
                profileImage: emp.profile_image,
            }));

            setUsers(formatted);
        };

        loadData();
    }, []);

    // Online polling
    useEffect(() => {
        if (!users.length) return;

        const interval = setInterval(async () => {
            const ids = users.map(u => u.id).join(",");
            const res = await api.get(`http://127.0.0.1:8001/api/chat/online-status/?ids=${ids}`);
            setOnlineUsers(res.data);
        }, 5000);

        return () => clearInterval(interval);
    }, [users]);

    const handleSelectUser = useCallback(async (user) => {
        setSelectedUser(user);
        setMessages([]);
        setLoading(true);

        const res = await api.get(`http://127.0.0.1:8001/api/chat/history/${user.id}/`);
        setMessages(res.data);

        disconnectSocket();

        connectSocket(user.id, (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });

        setLoading(false);
    }, []);

    // 🔥 NO optimistic message
    const handleSend = (text) => {
        if (!text.trim()) return;
        sendMessage(text);
    };

    return (
        <div className="flex h-screen">
            <ChatSidebar
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onlineUsers={onlineUsers}
            />

            {selectedUser && (
                <ChatWindow
                    selectedUser={selectedUser}
                    messages={messages}
                    onSend={handleSend}
                    currentUser={currentUser}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default ChatDashboard;