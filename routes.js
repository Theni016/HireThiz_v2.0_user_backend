const express = require("express");
const PassengerCreds = require("./models/PassengerCreds");
const router = express.Router();
const Trip = require("./Trip");

router.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find().populate(
      "bookings.passengerId",
      "username email"
    );
    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Error fetching trips" });
  }
});

module.exports = router;

router.post("/book-trip", async (req, res) => {
  const { tripId, userId, username, phone, seatsBooked } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    if (trip.seatsAvailable < seatsBooked) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats available" });
    }

    const passenger = await PassengerCreds.findById(userId);
    if (!passenger) {
      return res
        .status(404)
        .json({ success: false, message: "Passenger not found" });
    }

    const totalAmount = seatsBooked * trip.pricePerSeat;

    // Save booking info inside trip
    trip.bookings.push({
      passengerId: userId,
      name: username,
      phone,
      seatsBooked,
      totalAmount,
    });

    trip.seatsAvailable -= seatsBooked;
    await trip.save();

    // Optional: Save booking in passenger's record (if needed)
    passenger.bookings.push({ tripId, seatsBooked, totalAmount });
    await passenger.save();

    res.status(200).json({ success: true, message: "Booking successful" });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
