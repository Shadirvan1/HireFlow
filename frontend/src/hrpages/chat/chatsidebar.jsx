const ChatSidebar = ({ users, selectedUser, onSelectUser, onlineUsers }) => {
    return (
        <div className="w-72 border-r bg-white">
            {users.map(user => (
                <div
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={`p-3 flex items-center gap-3 cursor-pointer ${
                        selectedUser?.id === user.id ? "bg-blue-100" : ""
                    }`}
                >
                    <div className="relative">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user.username}`}
                            className="w-10 h-10 rounded-full"
                            alt=""
                        />
                        <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                onlineUsers[user.id] ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                    </div>
                    <span>{user.username}</span>
                </div>
            ))}
        </div>
    );
};

export default ChatSidebar;