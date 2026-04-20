// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken,onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCAuGkmwpGanSarXQvL8oS2TwRh5_yYzuA",
  authDomain: "otp-sender-9f2be.firebaseapp.com",
  projectId: "otp-sender-9f2be",
  storageBucket: "otp-sender-9f2be.firebasestorage.app",
  messagingSenderId: "711191463461",
  appId: "1:711191463461:web:983aa67f409f40b2efa1cc",
  measurementId: "G-GY0K9V46PY"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
onMessage(messaging, (payload) => {
  
  

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/logo192.png",
      tag: "test-notification" 
    });
  });
});


export const generateFCMToken = async () => {
  try {

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BJFAOoqJ2KwRZZfGi64reJFjTZUENAhvXDWzsftmpBKGE1tUbN_7eDID5vIWQbGBuMKoYs9YIGR7lsshGWkNKsg",
      serviceWorkerRegistration: registration
    });

    return token;

  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
};