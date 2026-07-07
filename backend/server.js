require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const dns = require("dns");

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const dnsServers =
  process.env.DNS_SERVERS ||
  (!isProduction ? "8.8.8.8,1.1.1.1" : "");

if (dnsServers) {
  dns.setServers(
    dnsServers
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean)
  );
}

function validateEnv() {
  const requiredEnv = [
    "MONGO_URI",
    "SESSION_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "FRONTEND_URL",
  ];

  const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnv.join(", ")}`
    );
  }
}

validateEnv();

require("./passport");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payments");

const app = express();
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const configuredOrigins =
  process.env.CORS_ORIGINS || FRONTEND_URL;

const allowedOrigins = new Set(
  configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

if (!isProduction) {
  [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
  ].forEach((origin) => allowedOrigins.add(origin));
}

/*
====================================
Middleware
====================================
*/

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "eventhub.sid",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
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

async function startServer() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !isProduction,
  });

  console.log("✅ MongoDB Connected");

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running on port ${PORT}`
    );
  });
}

startServer().catch((err) => {
  console.error(
    "❌ MongoDB Connection Error:",
    err.message
  );
  process.exit(1);
});

