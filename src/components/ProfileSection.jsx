import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";

import "./ProfileSection.css";

const avatars = [avatar1, avatar2, avatar3, avatar4];

const ProfileSection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // 🔄 Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || user.displayName || "");
        setPhone(data.phone || "");
        setSelectedAvatar(data.avatar || "");
      }
    };

    loadUserData();
  }, []);

  // 💾 Save data
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        name,
        phone,
        avatar: selectedAvatar
      });

      await updateProfile(user, {
        displayName: name
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Profile</h2>

      {/* Avatar Picker */}
      <div className="avatar-group">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className={`avatar ${
              selectedAvatar === avatar ? "selected" : ""
            }`}
            onClick={() => setSelectedAvatar(avatar)}
          >
            <img src={avatar} alt="avatar" />
          </div>
        ))}
      </div>

      {/* Name */}
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Phone */}
      <label>Phone</label>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Save Button */}
      <button className="primary-btn" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default ProfileSection;