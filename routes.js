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

router.post("/book-trip", async (req, res) => {
  const { tripId, userId, seatsBooked } = req.body;

  try {
    // Find the trip by ID
    let trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    // Check if enough seats are available
    if (trip.seatsAvailable < seatsBooked) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats available" });
    }

    // Find the passenger by userId
    let passenger = await PassengerCreds.findById(userId);
    if (!passenger) {
      return res
        .status(404)
        .json({ success: false, message: "Passenger not found" });
    }

    // ✅ Set the `passenger` field if it's empty
    if (!trip.passenger) {
      trip.passenger = passenger._id;
    }

    // ✅ Add passenger to `passengers` array
    trip.passengers.push(passenger._id);

    // ✅ Reduce available seats
    trip.seatsAvailable -= seatsBooked;

    // ✅ Save the trip with updated `passenger` and `passengers`
    await trip.save();

    // ✅ Add the booked trip to the passenger's profile
    passenger.bookings.push({ tripId, seatsBooked });
    await passenger.save();

    res.status(200).json({ success: true, message: "Booking successful" });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
