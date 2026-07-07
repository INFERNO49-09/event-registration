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
  if (!event.maxSeats) return 0;
  return Math.min(100, Math.round((event.registrations / event.maxSeats) * 100));
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function loadPage() {
    try {
      const userRes = await axios.get(apiUrl("/auth/me"), {
        withCredentials: true,
      });

      setUser(userRes.data);

      const eventsRes = await axios.get(apiUrl("/events"));

      setEvents(eventsRes.data);
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
        <p className="eyebrow">Loading the event board...</p>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <nav className="dispatch-nav" aria-label="Primary navigation">
          <div className="brand-lockup">
            <div className="brand-mark">EH</div>
            <div>
              <p className="brand-title">EventHub</p>
              <p className="brand-subtitle">Welcome, {user?.name}</p>
            </div>
          </div>

          <div className="nav-actions">
            <button onClick={() => navigate("/my-events")} className="btn btn-secondary">
              My registrations
            </button>

            {user?.role === "admin" && (
              <button onClick={() => navigate("/admin")} className="btn btn-primary">
                Admin desk
              </button>
            )}

            <button onClick={logout} className="btn btn-danger">
              Log out
            </button>
          </div>
        </nav>

        <section className="hero-grid" aria-labelledby="events-title">
          <div>
            <p className="eyebrow">Live event dispatch</p>
            <h1 id="events-title" className="display-title">
              Pick the room before the room picks <span className="title-stamp">full.</span>
            </h1>
            <p className="body-copy">
              Workshops, hackathons, seminars, and competitions are listed like
              the operations board they become on event day: venue, date, fee,
              and remaining capacity up front.
            </p>
          </div>

          <aside className="hero-ticket" aria-label="EventHub ticket preview">
            <div className="ticket-punches" />
            <div className="hero-ticket-content">
              <p className="ticket-code">Seat rail active</p>
              <div className="ticket-main">Every card shows how crowded the room is.</div>
              <div className="ticket-row">
                <div>
                  <span className="meta-label">Listed</span>
                  <strong>{events.length}</strong>
                </div>
                <div>
                  <span className="meta-label">Next step</span>
                  <strong>Book</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section aria-labelledby="browse-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Browse the board</p>
              <h2 id="browse-title" className="section-title">Open seats</h2>
            </div>
            <p className="muted">The coral rail marks claimed capacity.</p>
          </div>

          {events.length === 0 ? (
            <div className="empty-state">
              <h2 className="card-title">No events are listed yet.</h2>
              <p className="card-copy">
                Check back after organizers publish the next workshop, seminar,
                hackathon, or competition.
              </p>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => (
                <article className="event-ticket-card" key={event._id}>
                  <div className="ticket-rail" aria-hidden="true">
                    <span
                      className="seat-fill"
                      style={{ "--seat-fill": `${getSeatFill(event)}%` }}
                    />
                  </div>

                  <div className="event-card-body">
                    <div className="poster-frame">
                      {event.poster ? (
                        <img src={event.poster} alt={event.title} />
                      ) : (
                        <div className="poster-fallback">{event.title}</div>
                      )}
                    </div>

                    <div className="event-content">
                      <p className="ticket-code">{getSeatFill(event)}% seats claimed</p>
                      <h3 className="card-title">{event.title}</h3>
                      <p className="card-copy">{event.description}</p>

                      <div className="meta-grid">
                        <div className="meta-box">
                          <span className="meta-label">Venue</span>
                          <strong>{event.venue}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Date</span>
                          <strong>{formatDate(event.date)}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Fee</span>
                          <strong>₹{event.fee}</strong>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Seats</span>
                          <strong>
                            {event.registrations}/{event.maxSeats}
                          </strong>
                        </div>
                      </div>

                      <Link to={`/events/${event._id}`} className="btn btn-primary full-width">
                        View event
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
