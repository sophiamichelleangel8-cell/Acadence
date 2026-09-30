import React, { useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import loginlogo from "../assets/loginlogo.png";
import "./login.css";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔒 Check if user already signed up
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        alert("Please create your account first!");
        await signOut(auth); // 🚨 logout immediately
        setLoading(false);
        return;
      }

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Login failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-brand">
          <img src={loginlogo} alt="Acadence Logo" className="login-logo" />
          <h1 className="brand-name">ACADENCE</h1>
          <p className="brand-tagline">Learn in your rhythm</p>
        </div>

        <button
          className="login-btn"
          onClick={() => navigate("/signup")}
        >
          Create an Account
        </button>

        {error && <p className="error">{error}</p>}

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            style={{ width: "20px" }}
          />
          {loading ? "Processing..." : "Continue with Google"}
        </button>

      </div>
    </div>
  );
}

export default Login;