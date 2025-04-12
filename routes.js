const express = require("express");
const PassengerCreds = require("./models/PassengerCreds");
const router = express.Router();
const Trip = require("./Trip");
const authMiddleware = require("./middleware/authMiddleware");

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

router.post("/book-trip", authMiddleware, async (req, res) => {
  const { tripId, seatsBooked } = req.body;

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

    const passenger = await PassengerCreds.findById(req.user.id);
    if (!passenger) {
      return res
        .status(404)
        .json({ success: false, message: "Passenger not found" });
    }

    const { username, phoneNumber } = passenger;
    const totalAmount = seatsBooked * trip.pricePerSeat;

    trip.bookings.push({
      passengerId: passenger._id,
      name: username,
      phone: phoneNumber,
      seatsBooked,
      totalAmount,
    });

    trip.seatsAvailable -= seatsBooked;
    await trip.save();

    passenger.bookings.push({ tripId, seatsBooked, totalAmount });
    await passenger.save();

    res.status(200).json({ success: true, message: "Booking successful" });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/booked-trips", authMiddleware, async (req, res) => {
  try {
    const passengerId = req.user.id;
    const passenger = await PassengerCreds.findById(passengerId);
    console.log("Passenger lookup by req.user.id:", req.user.id);
    console.log("Passenger found:", passenger);

    if (!passenger) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    const bookingsWithTrips = (
      await Promise.all(
        passenger.bookings.map(async (booking) => {
          console.log("Looking for trip with ID:", booking.tripId);
          const trip = await Trip.findById(booking.tripId);

          if (!trip) {
            console.warn("No trip found for tripId:", booking.tripId);
          }

          return { trip, booking };
        })
      )
    ).filter(Boolean);

    res.json(bookingsWithTrips);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
