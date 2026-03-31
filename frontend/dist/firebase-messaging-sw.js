
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCAuGkmwpGanSarXQvL8oS2TwRh5_yYzuA",
  authDomain: "otp-sender-9f2be.firebaseapp.com",
  projectId: "otp-sender-9f2be",
  storageBucket: "otp-sender-9f2be.firebasestorage.app",
  messagingSenderId: "711191463461",
  appId: "1:711191463461:web:983aa67f409f40b2efa1cc",
  measurementId: "G-GY0K9V46PY"
});

const messaging = firebase.messaging();



messaging.onBackgroundMessage(function(payload) {


  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});