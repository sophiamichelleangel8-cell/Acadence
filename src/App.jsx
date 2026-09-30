import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import ToDoHistory from "./pages/ToDoHistory";
import DailyLog from "./pages/DailyLog";
import Login from "./pages/Login";
import CampusMap from "./pages/CampusMap";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Submissions from "./pages/Submissions";
import Carebot from "./pages/Carebot";

import "./styles/global.css";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker error:", err);
      });
  }
}, []);

  if (user === undefined) return null;

  return (
    <Routes>

      {/* Protected */}
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Public */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />

      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/" />}
      />

      {/* 🔐 PROTECTED ROUTES */}
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/notifications"
        element={user ? <Notifications /> : <Navigate to="/login" />}
      />

      <Route
        path="/todos"
        element={user ? <ToDoHistory /> : <Navigate to="/login" />}
      />

      <Route
        path="/daily-log"
        element={user ? <DailyLog /> : <Navigate to="/login" />}
      />

      <Route
        path="/route"
        element={user ? <CampusMap /> : <Navigate to="/login" />}
      />

      <Route
        path="/settings"
        element={user ? <Settings /> : <Navigate to="/login" />}
      />

      <Route path="/submissions" element={<Submissions />} />

      <Route path="/health" element={<Carebot />} />
    </Routes>
  );
}

export default App;