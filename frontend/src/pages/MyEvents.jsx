import { useEffect, useState } from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";

export default function MyEvents() {
  const [user, setUser] =
    useState(null);

  const [registrations,
    setRegistrations] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const userRes =
        await axios.get(
          "http://localhost:5000/auth/me",
          {
            withCredentials: true,
          }
        );

      const currentUser =
        userRes.data;

      setUser(currentUser);

      const regRes =
        await axios.get(
          `http://localhost:5000/registrations/user/${currentUser._id}`,
          {
            withCredentials: true,
          }
        );

      setRegistrations(
        regRes.data
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get(
        "http://localhost:5000/auth/logout",
        {
          withCredentials: true,
        }
      );

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-3xl">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              My Events
            </h1>

            <p className="text-slate-400">
              {user?.name}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(
                  "/events"
                )
              }
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              Browse Events
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold mb-3">
          Your Registrations
        </h1>

        <p className="text-slate-400">
          Manage and view all
          events you have
          registered for.
        </p>
      </div>

      {/* Content */}

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {registrations.length ===
        0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-3">
              No Registrations Yet
            </h2>

            <p className="text-slate-400 mb-6">
              Explore upcoming
              events and register.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/events"
                )
              }
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map(
              (
                registration
              ) => (
                <div
                  key={
                    registration._id
                  }
                  className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition"
                >
                  {/* Poster */}

                  {registration
                    .eventId
                    ?.poster ? (
                    <img
                      src={
                        registration
                          .eventId
                          .poster
                      }
                      alt={
                        registration
                          .eventId
                          .title
                      }
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="h-52 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
                      <h2 className="text-2xl font-bold text-center px-4">
                        {
                          registration
                            .eventId
                            ?.title
                        }
                      </h2>
                    </div>
                  )}

                  {/* Details */}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">
                      {
                        registration
                          .eventId
                          ?.title
                      }
                    </h2>

                    <div className="space-y-2 text-sm text-slate-300">
                      <p>
                        📍{" "}
                        {
                          registration
                            .eventId
                            ?.venue
                        }
                      </p>

                      <p>
                        📅{" "}
                        {registration
                          .eventId
                          ?.date
                          ? new Date(
                              registration.eventId.date
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p>
                        📞{" "}
                        {
                          registration.phone
                        }
                      </p>

                      <p>
                        🎓{" "}
                        {
                          registration.college
                        }
                      </p>

                      <p>
                        💳{" "}
                        {
                          registration.paymentStatus
                        }
                      </p>

                      <p>
                        💰 ₹
                        {
                          registration.amountPaid
                        }
                      </p>
                    </div>

                    <Link
                      to={`/events/${registration.eventId?._id}`}
                    >
                      <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition">
                        View Event
                      </button>
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}