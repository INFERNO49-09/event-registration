import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] =
    useState("");
  const [description,
    setDescription] =
    useState("");
  const [venue, setVenue] =
    useState("");
  const [date, setDate] =
    useState("");
  const [fee, setFee] =
    useState("");
  const [maxSeats,
    setMaxSeats] =
    useState("");
  const [poster, setPoster] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const statsRes =
        await axios.get(
          "http://localhost:5000/admin/stats",
          {
            withCredentials: true,
          }
        );

      const eventsRes =
        await axios.get(
          "http://localhost:5000/admin/events",
          {
            withCredentials: true,
          }
        );

      setStats(statsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent =
    async () => {
      try {
        await axios.post(
          "http://localhost:5000/events",
          {
            title,
            description,
            venue,
            date,
            fee: Number(fee),
            maxSeats:
              Number(maxSeats),
            poster,
          },
          {
            withCredentials: true,
          }
        );

        setTitle("");
        setDescription("");
        setVenue("");
        setDate("");
        setFee("");
        setMaxSeats("");
        setPoster("");

        await loadDashboard();

        alert(
          "Event created successfully"
        );
      } catch (error) {
        alert(
          error?.response?.data
            ?.message ||
            "Failed to create event"
        );
      }
    };

  const deleteEvent =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Delete this event?"
        );

      if (!confirmDelete)
        return;

      try {
        await axios.delete(
          `http://localhost:5000/events/${id}`,
          {
            withCredentials: true,
          }
        );

        await loadDashboard();
      } catch (error) {
        alert(
          "Delete failed"
        );
      }
    };

  const downloadCSV =
    (eventId) => {
      window.open(
        `http://localhost:5000/admin/export/${eventId}`,
        "_blank"
      );
    };

  const logout =
    async () => {
      await axios.get(
        "http://localhost:5000/auth/logout",
        {
          withCredentials: true,
        }
      );

      navigate("/");
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-slate-400">
              Manage events,
              registrations &
              revenue
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(
                  "/events"
                )
              }
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Events
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}

      {stats && (
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <p className="text-slate-400">
              Total Events
            </p>

            <h2 className="text-5xl font-bold mt-2">
              {
                stats.totalEvents
              }
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <p className="text-slate-400">
              Registrations
            </p>

            <h2 className="text-5xl font-bold mt-2">
              {
                stats.totalRegistrations
              }
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <p className="text-slate-400">
              Revenue
            </p>

            <h2 className="text-5xl font-bold mt-2">
              ₹
              {
                stats.totalRevenue
              }
            </h2>
          </div>
        </div>
      )}

      {/* Create Event */}

      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6">
            Create Event
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="text"
              placeholder="Venue"
              value={venue}
              onChange={(e) =>
                setVenue(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="number"
              placeholder="Fee"
              value={fee}
              onChange={(e) =>
                setFee(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="number"
              placeholder="Maximum Seats"
              value={maxSeats}
              onChange={(e) =>
                setMaxSeats(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="text"
              placeholder="Poster URL"
              value={poster}
              onChange={(e) =>
                setPoster(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-slate-900 border border-slate-700"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="w-full mt-4 p-3 rounded-xl bg-slate-900 border border-slate-700 min-h-[120px]"
          />

          <button
            onClick={
              createEvent
            }
            className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold"
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Events */}

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold mb-6">
          Event Analytics
        </h2>

        <div className="grid lg:grid-cols-2 gap-6">
          {events.map(
            (event) => (
              <div
                key={
                  event._id
                }
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
              >
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
                  <div className="h-52 bg-gradient-to-r from-blue-600 to-purple-700" />
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">
                    {
                      event.title
                    }
                  </h3>

                  <div className="space-y-2 text-slate-300">
                    <p>
                      👥{" "}
                      {
                        event.registrations
                      }{" "}
                      registrations
                    </p>

                    <p>
                      💰 Fee:
                      ₹
                      {
                        event.fee
                      }
                    </p>

                    <p>
                      📈 Revenue:
                      ₹
                      {
                        event.revenue
                      }
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() =>
                        downloadCSV(
                          event._id
                        )
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl"
                    >
                      Export CSV
                    </button>

                    <button
                      onClick={() =>
                        deleteEvent(
                          event._id
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}