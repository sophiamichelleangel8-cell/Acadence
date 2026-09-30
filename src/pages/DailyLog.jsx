import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import "./DailyLog.css";
import { auth, db } from "../firebase";
import { deleteDoc } from "firebase/firestore";
import { useRef } from "react";

function DailyLog() {

  const navigate = useNavigate();

  const [userData,setUserData] = useState(null);
  const [logs,setLogs] = useState([]);

  const [title,setTitle] = useState("");
  const [content,setContent] = useState("");
  const [year,setYear] = useState("");
  const [branch,setBranch] = useState("");
  const [section,setSection] = useState("");
  const [subject,setSubject] = useState("");
  const [resourceLink,setResourceLink] = useState("");
  const [menuOpen,setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef({});
  const notificationCount = notifications.filter(n => !n.read).length;

useEffect(() => { 
  if (!notifications.length) return; 
  if (!userData?.reminderEnabled) return;
  const interval = setInterval(async () => 
    { const now = new Date(); 
      const unread = notifications.filter(n => !n.read); 
      if (!unread.length) return; const n = unread[0]; 
      
      if (!n.createdAt) return; // ✅ FIXED LINE 
      
      const created = n.createdAt.toDate(); 
      const lastReminded = n.lastRemindedAt?.toDate?.() || created; 
      const diff = (now - lastReminded) / 1000; 
      
      if (diff > userData.reminderInterval * 60 && (n.reminderCount || 0) < 3) { 
        if (Notification.permission === "granted") 
          { new Notification("Reminder 📢", 
            { body: "You have unread announcements!" }); } 
            await updateDoc(doc(db, "notifications", n.id), 
            { lastRemindedAt: serverTimestamp(), 
              reminderCount: (n.reminderCount || 0) + 1 }); } 
            }, 60000); 
            return () => clearInterval(interval); 
          }, [notifications, userData]);;
            
useEffect(() => {
  console.log("UserData:", userData);
  const handleClickOutside = (event) => {
    if (menuOpen && menuRef.current[menuOpen]) {
      if (!menuRef.current[menuOpen].contains(event.target)) {
        setMenuOpen(null);
      }
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuOpen]);

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

console.log(data); // ✅ AFTER declaration

    setNotifications(data);

    const unreadExists = data.some(n => !n.read);
  });

  return () => unsubscribe();
}, []);

useEffect(()=>{
    document.body.style.backgroundColor="#f8d8e4";
    return ()=> document.body.style.backgroundColor="";
  },[]);
    
useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async(user)=>{
      if(!user) return navigate("/login");

      const snap = await getDoc(doc(db,"users",user.uid));

      if(snap.exists()) setUserData(snap.data());
      else navigate("/signup");
    });

    return ()=>unsubscribe();
  },[navigate]);

  useEffect(() => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);

useEffect(() => {
  if (!userData) return;

  if (!userData.year || !userData.branch || !userData.section) return;

  const q = query(
    collection(db, "dailyLogs"), // ✅ CORRECT
    where("year", "==", userData.year),
    where("branch", "==", userData.branch),
    where("section", "==", userData.section),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    data.sort((a, b) => b.pinned - a.pinned);
    setLogs(data);
  });

  return () => unsubscribe();
}, [userData]);

// 📌 Pin
  const togglePin = async (id, currentStatus)=>{
    await updateDoc(doc(db,"dailyLogs",id),{
      pinned: !currentStatus
    });
  };


  // 🗑 Delete
  const deleteAnnouncement = async (id)=>{
    await deleteDoc(doc(db,"dailyLogs",id));
  };

  // ➕ Create / ✏ Edit
const handleCreateLog = async () => {
  console.log("POST CLICKED");

  const finalYear = userData?.year;
  const finalBranch = userData?.branch;
  const finalSection = userData?.section;

  if (!title || !content || !subject) {
    alert("Please fill all required fields");
    return;
  }

  if (!finalYear || !finalBranch || !finalSection) {
    alert("Year/Branch/Section missing");
    return;
  }

  try {

    if (editingId) {
  await updateDoc(doc(db, "dailyLogs", editingId), {
    title,
    content,
    subject,
    resourceLink: resourceLink || "",
  });

  setEditingId(null);
} else {
  const logRef = await addDoc(collection(db,"dailyLogs"),{
    title,
    content,
    subject,
    year: finalYear,
    branch: finalBranch,
    section: finalSection,
    resourceLink: resourceLink || "",
    adminName: userData?.name || "Admin",
    pinned:false,
    createdAt: serverTimestamp()
  });

  await addDoc(collection(db,"notifications"),{
  title,
  message: content,
  logId: logRef.id,
  year: finalYear,
  branch: finalBranch,
  section: finalSection,
  createdAt: serverTimestamp(),
  read:false,
  lastRemindedAt: null,
  reminderCount: 0
});
}

    // clear fields
    setTitle("");
    setContent("");
    setSubject("");
    setResourceLink("");

  } catch(err){
  console.error("POST ERROR:", err);
  alert(err.message);
}
};

  const styles = { 
  logContainer:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
  gap:"25px",
  marginTop:"40px",
  width:"100%",
  maxWidth:"1200px",
  margin:"40px auto"
},
  heading:{background:"#102146",color:"#f8d8e4",width:"100vw",padding:"15px 0",fontSize:"30px",fontWeight:"700",marginBottom:"30px",textAlign:"center",marginLeft:"calc(-50vw + 50%)"},
  layout:{
  display:"flex",
  alignItems:"flex-start",
  gap:"80px",
  marginTop:"40px"
},
  rightSide:{
  flex:1,
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  gap:"25px"
},
    adminPanel:{
  background:"#102146",
  padding:"40px",
  borderRadius:"12px",
  width:"900px"
},
    subHeading:{marginBottom:"15px",fontSize:"20px",color:"#f8d8e4"},
    input:{width:"100%",padding:"12px",marginBottom:"12px",borderRadius:"12px",border:"1px solid #ccc",fontSize:"15px"},
    selectGroup:{display:"flex",gap:"10px",marginBottom:"15px"},
    select:{flex:1,padding:"12px",borderRadius:"12px",border:"1px solid #ccc",fontSize:"15px"},
postBtn:{
  width:"100%",
  padding:"14px",
  borderRadius:"12px",
  border:"none",
  backgroundColor:"#f8d8e4",
  fontSize:"16px",
  cursor:"pointer",
  fontWeight:"600",
  marginTop:"15px",
  transition:"all 0.25s ease",
  transform:"scale(1)",
  boxShadow:"0 6px 15px rgba(0,0,0,0.15)"
},
  container:{
  maxWidth:"1100px",
  margin:"0 auto",
  padding:"20px"
},
logCard: {
  position: "relative",
  width: "300px",
  minHeight: "220px",
  background: "rgba(255,255,255,0.6)",
  borderRadius: "22px",
  position: "relative",
  overflow: "visible",
  padding: "20px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: `
    0 8px 30px rgba(0,0,0,0.1),
    0 0 20px rgba(255,255,255,0.3)
  `
},
pin: {
  position: "absolute",
  top: "-12px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "14px",
  height: "14px",
  background: "radial-gradient(circle at 30% 30%, #ff9bb3, #ff4d6d)",
  borderRadius: "50%",
  boxShadow: `
    0 4px 8px rgba(0,0,0,0.3),
    inset 0 2px 4px rgba(255,255,255,0.6)
  `
},
innerCard: {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "16px",
  boxShadow: `
    inset 0 2px 6px rgba(255,255,255,0.7),
    0 6px 20px rgba(248, 216, 228, 0.6)
  `,
  backdropFilter: "blur(6px)"
},
logTitle: {
  fontSize: "20px",
  fontWeight: "600",
  letterSpacing: "0.5px"
},
subject: {
  fontSize: "13px",
  color: "#6e6e73",
  marginBottom: "6px"
},

logContent: {
  fontSize: "14px",
  color: "#2c2c2e",
  lineHeight: "1.4",
  marginBottom: "10px"
},

logMeta: {
  fontSize: "12px",
  color: "#8e8e93",
  marginTop: "auto"
},
  pinBtn:{background:"#ffd34d",border:"none",padding:"6px 12px",borderRadius:"8px",cursor:"pointer",marginBottom:"8px",fontWeight:"600"},
  dropdown:{position:"absolute",right:0,top:"25px",background:"#fff",borderRadius:"10px",boxShadow:"0 5px 15px rgba(0,0,0,0.15)",overflow:"hidden"},
  menuWrapper: {
  position: "absolute",
  top: "10px",
  right: "10px"
},

menuBtn: {
  border: "none",
  background: "transparent",
  fontSize: "18px",
  cursor: "pointer",
  color: "#444"
},

link: {
  display: "block",
  marginTop: "8px",
  fontWeight: "500",
  color: "#007aff", // iOS blue
  textDecoration: "none"
},
pinStick: {
  position: "absolute",
  top: "4px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "2px",
  height: "12px",
  background: "#555"
},
dropdown: {
  position: "absolute",
  right: 0,
  top: "25px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
  overflow: "hidden",
  zIndex: 1000   // 👈 ADD THIS
},
dropdownItem: {
  width: "100%",
  padding: "10px 14px",
  border: "none",
  background: "#f8f8f8",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "14px",
  borderRadius: "8px",
  margin: "4px",
  fontWeight: "500",
  transition: "0.2s"
},
pinnedPin: {
  boxShadow: "0 0 10px rgba(255, 77, 109, 0.8)"
}
  };

const pastelColors = [
  "linear-gradient(145deg, #e3f2fd, #d0e8ff)", // baby blue
  "linear-gradient(145deg, #e8f5e9, #d4f5dc)", // mint green
  "linear-gradient(145deg, #fff3e0, #ffe0b2)", // peach
  "linear-gradient(145deg, #ede7f6, #dcd0ff)", // lavender
  "linear-gradient(145deg, #e0f7fa, #c9f0ff)", // aqua
  "linear-gradient(145deg, #f9fbe7, #f0f4c3)", // light yellow
  "linear-gradient(145deg, #f3e5f5, #e1bee7)", // pastel purple
  "linear-gradient(145deg, #fff0f5, #ffd6e8)", // blush pink
  "linear-gradient(145deg, #e6fffa, #ccf7f0)"  // icy mint
];

  if(!userData) return <div>Loading...</div>;

  return (
  <div style={styles.container}>

    <div style={{ position: "relative" }}>
  <h1 style={styles.heading}>📒 Daily Log</h1>

  {notificationCount > 0 && (
    <div style={{
      position: "absolute",
      top: "15px",
      right: "25px",
      background: "#ff4d6d",
      color: "white",
      borderRadius: "50%",
      minWidth: "28px",
      height: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
    }}>
      {notificationCount}
    </div>
  )}
</div>

    <div style={styles.layout}>
      <div style={styles.rightSide}>

        {userData.role === "admin" && (
          <div style={styles.adminPanel}>

            <h3 style={styles.subHeading}>Create Announcement</h3>

            <input
              placeholder="Title"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              style={styles.input}
            />

            <input
  placeholder="Subject"
  value={subject}
  onChange={(e)=>setSubject(e.target.value)}
  style={styles.input}
/>

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e)=>setContent(e.target.value)}
              style={{...styles.input,height:"120px"}}
            />

            <input
              placeholder="Resource Link (optional)"
              value={resourceLink}
              onChange={(e)=>setResourceLink(e.target.value)}
              style={styles.input}
            />

            <p style={{ color: "#f8d8e4", marginBottom: "10px" }}>
              Posting for: {userData.year} | {userData.branch} | Sec {userData.section}
            </p>

            <button
  style={styles.postBtn}
  onClick={handleCreateLog}
  onMouseEnter={(e)=>{
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
  }}
  onMouseLeave={(e)=>{
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 6px 15px rgba(0,0,0,0.15)";
  }}
  onMouseDown={(e)=>{
    e.target.style.transform = "scale(0.95)";
  }}
  onMouseUp={(e)=>{
    e.target.style.transform = "scale(1.05)";
  }}
>
              {editingId ? "Update Announcement" : "Post Announcement"}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setSubject("");
                  setResourceLink("");
                }}
                style={{
                  marginTop: "10px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#f8d8e4",
                  color: "#302f55",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel Edit
              </button>
            )}

          </div>
        )}

      </div>
    </div>

    {/* ✅ SEARCH BAR INSIDE SAME CONTAINER */}
    <input
      placeholder="🔍 Search announcements..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        marginBottom: "20px",
        marginTop: "40px",
        outline: "none"
      }}
    />

    {/* ✅ ANNOUNCEMENTS GRID */}
    <div style={styles.logContainer}>
      {logs.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          No announcements yet… it's peaceful here.
        </p>
      ) : (
        logs
          .filter(log =>
            log.title?.toLowerCase().includes(search.toLowerCase()) ||
            log.content?.toLowerCase().includes(search.toLowerCase())
          )
          .map((log, index) => (
            <div
              key={log.id}
              style={{
                ...styles.logCard,
                ...(log.pinned && styles.pinnedCard)
              }}
            >

              {/* 📌 Pin */}
              <div
                style={{
                  ...styles.pin,
                  ...(log.pinned && styles.pinnedPin)
                }}
              />

              {/* MENU */}
              {userData.role === "admin" && (
                <div
                  style={styles.menuWrapper}
                  ref={(el) => (menuRef.current[log.id] = el)}
                >
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === log.id ? null : log.id)
                    }
                    style={styles.menuBtn}
                  >
                    ⋮
                  </button>

                  {menuOpen === log.id && (
                    <div
                      style={styles.dropdown}
                      onClick={(e) => e.stopPropagation()}
                    >

                      <button
                        style={styles.dropdownItem}
                        onClick={() => {
                          togglePin(log.id, log.pinned);
                          setMenuOpen(null);
                        }}
                      >
                        {log.pinned ? "Unpin" : "Pin"}
                      </button>

                      <button
                        style={styles.dropdownItem}
                        onClick={() => {
                          setTitle(log.title);
                          setContent(log.content);
                          setSubject(log.subject);
                          setResourceLink(log.resourceLink || "");
                          setEditingId(log.id);
                          setMenuOpen(null);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        style={{
                          ...styles.dropdownItem,
                          color: "#ff4d6d"
                        }}
                        onClick={() => {
                          deleteAnnouncement(log.id);
                          setMenuOpen(null);
                        }}
                      >
                        Delete
                      </button>

                    </div>
                  )}
                </div>
              )}

              {/* CARD */}
              <div
                style={{
                  ...styles.innerCard,
                  background: pastelColors[index % pastelColors.length]
                }}
              >

                {log.pinned && (
                  <span style={{ fontSize: "12px", color: "#ff4d6d" }}>
                    Pinned
                  </span>
                )}

                <h3 style={styles.logTitle}>{log.title}</h3>
                <p style={styles.subject}>Subject: {log.subject}</p>
                <p style={styles.logContent}>{log.content}</p>

                {log.resourceLink && (
                  <a
                    href={log.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Open Resource
                  </a>
                )}

                <small style={styles.logMeta}>
                  {log.year} | {log.branch} | Sec {log.section}
                  <br />
                  {log.createdAt?.toDate?.().toLocaleString?.() || "Just now"}
                  <br />
                  Posted by: {log.adminName}
                </small>

              </div>
            </div>
          ))
      )}
    </div>

  </div>
);
}
export default DailyLog;