require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const pageRoutes = require("./routes/pageRoutes");
const bulkUploadRoutes = require("./routes/bulkUploadRoutes");

const app = express();

const server = http.createServer(app);

const PORT =
  process.env.PORT || 3000;

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin:
      process.env.FRONTEND_URL || "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    );
  });
});

// SECURITY
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
        ],

        imgSrc: [
          "'self'",
          "data:",
        ],

        connectSrc: [
          "'self'",
          "ws:",
          "wss:",
          "https://cdn.jsdelivr.net",
        ],

        fontSrc: [
          "'self'",
          "https:",
          "data:",
        ],

        objectSrc: ["'none'"],

        baseUri: ["'self'"],

        formAction: ["'self'"],

        frameAncestors: ["'self'"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "*",
  })
);

// RATE LIMITING
const globalLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      error:
        "Too many requests. Please try again later.",
    },
  });

app.use(globalLimiter);

// BODY PARSING
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

// STATIC FILES
app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

// EJS
app.set(
  "view engine",
  "ejs"
);

app.set(
  "views",
  path.join(
    __dirname,
    "views"
  )
);

// HEALTH CHECK
app.get(
  "/health",
  (req, res) => {
    res.status(200).json({
      message:
        "School Management ERP API is running",
    });
  }
);

// API ROUTES
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/test",
  testRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/grades",
  gradeRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// ATTENDANCE REPORT EXPORT
app.use(
  "/reports/attendance",
  attendanceRoutes
);

// BULK CSV UPLOAD
app.use(
  "/api/upload",
  bulkUploadRoutes
);

// PAGE ROUTES
app.use(
  "/",
  pageRoutes
);

// 404
app.use(
  (req, res) => {
    res.status(404).json({
      error:
        "Route not found",
    });
  }
);

// MONGODB
mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {
    console.log(
      "Connected to MongoDB Atlas"
    );

    server.listen(
      PORT,
      () => {
        console.log(
          `School Management ERP running on http://localhost:${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });