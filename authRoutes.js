const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PassengerCreds = require("./models/PassengerCreds");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = "your_secret_key";

// Passenger Sign-Up
router.post("/passenger/signup", async (req, res) => {
  try {
    const { email, password, username, phoneNumber } = req.body;

    const existingPassenger = await PassengerCreds.findOne({ email });
    if (existingPassenger) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPassenger = new PassengerCreds({
      email,
      password: hashedPassword,
      username,
      phoneNumber,
    });
    await newPassenger.save();

    res.status(201).json({ message: "Passenger registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Passenger Login
router.post("/passenger/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const passenger = await PassengerCreds.findOne({ email });
    if (!passenger) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, passenger.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: passenger._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Passenger Profile - Get Logged-in User Info
router.get("/passenger/profile", authMiddleware, async (req, res) => {
  try {
    const passenger = await PassengerCreds.findById(req.user.id).select(
      "-password"
    );
    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }
    res.json(passenger);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
