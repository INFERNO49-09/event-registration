import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/auth/me",
        {
          withCredentials: true,
        }
      );

      setUser(res.data);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:5000/auth/google";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-3xl animate-pulse">
          Loading...
        </h1>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/events"
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl top-20 left-10" />
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl bottom-20 right-10" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-3">
              EventHub
            </h1>

            <p className="text-slate-400 mb-8">
              Discover and register
              for amazing events.
            </p>
          </div>

          <button
            onClick={
              handleGoogleLogin
            }
            className="
              w-full
              bg-white
              text-black
              py-4
              rounded-2xl
              font-semibold
              hover:scale-[1.02]
              transition
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
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

          <div className="mt-8 text-center text-slate-500 text-sm">
            Secure login powered by
            Google OAuth
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          Built for workshops,
          hackathons, seminars &
          events.
        </div>
      </div>
    </div>
  );
}