import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import "./SecuritySection.css";

const SecuritySection = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setEmail(user.email);
    }
  }, []);

  return (
    <div className="card">
      <h2>Account</h2>

      <div className="security-item">
        <div>
          <p>Email</p>
          <span>{email || "Loading..."}</span>
        </div>
      </div>

      <p style={{ marginTop: "5px", fontSize: "13px", opacity: 0.6 }}>
        Managed by your Google account
      </p>
    </div>
  );
};

export default SecuritySection;