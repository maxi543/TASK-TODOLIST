const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");

const path = require("path");
const routes = require("./routes");

const app = express();
const PORT = 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 6000 * 60 * 1000,
    },
  })
);

// Routes
app.use("", routes); // Use the routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
