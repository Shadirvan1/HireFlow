// socket.js
let socket = null;
let currentCallback = null; 

function getAccessTokenFromCookie() {
    const name = "access_token=";
    const decoded = decodeURIComponent(document.cookie);
    const parts = decoded.split(";");

    for (let part of parts) {
        part = part.trim();
        if (part.startsWith(name)) {
            return part.substring(name.length);
        }
    }
    return null;
}


const BASE_URL = import.meta.env.VITE_WS_BASE;

export const connectSocket = (userId, onMessage) => {
    if (!userId) return;
    
    
    currentCallback = onMessage;

    // Construct the absolute URL for reliable comparison
    const token = getAccessTokenFromCookie();
    if (!token) {
        console.warn("⚠️ No access token found in cookies. Socket connection aborted.");
        return;
    }
    const rawUrl = `${BASE_URL}/chat/${userId}/?token=${token}`;
    const targetUrl = new URL(rawUrl, window.location.origin).href;

    if (socket) {
        const isSameUser = socket.url === targetUrl;
        const isAlive = socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING;

        if (isSameUser && isAlive) {
           
            return; // EXIT HERE. Do not close, do not reconnect.
        }

        // 2. If it's a different user OR the socket is dead, clean up before new connection
        socket.close();
    }

    socket = new WebSocket(targetUrl);

    socket.onopen = () => {
        console.log("✅ SOCKET CONNECTED (User:", userId, ")");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
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
        
        socket.close(1000); 
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