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

    // =============================
    // Load current user & employees
    // =============================
    useEffect(() => {
        const loadData = async () => {
            try {
                const meRes = await api.get("/accounts/me/");
                const empRes = await api.get("/management/get/all/employees/");

                setCurrentUser({ id: meRes.data.user_id });

                const formatted = empRes.data.map(emp => ({
                    id: emp.user?.id,
                    username: emp.user?.username,
                    profileImage: emp.profile_image,
                }));

                setUsers(formatted);
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };

        loadData();
    }, []);

    // =============================
    // Online polling every 5 seconds
    // =============================
    useEffect(() => {
        if (!users.length) return;

        const interval = setInterval(async () => {
            try {
                const ids = users.map(u => u.id).join(",");
                const res = await api.get(
                    `http://127.0.0.1:8001/api/chat/online-status/?ids=${ids}`
                );
                setOnlineUsers(res.data);
            } catch (err) {
                console.error("Online status error:", err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [users]);


    const handleSelectUser = useCallback(async (user) => {
        try {
            setSelectedUser(user);
            setMessages([]);
            setLoading(true);

            // Load chat history
            const res = await api.get(
                `http://127.0.0.1:8001/api/chat/history/${user.id}/`
            );

            setMessages(res.data);

            // Disconnect previous socket
            disconnectSocket();

            // Connect new socket
            connectSocket(user.id, (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
            });

        } catch (err) {
            console.error("Error switching chat:", err);
        } finally {
            setLoading(false);
        }
    }, []);


    const handleSend = (text) => {
        if (!text.trim()) return;
        sendMessage(text);
    };


    useEffect(() => {
        const handleBeforeUnload = () => {
            disconnectSocket();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            disconnectSocket();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);


    return (
        <div className="flex h-screen">
            <ChatSidebar
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onlineUsers={onlineUsers}
            />

            {selectedUser ? (
                <ChatWindow
                    selectedUser={selectedUser}
                    messages={messages}
                    onSend={handleSend}
                    currentUser={currentUser}
                    loading={loading}
                />
            ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400">
                    Select a user to start chatting
                </div>
            )}
        </div>
    );
};

export default ChatDashboard;