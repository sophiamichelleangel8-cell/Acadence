import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

import logo from "../assets/logo.png";
import hero from "../assets/hero.png";
import routeIcon from "../assets/route.png";
import notesIcon from "../assets/notes.png";
import submissionIcon from "../assets/submission.png";
import newsIcon from "../assets/news.png";
import profile from "../assets/profile.png";
import Sidebar from "./Sidebar";
import Settings from "./Settings";
import { useRef } from "react";
import { signOut } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import TimeBasedCharacter from "../components/TimeBasedCharacter";
import { messaging } from "../firebase";
import carebotIcon from "../assets/carebot.png";


function Dashboard() {

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [characterState, setCharacterState] = useState("morning");
  const [loadedFromDB, setLoadedFromDB] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const createTask = () => ({
  id: Date.now() + Math.random(),
  text: "",
  checked: false,
  starred: false
});

const [tasks, setTasks] = useState([
  createTask(),
  createTask(),
  createTask(),
  createTask()
]);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [displaySection, setDisplaySection] = useState("dashboard");
  const [animating, setAnimating] = useState(false);
  const inputRefs = useRef([]);
  const captions = [
  "What needs to be done today?", 
  "Today’s focus",
  "Stay on Track", 
  "Priorities for Today", 
  "What's Today's plan?",
  "Tasks for today"
];

const todayCaption =
  captions[new Date().getDate() % captions.length];
  const markAllAsRead = async () => {
  try {
    notifications.forEach(async (n) => {
      const ref = doc(db, "notifications", n.id);
      await updateDoc(ref, { read: true });
    });
  } catch (err) {
    console.error(err);
  }
};

 const changeSection = (section) => {
  setAnimating(true);

  if (section === "notifications") {
  setHasUnread(false); // optional UI
}

  setTimeout(() => {
    setDisplaySection(section);
    setAnimating(false);
  }, 200);
};

useEffect(() => {
  const setupNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.log("Permission denied");
        return;
      }

      // ⛔ WAIT for service worker
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: "BB_NozcEGic-W6Jwf5AjxV5lJzkBKcLDdCfJOVHJVZSydUU765DYb4QOGWu5O7I4LV8d80_x0_pqzgXUCy7sY9k",
        serviceWorkerRegistration: registration
      });

      console.log("🔥 FCM Token:", token);

      if (auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { fcmToken: token },
          { merge: true }
        );
      }

    } catch (err) {
      console.error("❌ FCM Error:", err);
    }
  };

  setupNotifications();
}, []);

useEffect(() => {
  if (!userData) return;

  const timer = setTimeout(async () => {
    const today = new Date().toDateString();
    const tasksRef = collection(db, "tasks", auth.currentUser.uid, today);
    
    for (const task of tasks) {
      const docRef = doc(tasksRef, task.id.toString());
      await setDoc(docRef, task);
    }
  }, 500); // only save 0.5s after typing stops

  return () => clearTimeout(timer);
}, [tasks, userData]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setOpenMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  if (!userData) return;

  const today = new Date().toDateString();
  const tasksRef = collection(db, "tasks", auth.currentUser.uid, today);

  const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
    // 🔥 ONLY load once
    if (loadedFromDB) return;

    if (snapshot.empty) {
      setTasks([createTask(), createTask(), createTask(), createTask()]);
    } else {
      const loadedTasks = snapshot.docs.map(doc => doc.data());
      setTasks(loadedTasks);
    }

    setLoadedFromDB(true);
  });

  return () => unsubscribe();
}, [userData, loadedFromDB]);

  // 🔔 Notifications listener
useEffect(() => {
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setNotifications(data);

    const unreadExists = data.length > 0;
    setHasUnread(unreadExists);

    // ✅ SHOW ONLY ONCE
    const seenNotifications =
      JSON.parse(localStorage.getItem("seenNotifications") || "[]");

    if (
      Notification.permission === "granted" &&
      data.length > 0
    ) {
      const latest = data[0];

      if (!seenNotifications.includes(latest.id)) {
        new Notification(latest.title || "📢 New Notification", {
          body: latest.message || "You have a new update",
        }).onclick = () => {
          window.focus();
          changeSection("notifications");
        };

        localStorage.setItem(
          "seenNotifications",
          JSON.stringify([...seenNotifications, latest.id])
        );
      }
    }
  });

  return () => unsubscribe();
}, []);

  // 👤 User data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {

      if (!user) {
        navigate("/");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let firstName = "User";

        if (user.displayName) {
          const nameParts = user.displayName.split(" ");
          const filtered = nameParts.filter(
            (part) => part.length > 1 && !part.includes(".")
          );

          if (filtered.length > 0) {
            firstName = filtered[0];
          }
        }

        const data = docSnap.exists() ? docSnap.data() : {};

setUserData({
  name: firstName,
  email: user.email || "",
  role: data.role || "student",
  avatar: data.avatar || ""
});

      } catch (error) {
        console.error("Error fetching user data:", error);
      }

    });

    return () => unsubscribe();
  }, [navigate]);

 const handleLogout = async () => {
  try {
    await signOut(auth); // ✅ correct way

    setOpenMenu(false);

    navigate("/", { replace: true }); // safer redirect
  } catch (err) {
    console.error("Logout error:", err);
  }
};

  const navButton = {
    color: "#fff",
    padding: "10px 0",
    margin: "8px 12px",
    borderRadius: "10px",
    textAlign: "center",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "rgba(255,255,255,0.1)",
    transition: "0.2s"
  };

   return (
  <div className="dashboard">

    {/* Sidebar */}
    <Sidebar 
  setActiveSection={changeSection} 
  activeSection={displaySection}
  hasUnread={hasUnread}
/>

    {/* Main Content */}
    <div className="main">

      {/* TOPBAR */}
      <div className="topbar">
        <input
          type="text"
          placeholder="Search..."
          className="search"
        />

        {userData && (
  <div
    className="profile-section"
    ref={menuRef}
    onClick={() => setOpenMenu(!openMenu)}
  >
    <img src={userData?.avatar || profile} alt="profile" />

    <div>
      <div className="name">{userData.name}</div>
      <div className="email">{userData.email}</div>
    </div>

    {openMenu && (
      <div className="dropdown-menu">
        {userData?.role === "admin" && (
          <div
            className="dropdown-item"
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </div>
        )}

        <div className="dropdown-item">Change Name</div>
        <div className="dropdown-item">Change Email</div>

        <div
          className="dropdown-item logout"
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>
    )}
  </div>
)}
      </div>

   
      <div className={`content page ${animating ? "exit" : "enter"}`}>

        {/* DASHBOARD */}
        {displaySection === "dashboard" && (
          <>
            <div className="left">
           <div className="hero-card">
  <div className="hero-text">
    <h1>Hi, {userData?.name || "User"}!</h1>
    <p>
  {{
    morning: "Let’s get ready ☀️",
    work: "Focus time 💻",
    relax: "Take it easy 🌿",
    study: "Stay focused 📚",
    night: "Almost done 🌙",
    sleep: "Good night 😴"
  }[characterState]}
</p>
  </div>

  <div className="hero-character">
    <TimeBasedCharacter onStateChange={setCharacterState} />
  </div>
</div>  {/* ✅ CLOSE HERO CARD HERE */}

<div className="features">
  <div className="feature" onClick={() => navigate("/route")}>
    <span>Route Map</span>
    <img src={routeIcon} alt="" />
  </div>

  <div className="feature" onClick={() => navigate("/daily-log")}>
    <span>Daily Log</span>
    <img src={notesIcon} alt="" />
  </div>

  <div className="feature" onClick={() => navigate("/submissions")}>
    <span>Submissions</span>
    <img src={submissionIcon} alt="" />
  </div>

  <div className="feature" onClick={() => navigate("/health")}>
  <span>CareBot</span>
  <img src={carebotIcon} alt="carebot" />
</div>
</div>
            </div>

            <div className="updates">
              <div className="todo-card">

                <h3 className="todo-title">
                  📋 {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </h3>

                <p style={{ fontSize: "14px", opacity: 0.7 }}>
                  {todayCaption}
                </p>

                <div className="todo-list">
  {tasks.map((task, index) => (
    <div className="todo-item" key={task.id + "-" + index}>

      {/* ⭐ STAR */}
      <span
        className={`star ${task.starred ? "active" : ""}`}
        onClick={() => {
  const updated = tasks.map((t, i) =>
    i === index ? { ...t, starred: !t.starred } : t
  );

  const starred = updated.filter(t => t.starred);
  const normal = updated.filter(t => !t.starred);

  const finalTasks = [...starred, ...normal];

  setTasks(finalTasks);
}}
      >
        ⭐
      </span>

      {/* ✅ CHECK */}
      <input
        type="checkbox"
        checked={task.checked}
        onChange={() => {
          const updated = tasks.map(t =>
            t.id === task.id ? { ...t, checked: !t.checked } : t
          );
          setTasks(updated);
        }}
      />

      {/* ✏️ INPUT */}
      <input
      ref={(el) => (inputRefs.current[index] = el)}
  type="text"
  value={task.text}
  placeholder="Write your task..."

  onChange={(e) => {
  const updated = [...tasks];
  updated[index] = { ...updated[index], text: e.target.value };
  setTasks(updated);
}}

onKeyDown={(e) => {
  const value = e.target.value;

  // ➕ ENTER → add new task BELOW
  if (e.key === "Enter" && value.trim() !== "") {
  e.preventDefault();

  const newTask = createTask();

  const updated = [...tasks];
  updated.splice(index + 1, 0, newTask);

  setTasks(updated);

  requestAnimationFrame(() => {
    inputRefs.current[index + 1]?.focus();
  });
}

  // ❌ BACKSPACE → delete task
  if (e.key === "Backspace" && value === "") {
  if (tasks.length > 4) {
    e.preventDefault();

    const updated = [...tasks];
    updated.splice(index, 1);

    setTasks(updated);

    requestAnimationFrame(() => {
      inputRefs.current[index - 1]?.focus();
    });
  }
}

  // ⬆️ UP
  if (e.key === "ArrowUp") {
    e.preventDefault();
    inputRefs.current[index - 1]?.focus();
  }

  // ⬇️ DOWN
  if (e.key === "ArrowDown") {
    e.preventDefault();
    inputRefs.current[index + 1]?.focus();
  }
}}
/>

    </div>
  ))}
</div>
              </div>
            </div>
          </>
        )}

        {/* NOTIFICATIONS */}
      {displaySection === "notifications" && (
  <div style={{ padding: "20px" }}>
    <h2>Notifications</h2>

    <div className="notifications-grid">
  {notifications
    .filter(n => !n.read) // ✅ only unread
    .slice(0, 9)
    .map((n) => (
      <div className="notification-card" key={n.id}>
        <h4>{n.title || "Reminder"}</h4>
        <p>{n.message}</p>

        <small>
          {n.createdAt?.toDate().toLocaleString()}
        </small>

        <div className="notification-divider"></div>

        <div className="notif-actions">
          <button
            className="view-btn"
            onClick={async () => {
              await updateDoc(doc(db, "notifications", n.id), {
                read: true
              });

              navigate(`/daily-log?id=${n.logId}`);
            }}
          >
            View
          </button>
        </div>
      </div>
    ))}
</div>
    {notifications.length > 9 && (
  <p className="more-text">
    +{notifications.length - 9} more notifications
  </p>
)}
  </div>  
)}

{/* TODOS HISTORY */}
{displaySection === "todos" && (
  <div className="todos-page">
    <h2>📋 Your To-Do History</h2>

    <div className="todo-history-grid">
      {Object.keys(JSON.parse(localStorage.getItem("task-history") || "{}"))
        .reverse()
        .map(date => {
          const history = JSON.parse(localStorage.getItem("task-history") || "{}");

          return (
            <div key={date} className="todo-history-card">
              <h3>{date}</h3>

              {history[date].map((task, i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <input type="checkbox" checked={task.checked} readOnly />
                  <span
                    style={{
                      textDecoration: task.checked ? "line-through" : "none"
                    }}
                  >
                    {task.text || "Empty task"}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
    </div>
  </div>
)}
{/* SETTINGS */}
{displaySection === "settings" && (
  <div style={{ padding: "20px", width: "100%" }}>
    <Settings />
  </div>
)}
      </div>
    </div>
  </div>
);
}

export default Dashboard;