let socket = null;

export const connectSocket = (userId, onMessage) => {
    // Prevent multiple connections to the same user
    if (socket) {
        console.log("Existing socket found. Closing before reconnecting...");
        socket.close();
    }

    console.log(`Attempting to connect to WebSocket for User ID: ${userId}`);
    
    socket = new WebSocket(
        `ws://127.0.0.1:8001/ws/chat/${userId}/`
    );

    socket.onopen = () => {
        console.log(`%c Socket Connected Successfully (User: ${userId}) `, 'background: #222; color: #bada55');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("New message received via socket:", data);
        onMessage(data);
    };

    socket.onerror = (error) => {
        console.error("WebSocket Error Observed:", error);
    };

    socket.onclose = (e) => {
        console.log(`Socket closed. Code: ${e.code}, Reason: ${e.reason}`);
    };

    return socket;
};

// This is the missing function that was causing your SyntaxError
export const disconnectSocket = () => {
    if (socket) {
        console.log("Manually disconnecting socket...");
        socket.close();
        socket = null;
    } else {
        console.log("No active socket to disconnect.");
    }
};

export const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Sending message through socket:", message);
        socket.send(
            JSON.stringify({
                message: message,
            })
        );
    } else {
        console.warn("Socket is not open. State:", socket?.readyState);
    }
};