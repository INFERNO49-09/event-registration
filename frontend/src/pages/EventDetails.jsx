import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const eventRes = await axios.get(apiUrl(`/events/${id}`));

        const userRes = await axios.get(apiUrl("/auth/me"), {
          withCredentials: true,
        });

        setEvent(eventRes.data);
        setUser(userRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });
  }, [id]);

  const registerForEvent = async () => {
    try {
      setMessage("");
      setRegistering(true);

      if (!phone || !college) {
        setMessage("Enter your phone number and college name to register.");
        setRegistering(false);
        return;
      }

      if (Number(event.fee) === 0) {
        const res = await axios.post(
          apiUrl("/payments/free-register"),
          {
            eventId: id,
            phone,
            college,
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setMessage(
            res.data.waitlisted
              ? "This event is full. You have been added to the waitlist."
              : "Registered. Your QR ticket is now in My registrations."
          );
        }

        return;
      }

      const orderRes = await axios.post(
        apiUrl("/payments/create-order"),
        {
          eventId: id,
          phone,
          college,
        },
        {
          withCredentials: true,
        }
      );

      if (orderRes.data.waitlisted) {
        setMessage("This event is full. You have been added to the waitlist without payment.");
        return;
      }

      const order = orderRes.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "EventHub",
        description: event.title,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              apiUrl("/payments/verify"),
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: id,
                phone,
                college,
              },
              {
                withCredentials: true,
              }
            );

            if (verifyRes.data.success) {
              setMessage("Paid and registered. Your QR ticket is now in My registrations.");
            }
          } catch (error) {
            console.error(error);
            setMessage("Payment was received, but verification failed. Contact the organizer.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);

      setMessage(error?.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="center-stage">
        <p className="eyebrow">Finding the event ticket...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="center-stage">
        <div className="empty-state">
          <h1 className="card-title">Event not found.</h1>
          <p className="card-copy">Return to the board and choose a listed event.</p>
          <button onClick={() => navigate("/events")} className="btn btn-primary">
            Back to events
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <section className="detail-hero">
        {event.poster ? (
          <img src={event.poster} alt={event.title} />
        ) : (
          <div className="detail-hero-fallback" />
        )}

        <div className="detail-hero-content">
          <button onClick={() => navigate("/events")} className="btn btn-secondary">
            Back to board
          </button>
          <p className="eyebrow mt-8">Event ticket</p>
          <h1 className="display-title">{event.title}</h1>
          <p className="body-copy" style={{ color: "#dfe7ff" }}>
            {event.venue}
          </p>
        </div>
      </section>

      <div className="page-wrap detail-layout">
        <section className="detail-card" aria-labelledby="about-title">
          <p className="ticket-code">Program notes</p>
          <h2 id="about-title" className="section-title">About this event</h2>
          <p className="body-copy">{event.description}</p>

          <div className="meta-grid mt-8">
            <div className="meta-box">
              <span className="meta-label">Date</span>
              <strong>{formatDate(event.date)}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-label">Venue</span>
              <strong>{event.venue}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-label">Fee</span>
              <strong>₹{event.fee}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-label">Seats claimed</span>
              <strong>
                {event.registrations}/{event.maxSeats}
              </strong>
            </div>
          </div>
        </section>

        <aside className="form-card" aria-labelledby="register-title">
          <p className="ticket-code">Registration desk</p>
          <h2 id="register-title" className="card-title">Claim your seat</h2>
          <p className="card-copy">Logged in as {user?.name}.</p>

          <label className="field">
            <span className="field-label">Phone number</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="98765 43210"
            />
          </label>

          <label className="field">
            <span className="field-label">College name</span>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="input"
              placeholder="Your college"
            />
          </label>

          <button
            onClick={registerForEvent}
            className="btn btn-primary full-width"
            disabled={registering}
          >
            {registering
              ? "Working..."
              : Number(event.fee) > 0
                ? `Pay ₹${event.fee} and register`
                : "Register free"}
          </button>

          {message && <div className="message">{message}</div>}
        </aside>
      </div>
    </main>
  );
}
