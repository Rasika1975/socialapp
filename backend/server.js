require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [
      "http://localhost:3000",
      "https://socialapp-1-8dcs.onrender.com",
    ],
    credentials: true,
  }));
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

// Serve static assets (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
