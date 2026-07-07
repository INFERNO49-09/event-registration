import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

export default function Admin() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [fee, setFee] = useState("");
  const [maxSeats, setMaxSeats] = useState("");
  const [poster, setPoster] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanMessage, setScanMessage] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const statsRes = await axios.get(apiUrl("/admin/stats"), {
        withCredentials: true,
      });

      const eventsRes = await axios.get(apiUrl("/admin/events"), {
        withCredentials: true,
      });

      setStats(statsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const createEvent = async () => {
    try {
      await axios.post(
        apiUrl("/events"),
        {
          title,
          description,
          venue,
          date,
          fee: Number(fee),
          maxSeats: Number(maxSeats),
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

      alert("Event created successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create event");
    }
  };

  const deleteEvent = async (id) => {
    const confirmDelete = window.confirm("Delete this event?");

    if (!confirmDelete) return;

    try {
      await axios.delete(apiUrl(`/events/${id}`), {
        withCredentials: true,
      });

      await loadDashboard();
    } catch {
      alert("Delete failed");
    }
  };

  const downloadCSV = (eventId) => {
    window.open(apiUrl(`/admin/export/${eventId}`), "_blank");
  };

  const scanTicket = async (event) => {
    event.preventDefault();

    if (!ticketCode.trim()) {
      setScanMessage("Enter or scan a ticket code.");
      return;
    }

    try {
      setScanning(true);
      setScanMessage("");
      setScanResult(null);

      const res = await axios.post(
        apiUrl("/admin/scan"),
        {
          ticketCode,
        },
        {
          withCredentials: true,
        }
      );

      setScanResult(res.data.registration);
      setScanMessage(res.data.message);
      setTicketCode("");
      await loadDashboard();
    } catch (error) {
      setScanResult(error?.response?.data?.registration || null);
      setScanMessage(error?.response?.data?.message || "Ticket scan failed.");
    } finally {
      setScanning(false);
    }
  };

  const logout = async () => {
    await axios.get(apiUrl("/auth/logout"), {
      withCredentials: true,
    });

    navigate("/");
  };

  if (loading) {
    return (
      <div className="center-stage">
        <p className="eyebrow">Opening the organizer desk...</p>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <nav className="dispatch-nav" aria-label="Admin navigation">
          <div className="brand-lockup">
            <div className="brand-mark">AD</div>
            <div>
              <p className="brand-title">Admin desk</p>
              <p className="brand-subtitle">Publish, measure, export</p>
            </div>
          </div>

          <div className="nav-actions">
            <button onClick={() => navigate("/events")} className="btn btn-primary">
              Event board
            </button>
            <button onClick={logout} className="btn btn-danger">
              Log out
            </button>
          </div>
        </nav>

        <section className="hero-grid" aria-labelledby="admin-title">
          <div>
            <p className="eyebrow">Organizer operations</p>
            <h1 id="admin-title" className="display-title">
              Keep every room accountable.
            </h1>
            <p className="body-copy">
              Publish the next listing, watch claimed seats and revenue, then
              export the door list when check-in starts.
            </p>
          </div>

          <aside className="hero-ticket" aria-label="Admin summary ticket">
            <div className="ticket-punches" />
            <div className="hero-ticket-content">
              <p className="ticket-code">Desk summary</p>
              <div className="ticket-main">{events.length} listings under watch.</div>
              <div className="ticket-row">
                <div>
                  <span className="meta-label">Mode</span>
                  <strong>Admin</strong>
                </div>
                <div>
                  <span className="meta-label">Export</span>
                  <strong>CSV</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {stats && (
          <section className="metric-grid" aria-label="Platform statistics">
            <div className="metric-card">
              <p className="meta-label">Total events</p>
              <div className="metric-value">{stats.totalEvents}</div>
            </div>
            <div className="metric-card">
              <p className="meta-label">Registrations</p>
              <div className="metric-value">{stats.totalRegistrations}</div>
            </div>
            <div className="metric-card">
              <p className="meta-label">Revenue</p>
              <div className="metric-value">₹{stats.totalRevenue}</div>
            </div>
            <div className="metric-card">
              <p className="meta-label">Checked in</p>
              <div className="metric-value">{stats.checkedIn}</div>
            </div>
            <div className="metric-card">
              <p className="meta-label">Waitlisted</p>
              <div className="metric-value">{stats.waitlisted}</div>
            </div>
            <div className="metric-card">
              <p className="meta-label">Cancelled</p>
              <div className="metric-value">{stats.cancelled}</div>
            </div>
          </section>
        )}

        <section className="detail-card mb-8" aria-labelledby="scan-title">
          <p className="ticket-code">Door scanner</p>
          <h2 id="scan-title" className="section-title">Scan ticket</h2>
          <p className="card-copy">
            Use a QR scanner that types into this field, or enter the ticket code manually.
          </p>

          <form onSubmit={scanTicket} className="inline-actions">
            <input
              type="text"
              value={ticketCode}
              onChange={(event) => setTicketCode(event.target.value)}
              className="input scan-input"
              placeholder="EH-..."
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary" disabled={scanning}>
              {scanning ? "Scanning..." : "Check in"}
            </button>
          </form>

          {scanMessage && <div className="message mt-4">{scanMessage}</div>}

          {scanResult && (
            <div className="meta-grid mt-6">
              <div className="meta-box">
                <span className="meta-label">Attendee</span>
                <strong>{scanResult.userId?.name}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Event</span>
                <strong>{scanResult.eventId?.title}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Status</span>
                <strong>{scanResult.status}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Checked in</span>
                <strong>{scanResult.checkedIn ? "Yes" : "No"}</strong>
              </div>
            </div>
          )}
        </section>

        <section className="detail-card mb-8" aria-labelledby="create-title">
          <p className="ticket-code">New listing</p>
          <h2 id="create-title" className="section-title">Create event</h2>

          <div className="admin-form-grid mt-8">
            <label className="field">
              <span className="field-label">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Hack night: payments edition"
              />
            </label>

            <label className="field">
              <span className="field-label">Venue</span>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="input"
                placeholder="Auditorium B"
              />
            </label>

            <label className="field">
              <span className="field-label">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </label>

            <label className="field">
              <span className="field-label">Fee</span>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="input"
                placeholder="0"
              />
            </label>

            <label className="field">
              <span className="field-label">Maximum seats</span>
              <input
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value)}
                className="input"
                placeholder="120"
              />
            </label>

            <label className="field">
              <span className="field-label">Poster URL</span>
              <input
                type="text"
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                className="input"
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              placeholder="What will attendees do, learn, or bring?"
            />
          </label>

          <button onClick={createEvent} className="btn btn-primary">
            Create event
          </button>
        </section>

        <section aria-labelledby="analytics-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Door list control</p>
              <h2 id="analytics-title" className="section-title">Event analytics</h2>
            </div>
          </div>

          <div className="analytics-grid">
            {events.map((event) => (
              <article className="analytics-card" key={event._id}>
                <div className="poster-frame">
                  {event.poster ? (
                    <img src={event.poster} alt={event.title} />
                  ) : (
                    <div className="poster-fallback">{event.title}</div>
                  )}
                </div>

                <div className="event-content">
                  <p className="ticket-code">Organizer record</p>
                  <h3 className="card-title">{event.title}</h3>

                  <div className="meta-grid">
                    <div className="meta-box">
                      <span className="meta-label">Registrations</span>
                      <strong>{event.registrations}</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Fee</span>
                      <strong>₹{event.fee}</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Revenue</span>
                      <strong>₹{event.revenue}</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Capacity</span>
                      <strong>{event.maxSeats}</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Waitlist</span>
                      <strong>{event.waitlisted}</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Attendance</span>
                      <strong>{event.checkedIn}</strong>
                    </div>
                  </div>

                  <div className="inline-actions">
                    <button onClick={() => downloadCSV(event._id)} className="btn btn-primary">
                      Export CSV
                    </button>
                    <button onClick={() => deleteEvent(event._id)} className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
