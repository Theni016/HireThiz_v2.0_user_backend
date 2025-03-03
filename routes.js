const express = require("express");
const PassengerCreds = require("./models/PassengerCreds");
const router = express.Router();
const Trip = require("./Trip");

router.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find().populate("passenger", "username email");
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Error fetching trips" });
  }
});

module.exports = router;
