// socket.js
let socket = null;
let currentCallback = null; 

const BASE_URL = import.meta.env.VITE_WS_BASE;

export const connectSocket = (userId, onMessage) => {
    if (!userId) return;
    
    // Always update the callback to the latest one from the component
    currentCallback = onMessage;

    // Construct the absolute URL for reliable comparison
    const rawUrl = `${BASE_URL}/chat/${userId}/`;
    const targetUrl = new URL(rawUrl, window.location.origin).href;

    if (socket) {
        const isSameUser = socket.url === targetUrl;
        const isAlive = socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING;

        if (isSameUser && isAlive) {
            console.log("💎 Socket already alive for user:", userId);
            return; // EXIT HERE. Do not close, do not reconnect.
        }

        // 2. If it's a different user OR the socket is dead, clean up before new connection
        console.log(isSameUser ? "🛠 Resetting dead socket..." : "🔁 Switching users...");
        socket.close();
    }

    console.log("🌐 Connecting to:", targetUrl);
    socket = new WebSocket(targetUrl);

    socket.onopen = () => {
        console.log("✅ SOCKET CONNECTED (User:", userId, ")");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            // console.log("📩 MESSAGE RECEIVED:", data); // Debugging
            if (currentCallback) {
                currentCallback(data);
            }
        } catch (err) {
            console.error("📩 Parse Error:", err);
        }
    };

    socket.onerror = (err) => {
        console.error("❌ SOCKET ERROR:", err);
    };

    socket.onclose = (e) => {
        // Code 1000 is a normal closure (manual logout/switch)
        if (e.code !== 1000) {
            console.warn(`⚠️ SOCKET CLOSED: Code=${e.code}, Reason=${e.reason || 'None'}`);
        }
        // Don't nullify socket immediately to allow the "isAlive" check to handle reconnects
    };
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("🔌 Manual Disconnect");
        socket.close(1000); // Use normal closure code
        socket = null;
        currentCallback = null;
    }
};

export const sendMessage = (message) => {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ message }));
    } else {
        console.warn("❌ Cannot send: Socket state is", socket?.readyState);
    }
};