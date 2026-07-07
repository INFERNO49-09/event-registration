import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getSeatFill = (event) => {
  if (!event?.maxSeats) return 0;
  return Math.min(100, Math.round((event.registrations / event.maxSeats) * 100));
};

export default function MyEvents() {
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function loadPage() {
    try {
      const userRes = await axios.get(apiUrl("/auth/me"), {
        withCredentials: true,
      });

      const currentUser = userRes.data;

      setUser(currentUser);

      const regRes = await axios.get(
        apiUrl(`/registrations/user/${currentUser._id}`),
        {
          withCredentials: true,
        }
      );

      setRegistrations(regRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(loadPage);
  }, []);

  const logout = async () => {
    try {
      await axios.get(apiUrl("/auth/logout"), {
        withCredentials: true,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="center-stage">
        <p className="eyebrow">Checking your claimed seats...</p>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <nav className="dispatch-nav" aria-label="Registration navigation">
          <div className="brand-lockup">
            <div className="brand-mark">MY</div>
            <div>
              <p className="brand-title">My registrations</p>
              <p className="brand-subtitle">{user?.name}</p>
            </div>
          </div>

          <div className="nav-actions">
            <button onClick={() => navigate("/events")} className="btn btn-primary">
              Browse events
            </button>
            <button onClick={logout} className="btn btn-danger">
              Log out
            </button>
          </div>
        </nav>

        <section className="hero-grid" aria-labelledby="registrations-title">
          <div>
            <p className="eyebrow">Your event wallet</p>
            <h1 id="registrations-title" className="display-title">
              Every claimed seat, ready for check-in.
            </h1>
            <p className="body-copy">
              Keep the venue, payment status, and registration details together
              before you reach the door.
            </p>
          </div>

          <aside className="hero-ticket" aria-label="Registration count">
            <div className="ticket-punches" />
            <div className="hero-ticket-content">
              <p className="ticket-code">Held by {user?.name}</p>
              <div className="ticket-main">{registrations.length} active pass</div>
              <div className="ticket-row">
                <div>
                  <span className="meta-label">Status</span>
                  <strong>Ready</strong>
                </div>
                <div>
                  <span className="meta-label">Desk</span>
                  <strong>Check-in</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {registrations.length === 0 ? (
          <div className="empty-state">
            <h2 className="card-title">No seats claimed yet.</h2>
            <p className="card-copy">
              Open the event board, choose a room, and your registration will
              appear here.
            </p>
            <button onClick={() => navigate("/events")} className="btn btn-primary">
              Browse events
            </button>
          </div>
        ) : (
          <section className="event-grid" aria-label="Registered events">
            {registrations.map((registration) => {
              const event = registration.eventId;

              return (
                <article className="event-ticket-card" key={registration._id}>
                  <div className="ticket-rail" aria-hidden="true">
                    <span
                      className="seat-fill"
                      style={{ "--seat-fill": `${getSeatFill(event)}%` }}
                    />
                  </div>

                  <div className="event-card-body">
                    <div className="poster-frame">
                      {event?.poster ? (
                        <img src={event.poster} alt={event.title} />
                      ) : (
                        <div className="poster-fallback">{event?.title || "Event"}</div>
                      )}
                    </div>

                    <div className="event-content">
                      <p className="ticket-code">{registration.paymentStatus}</p>
                      <h3 className="card-title">{event?.title}</h3>

                      <div className="meta-grid">
                        <div className="meta-box">
                          <span className="meta-label">Venue</span>
                          <strong>{event?.venue}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Date</span>
                          <strong>{event?.date ? formatDate(event.date) : "N/A"}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Phone</span>
                          <strong>{registration.phone}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Paid</span>
                          <strong>₹{registration.amountPaid}</strong>
                        </div>
                      </div>

                      {event?._id && (
                        <Link to={`/events/${event._id}`} className="btn btn-primary full-width">
                          View event
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
