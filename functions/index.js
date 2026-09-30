const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNotification = functions.firestore
  .document("notifications/{id}")
  .onCreate(async (snap, context) => {

    const data = snap.data();

    const title = data.title || "New Notification";
    const message = data.message || "You have a new message";

    const usersSnap = await admin.firestore().collection("users").get();

    const tokens = [];

    usersSnap.forEach(doc => {
      const user = doc.data();
      if (user.fcmToken) {
        tokens.push(user.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("No tokens found");
      return null;
    }

    const payload = {
      notification: {
        title: title,
        body: message,
      }
    };

    try {
      await admin.messaging().sendToDevice(tokens, payload);
      console.log("Notifications sent!");
    } catch (err) {
      console.error("Error sending:", err);
    }

    return null;
  });