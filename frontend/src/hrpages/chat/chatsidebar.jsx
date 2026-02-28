import React, { useState } from "react";

const ChatSidebar = ({ users = [], selectedUser, onSelectUser }) => {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) =>
        user.username?.toLowerCase().includes(search.toLowerCase())
    );

   


    return (
        <div className="w-72 bg-white border-r flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-2">Messages</h2>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                    <div
                        // FIX: If user.id is undefined, it uses the index as a fallback to stop the error
                        key={user.id || `user-${index}`} 
                        onClick={() => {
                            if (!user.id) {
                                console.error("CRITICAL: This user has no ID!", user);
                            }
                            onSelectUser(user);
                        }}
                        className={`p-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                            selectedUser?.id === user.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                        }`}
                    >
                        <img
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}`}
                            alt="profile"
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-gray-800 truncate">
                                {user.username || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-400">
                                {user.id ? `ID: ${user.id}` : "No ID found"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;