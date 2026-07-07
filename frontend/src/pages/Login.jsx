import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../api";

export default function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkLogin() {
    try {
      const res = await axios.get(apiUrl("/auth/me"), {
        withCredentials: true,
      });

      setUser(res.data);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(checkLogin);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = apiUrl("/auth/google");
  };

  if (loading) {
    return (
      <div className="center-stage">
        <p className="eyebrow">Checking entry pass...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/events" replace />;
  }

  return (
    <main className="center-stage">
      <section className="login-card">
        <div className="panel login-copy">
          <div className="brand-lockup">
            <div className="brand-mark">EH</div>
            <div>
              <p className="brand-title">EventHub</p>
              <p className="brand-subtitle">Campus dispatch</p>
            </div>
          </div>

          <h1 className="display-title mt-10">
            Turn open seats into full rooms.
          </h1>

          <p className="body-copy">
            Browse workshops, hackathons, seminars, and competitions from one
            event desk. Sign in once, pick a seat, and keep every registration
            in reach.
          </p>
        </div>

        <div className="login-action">
          <p className="ticket-code">Admit one organizer-approved profile</p>
          <h2 className="ticket-main">Use your Google pass to enter.</h2>

          <button onClick={handleGoogleLogin} className="btn btn-primary full-width">
            <svg
              className="google-icon"
              width="20"
              height="20"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.5 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.2 5.3-6 6.8l6.2 5.2C39.8 36.1 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="muted">
            Google OAuth protects the door. EventHub stores the registration
            details organizers need at check-in.
          </p>
        </div>
      </section>
    </main>
  );
}
