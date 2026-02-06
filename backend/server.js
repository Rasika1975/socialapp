require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Trust proxy is required for secure cookies and protocol detection on Render
app.set("trust proxy", 1);

// Middleware
app.use(cors({
    origin: [
      "http://localhost:3000",
      "https://socialapp-1-8dcs.onrender.com",
    ],
    credentials: true,
  }));
app.use(express.json());

// Serve static files from uploads directory (fallback for local storage)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
