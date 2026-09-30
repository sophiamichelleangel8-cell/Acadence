import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔒 Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email: user.email,
        year,
        branch,
        section,
        role: "student",
        createdAt: new Date()
      });

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Signup failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h2 className="signup-title">Create Your Account</h2>

        <form onSubmit={handleSignup} className="signup-form">

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select value={year} onChange={(e) => setYear(e.target.value)} required>
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="IT">IT</option>
            <option value="AIML">AIML</option>
            <option value="DS">DS</option>
          </select>

          <select value={section} onChange={(e) => setSection(e.target.value)} required>
            <option value="">Select Section</option>
            <option value="A">SEC-A</option>
            <option value="B">SEC-B</option>
            <option value="C">SEC-C</option>
          </select>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Processing..." : "Continue with Google"}
          </button>

        </form>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login here</span>
        </p>

      </div>
    </div>
  );
}

export default Signup;