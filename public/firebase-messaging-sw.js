// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAVCYa-pRrnYVI8-7BH878gp9AKRXa03cI",
  authDomain: "acadence-6e24d.firebaseapp.com",
  projectId: "acadence-6e24d",
  storageBucket: "acadence-6e24d.firebasestorage.app",
  messagingSenderId: "121798846020",
  appId: "1:121798846020:web:ee5b34dab2c132cec3fe11"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
    }
  );
});