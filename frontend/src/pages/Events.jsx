import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const userRes = await axios.get(
        "http://localhost:5000/auth/me",
        {
          withCredentials: true,
        }
      );

      setUser(userRes.data);

      const eventsRes =
        await axios.get(
          "http://localhost:5000/events"
        );

      setEvents(eventsRes.data);
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              EventHub
            </h1>

            <p className="text-slate-400">
              Welcome{" "}
              {user?.name}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(
                  "/my-events"
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
            >
              My Events
            </button>

            {user?.role ===
              "admin" && (
              <button
                onClick={() =>
                  navigate(
                    "/admin"
                  )
                }
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
              >
                Admin
              </button>
            )}

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

      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Discover Amazing
          Events
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Register for
          workshops,
          hackathons,
          seminars,
          competitions and
          more.
        </p>
      </div>

      {/* Events Grid */}

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {events.length ===
        0 ? (
          <div className="text-center">
            <h2 className="text-2xl">
              No events
              available
            </h2>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(
              (event) => (
                <div
                  key={
                    event._id
                  }
                  className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition duration-300"
                >
                  {/* Poster */}

                  {event.poster ? (
                    <img
                      src={
                        event.poster
                      }
                      alt={
                        event.title
                      }
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="h-52 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <h2 className="text-2xl font-bold">
                        {
                          event.title
                        }
                      </h2>
                    </div>
                  )}

                  {/* Content */}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">
                      {
                        event.title
                      }
                    </h2>

                    <p className="text-slate-400 mb-4 line-clamp-3">
                      {
                        event.description
                      }
                    </p>

                    <div className="space-y-2 text-sm">
                      <p>
                        📍{" "}
                        {
                          event.venue
                        }
                      </p>

                      <p>
                        📅{" "}
                        {new Date(
                          event.date
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        💰 ₹
                        {
                          event.fee
                        }
                      </p>

                      <p>
                        👥{" "}
                        {
                          event.registrations
                        }
                        /
                        {
                          event.maxSeats
                        }
                      </p>
                    </div>

                    <Link
                      to={`/events/${event._id}`}
                    >
                      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition">
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