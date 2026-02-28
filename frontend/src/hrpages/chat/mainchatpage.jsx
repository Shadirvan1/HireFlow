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
    const [loading, setLoading] = useState(false);

useEffect(() => {
        const loadData = async () => {
            try {
                const [meRes, empRes] = await Promise.all([
                    api.get("/accounts/me/"),
                    api.get("/management/get/all/employees/")
                ]);
                console.log(meRes)
                setCurrentUser({
                    id: meRes.data.user_id,
                    
                });
                const formatted = empRes.data.map(emp => ({
                    id: emp.user?.id ,
                    username: emp.user?.username || emp.username,
                    profileImage: emp.profile_image,
                }));
                setUsers(formatted);
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        
        loadData();
    }, []);
    console.log(currentUser)

    const handleSelectUser = useCallback(async (user) => {
        if (selectedUser?.id === user.id) return;

        setSelectedUser(user);
        setMessages([]); 
        setLoading(true);

        try {
            const res = await api.get(`http://127.0.0.1:8001/api/chat/history/${user.id}/`);
            setMessages(res.data);
            disconnectSocket(); 
            connectSocket(user.id, (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
            });

        } catch (err) {
            console.error("Error switching chat:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedUser]);
console.log(messages)
    const handleSend = (text) => {
        if (!text.trim()) return;
        sendMessage(text);

    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <ChatSidebar
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
            />

            <div className="flex flex-1 flex-col">
                {selectedUser ? (
                    <ChatWindow
                        selectedUser={selectedUser}
                        messages={messages}
                        onSend={handleSend}
                        currentUser={currentUser}
                        loading={loading}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center text-gray-400 bg-white">
                        <div className="text-center">
                            <p className="text-xl font-medium">Your Messages</p>
                            <p className="text-sm">Select a colleague to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatDashboard;