import { useEffect, useState } from "react";
import axios from "axios";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] =
    useState(null);

  const [user, setUser] =
    useState(null);

  const [phone, setPhone] =
    useState("");

  const [college, setCollege] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const eventRes =
        await axios.get(
          `http://localhost:5000/events/${id}`
        );

      const userRes =
        await axios.get(
          "http://localhost:5000/auth/me",
          {
            withCredentials: true,
          }
        );

      setEvent(eventRes.data);
      setUser(userRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent =
    async () => {
      try {
        setMessage("");

        if (!phone || !college) {
          setMessage(
            "Please fill all fields"
          );
          return;
        }

        if (
          Number(event.fee) === 0
        ) {
          const res =
            await axios.post(
              "http://localhost:5000/payments/free-register",
              {
                eventId: id,
                phone,
                college,
              },
              {
                withCredentials: true,
              }
            );

          if (
            res.data.success
          ) {
            setMessage(
              "Successfully registered!"
            );
          }

          return;
        }

        const orderRes =
          await axios.post(
            "http://localhost:5000/payments/create-order",
            {
              eventId: id,
            },
            {
              withCredentials: true,
            }
          );

        const order =
          orderRes.data.order;

        const options = {
          key: import.meta.env
            .VITE_RAZORPAY_KEY_ID,

          amount:
            order.amount,

          currency:
            order.currency,

          name:
            "Event Registration",

          description:
            event.title,

          order_id:
            order.id,

          prefill: {
            name:
              user?.name,
            email:
              user?.email,
          },

          handler:
            async function (
              response
            ) {
              try {
                const verifyRes =
                  await axios.post(
                    "http://localhost:5000/payments/verify",
                    {
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      eventId:
                        id,

                      phone,
                      college,
                    },
                    {
                      withCredentials:
                        true,
                    }
                  );

                if (
                  verifyRes.data
                    .success
                ) {
                  setMessage(
                    "Payment successful!"
                  );
                }
              } catch (
                error
              ) {
                console.error(
                  error
                );

                setMessage(
                  "Payment verification failed"
                );
              }
            },
        };

        const rzp =
          new window.Razorpay(
            options
          );

        rzp.open();
      } catch (error) {
        console.error(error);

        setMessage(
          error?.response?.data
            ?.message ||
            "Registration failed"
        );
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Event not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}

      <div className="relative h-[400px] overflow-hidden">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-700" />
        )}

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-10 left-10">
          <button
            onClick={() =>
              navigate("/events")
            }
            className="mb-4 bg-black/30 px-4 py-2 rounded-xl backdrop-blur"
          >
            ← Back
          </button>

          <h1 className="text-5xl font-bold">
            {event.title}
          </h1>

          <p className="mt-3 text-lg text-slate-200">
            {event.venue}
          </p>
        </div>
      </div>

      {/* Main Content */}

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-8">
        {/* Left */}

        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              About Event
            </h2>

            <p className="text-slate-300 leading-8">
              {
                event.description
              }
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-2xl p-4">
                <p className="text-slate-400">
                  Date
                </p>

                <h3 className="text-xl font-semibold">
                  {new Date(
                    event.date
                  ).toLocaleDateString()}
                </h3>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4">
                <p className="text-slate-400">
                  Venue
                </p>

                <h3 className="text-xl font-semibold">
                  {
                    event.venue
                  }
                </h3>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4">
                <p className="text-slate-400">
                  Fee
                </p>

                <h3 className="text-xl font-semibold">
                  ₹{event.fee}
                </h3>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4">
                <p className="text-slate-400">
                  Seats
                </p>

                <h3 className="text-xl font-semibold">
                  {
                    event.registrations
                  }
                  /
                  {
                    event.maxSeats
                  }
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Card */}

        <div>
          <div className="sticky top-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Register
            </h2>

            <p className="text-slate-400 mb-6">
              Logged in as{" "}
              {user?.name}
            </p>

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              className="w-full mb-4 p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              type="text"
              placeholder="College Name"
              value={college}
              onChange={(e) =>
                setCollege(
                  e.target.value
                )
              }
              className="w-full mb-4 p-3 rounded-xl bg-slate-900 border border-slate-700"
            />

            <button
              onClick={
                registerForEvent
              }
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
            >
              {event.fee > 0
                ? `Pay ₹${event.fee} & Register`
                : "Register Free"}
            </button>

            {message && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900 text-center">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}