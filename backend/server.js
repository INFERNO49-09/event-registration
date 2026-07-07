require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
const normalizeOrigin = (origin) =>
  origin?.trim().replace(/\/$/, "");

const FRONTEND_URL =
  normalizeOrigin(process.env.FRONTEND_URL) ||
  "https://event-registration1342.vercel.app";

const configuredOrigins =
  process.env.CORS_ORIGINS || FRONTEND_URL;

const allowedOrigins = new Set(
  configuredOrigins
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
);

allowedOrigins.add("https://event-registration1342.vercel.app");

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
      const normalizedOrigin = normalizeOrigin(origin);

      if (!normalizedOrigin || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message:
        "Too many requests. Try again later.",
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Try again later.",
  },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many payment requests. Try again later.",
  },
});

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

app.use("/auth", authLimiter, authRoutes);

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
  paymentLimiter,
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
