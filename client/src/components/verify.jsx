import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

const API_BASE = "https://login-auth-5azr.onrender.com";

export default function VerifyKeyPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackCode, setFallbackCode] = useState(""); // 👈 to show code when email fails
  const [infoMessage, setInfoMessage] = useState("");

  const email = params.get("email") || "";
  const challengeId = params.get("challengeId") || "";
  const prefilledCode = params.get("code") || "";

  const disabled = useMemo(() => !challengeId || code.length < 4, [challengeId, code]);

  // ✅ Initialize fallback code from URL if provided, else request a new code
  useEffect(() => {
    if (prefilledCode) {
      setFallbackCode(prefilledCode);
      setInfoMessage("Verification code provided below 👇");
      return;
    }
    if (email) sendCode(email);
  }, [email, prefilledCode]);

  async function sendCode(email) {
    try {
      setInfoMessage("Sending verification code...");
      const res = await fetch(`${API_BASE}/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.showCode) {
        // SMTP blocked — show code on page
        setFallbackCode(data.code);
        setInfoMessage("SMTP blocked. Showing verification code below 👇");
      } else {
        setInfoMessage("Verification code sent to your email ✅");
      }
    } catch (err) {
      setInfoMessage("Failed to send verification code. Try again.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!challengeId) {
      setError("Missing challengeId");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Verification failed");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      {/* Left section (illustration placeholder) */}
      <div className="illustration-box">
        <div className="placeholder-text"></div>
      </div>

      {/* Right section (form) */}
      <div className="form-section">
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">
            <svg
              width="51"
              height="46"
              viewBox="0 0 51 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.59823 23.9389C6.61148 23.9838 6.65218 24.0147 6.69892 24.0154C10.2392 24.0729 14.0809 24.0734 17.6798 24.0734C17.7389 24.0734 17.7867 24.1211 17.7869 24.1802C17.8058 31.3772 17.7676 38.9908 17.7861 45.7123C17.7863 45.7935 17.6996 45.8449 17.6283 45.8062C11.4993 42.4783 6.37844 37.5552 3.41059 31.2149C3.37743 31.144 3.4292 31.0627 3.50744 31.0627C5.4294 31.062 7.36814 31.0503 9.2708 31.0624C9.30662 31.0626 9.33996 31.0808 9.35971 31.1107C10.1736 32.3418 11.0177 33.4392 11.9368 34.528C11.9824 34.5821 12.1017 34.7093 12.2045 34.8105C12.2652 34.8703 12.3542 34.83 12.3559 34.7447C12.392 32.9464 12.4104 31.1144 12.4111 29.2992C12.4111 29.24 12.3632 29.192 12.3039 29.192C9.13151 29.1918 5.84969 29.1839 2.67801 29.1838C2.63307 29.1838 2.59292 29.1557 2.57747 29.1135C0.673773 23.9136 -0.175395 18.5485 0.0300045 13.0182C0.031247 12.9847 0.0481598 12.9537 0.0755822 12.9345C5.31576 9.26519 11.2798 7.318 17.673 6.92603C17.7346 6.92225 17.7866 6.97125 17.7866 7.03293C17.7866 8.77722 17.7866 10.4858 17.7866 12.1938C17.7866 12.2505 17.7425 12.2974 17.6859 12.301C13.4398 12.5703 9.16131 13.7564 5.52274 15.9014C5.49068 15.9203 5.47081 15.9545 5.47028 15.9917C5.43226 18.6404 5.8472 21.3976 6.59823 23.9389Z"
                fill="#44087D"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.0801 7.04665C20.0804 6.98396 20.1344 6.93491 20.1968 6.94054C26.473 7.5062 32.2214 9.53671 37.442 13.0321C37.4698 13.0507 37.4874 13.0813 37.4893 13.1147C37.6661 16.1214 37.4775 19.1214 36.9141 22.0877C36.9046 22.1379 36.8607 22.1743 36.8096 22.1747C35.0089 22.1874 33.3434 22.1746 31.6491 22.1741C31.5899 22.174 31.5419 22.1264 31.5419 22.0671C31.5436 20.2271 31.5875 17.9481 31.5433 16.0678C31.5424 16.0305 31.5221 15.9965 31.4898 15.9779C29.4544 14.8029 27.5194 13.942 25.2761 13.3185C25.2074 13.2994 25.1397 13.3518 25.1406 13.4231C25.2353 20.618 25.1211 27.7179 25.2158 34.9127C25.2167 34.9853 25.2877 35.0346 25.3528 35.0026C25.4553 34.9521 25.5655 34.8828 25.6188 34.8185C26.9143 33.2578 27.9691 31.5437 28.7834 29.676C28.8119 29.6108 28.864 29.4607 28.9003 29.3368C28.9193 29.2716 28.8696 29.2096 28.8018 29.2096C28.2948 29.2096 27.8247 29.2096 27.3013 29.2096C27.2421 29.2096 27.194 29.1615 27.194 29.1023C27.194 27.4016 27.194 25.8794 27.194 24.1786C27.194 24.1194 27.242 24.0713 27.3013 24.0713C30.3048 24.0713 33.3271 24.0713 36.3682 24.0713C36.4369 24.0713 36.4878 24.1356 36.4724 24.2027C34.2709 33.7802 28.6884 41.0195 20.1969 45.8016C20.1262 45.8414 20.0384 45.7913 20.0372 45.7102C19.8444 32.8535 20.0143 19.969 20.0801 7.04665Z"
                fill="#44087D"
              />
              <path
                d="M42.6189 1.6525C40.3354 8.06058 39.3826 8.69942 32.5874 8.37906C38.9954 10.6627 39.6343 11.6154 39.3139 18.4106C41.5975 12.0025 42.5502 11.3637 49.3455 11.6841C42.9374 9.40048 42.2986 8.44777 42.6189 1.6525Z"
                fill="#44087D"
              />
            </svg>
          </span>
          <span className="logo-text">Stackguard</span>
        </div>

        {/* Title */}
        <h2 className="welcome-title">Enter the verification code</h2>
        <p className="welcome-subtitle">
          {email
            ? `We sent a code to ${email}`
            : "A verification code was sent to your email"}
        </p>

        {infoMessage && (
          <p style={{ color: "#44087D", marginTop: 8 }}>{infoMessage}</p>
        )}

        {/* Fallback Code (when email fails) */}
        {fallbackCode && (
          <div
            style={{
              marginTop: 15,
              padding: 12,
              backgroundColor: "#f0e6ff",
              borderRadius: 8,
              color: "#44087D",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            <p>Email sending is blocked on this server.</p>
            <p>
              Your verification code is:{" "}
              <span style={{ fontSize: "22px", fontWeight: "bold" }}>
                {fallbackCode}
              </span>
            </p>
          </div>
        )}

        {/* Form */}
        <form className="signup-form" onSubmit={onSubmit}>
          <input
            style={{ width: "100%" }}
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            style={{ width: "104%", backgroundColor: "#44087D" }}
            type="submit"
            className="create-account-btn"
            disabled={disabled || loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          {error && <p style={{ color: "#b00020", marginTop: 8 }}>{error}</p>}
        </form>

        <p className="terms" style={{ marginTop: "16px" }}>
          Didn’t get a code? Check spam or try again.
        </p>
      </div>
    </div>
  );
}
