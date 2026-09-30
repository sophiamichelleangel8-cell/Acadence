import logo from "../assets/logo.png";

export default function Sidebar({ setActiveSection, activeSection, hasUnread }) {
  return (
    <div className="sidebar">

      {/* LOGO */}
      <img
        src={logo}
        alt="logo"
        className="sidebar-logo"
        onClick={() => setActiveSection("dashboard")}
      />

      <div className="menu">

        <div 
  className={`item ${activeSection === "dashboard" ? "active" : ""}`}
  onClick={() => setActiveSection("dashboard")}
>
  Dashboard
</div>

<div 
  className={`item ${activeSection === "notifications" ? "active" : ""}`}
  onClick={() => setActiveSection("notifications")}
>
  Notifications
  {hasUnread && <span className="badge"></span>}
</div>

<div 
  className={`item ${activeSection === "todos" ? "active" : ""}`}
  onClick={() => setActiveSection("todos")}
>
  To-Do’s
</div>

<div
  className={`item ${activeSection === "settings" ? "active" : ""}`}
  onClick={() => setActiveSection("settings")}
>
  Settings
</div>

      </div>

    </div>
  );
}