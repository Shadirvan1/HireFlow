import React from "react";

const ChatSidebar = ({ users, selectedUser, onSelectUser, onlineUsers }) => {
    return (
        <div className="w-80 border-r bg-white flex flex-col h-full shadow-inner">
            <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {users.map(user => {
                    const isOnline = onlineUsers[String(user.id)] === true;
                    const isActive = selectedUser?.id === user.id;

                    return (
                        <div
                            key={user.id}
                            onClick={() => onSelectUser(user)}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${
                                isActive ? "bg-blue-50 border-blue-600 shadow-sm" : "border-transparent hover:bg-gray-50"
                            }`}
                        >
                            <div className="relative">
                                <img
                                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                    className="w-12 h-12 rounded-full border border-gray-100 object-cover"
                                    alt="profile"
                                />
                                <span
                                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                        isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"
                                    }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-semibold truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                                        {user.username}
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    {isOnline ? "Active now" : "Offline"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatSidebar;