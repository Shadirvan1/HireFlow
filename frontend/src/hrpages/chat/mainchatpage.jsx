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
    
    // Pagination
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const messageHandlerRef = useRef(null);

    // Load Initial Profile and Staff
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
                console.error("Initialization failed", err);
            }
        };
        loadData();
    }, []);

    // WebSocket Response Handler
    useEffect(() => {
        messageHandlerRef.current = (data) => {
            if (data.type === "presence") {
                setOnlineUsers(prev => ({
                    ...prev,
                    [String(data.user_id)]: data.status === "online"
                }));
            } else if (data.type === "chat") {
                setMessages(prev => {
                    const alreadyExists = prev.some(m => String(m.id) === String(data.id));
                    if (alreadyExists) return prev;

                    // Match with temp message sent by current user
                    const tempIdx = prev.findIndex(m => 
                        m.id?.toString().startsWith('temp-') && 
                        m.message === data.message && 
                        String(m.sender_id) === String(data.sender_id)
                    );

                    if (tempIdx !== -1) {
                        const updated = [...prev];
                        updated[tempIdx] = { ...data, id: String(data.id) };
                        return updated;
                    }
                    return [...prev, { ...data, id: String(data.id) }];
                });
            }
        };
    }, [selectedUser, currentUser]);

    useEffect(() => {
        if (!selectedUser?.id) return;
        connectSocket(selectedUser.id, (data) => {
            if (messageHandlerRef.current) messageHandlerRef.current(data);
        });
    }, [selectedUser?.id]);

    // Paginated Fetch History
    const fetchHistory = async (userId, currentOffset) => {
        if (loading || (!hasMore && currentOffset !== 0)) return;
        setLoading(true);
        try {
            const res = await LiveApi.get(`history/${userId}/?offset=${currentOffset}&limit=20`);
            const fetched = res.data.map(m => ({ ...m, id: String(m.id || m.message_id) }));

            if (fetched.length < 20) setHasMore(false);

            setMessages(prev => {
                const existingIds = new Set(prev.map(m => String(m.id)));
                const uniqueNew = fetched.filter(m => !existingIds.has(String(m.id)));
                return currentOffset === 0 ? fetched : [...uniqueNew, ...prev];
            });
            setOffset(currentOffset + fetched.length);
        } catch (err) {
            console.error("Pagination error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        if (selectedUser?.id === user.id) return;
        setSelectedUser(user);
        setMessages([]);
        setOffset(0);
        setHasMore(true);
        fetchHistory(user.id, 0);
    };

    const handleSend = (text) => {
        if (!text.trim() || !currentUser) return;
        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: tempId,
            message: text,
            sender_id: currentUser.id,
            timestamp: new Date().toISOString()
        }]);
        sendMessage(text);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <ChatSidebar users={users} selectedUser={selectedUser} onSelectUser={handleSelectUser} onlineUsers={onlineUsers} />
            {selectedUser ? (
                <ChatWindow 
                    selectedUser={selectedUser} 
                    messages={messages} 
                    onSend={handleSend} 
                    currentUser={currentUser} 
                    loading={loading}
                    onLoadMore={() => fetchHistory(selectedUser.id, offset)}
                    hasMore={hasMore}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                    <p className="text-lg font-medium">Select a colleague to start chatting</p>
                </div>
            )}
        </div>
    );
};

export default ChatDashboard;