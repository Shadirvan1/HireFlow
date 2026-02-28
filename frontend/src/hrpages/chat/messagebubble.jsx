import React from "react";

const Sidebar = ({ users = [], onSelectUser, selectedUser }) => {
    return (
        <div className="w-72 bg-white border-r flex flex-col">
            
            {/* Header */}
            <div className="p-5 font-semibold text-lg border-b">
                Company Users
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                            ${
                                selectedUser?.id === user.id
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                            }
                        `}
                    >
                        
                        <img
                            src={
                                user.profileImage
                                    ? user.profileImage
                                    : `https://ui-avatars.com/api/?name=${user.username}`
                            }
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />

                        <div className="flex-1">
                            <p className="font-medium text-gray-800">
                                {user.username}
                            </p>
                            <p className="text-xs text-gray-400">
                                Click to chat
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default Sidebar;