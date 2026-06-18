require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

require("./passport");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payments");

const app = express();

/*
====================================
Middleware
====================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/*
====================================
Passport
====================================
*/

app.use(passport.initialize());
app.use(passport.session());

/*
====================================
MongoDB
====================================
*/

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error(
      "❌ MongoDB Connection Error:",
      err
    );
  });

/*
====================================
Routes
====================================
*/

app.use("/auth", authRoutes);

app.use("/events", eventRoutes);

app.use(
  "/registrations",
  registrationRoutes
);

app.use("/admin", adminRoutes);

/*
====================================
Health Check
====================================
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Event Registration API Running",
  });
});
app.use(
  "/payments",
  paymentRoutes
);

/*
====================================
404 Handler
====================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
====================================
Server
====================================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});

