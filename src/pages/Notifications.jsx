import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id) => {
  await updateDoc(doc(db, "notifications", id), {
    read: true
  });
};

  return (
    <div style={{padding:"20px"}}>
      <h2>🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
       notifications.map(n => (
  <div
    key={n.id}
    onClick={() => markAsRead(n.id)}  // ✅ THIS IS THE IMPORTANT LINE
    style={{
      cursor: "pointer",
      opacity: n.read ? 0.6 : 1
    }}
  >
    <h4>{n.title}</h4>
    <p>{n.message}</p>
  </div>
        ))
      )}
    </div>
  );
}

export default Notifications;