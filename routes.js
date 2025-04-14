const express = require("express");
const PassengerCreds = require("./models/PassengerCreds");
const DriverCreds = require("./models/DriverCreds");
const router = express.Router();
const Trip = require("./Trip");
const authMiddleware = require("./middleware/authMiddleware");
const mongoose = require("mongoose");

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

router.post("/rate-driver", authMiddleware, async (req, res) => {
  try {
    const { bookingId, rating } = req.body; // bookingId is actually the tripId

    // 🔍 LOG the values being received
    console.log("Received rating submission:");
    console.log("bookingId (tripId):", bookingId);
    console.log("rating:", rating);

    const passengerId = req.user.id;

    // Validate rating input
    if (
      typeof rating !== "number" ||
      isNaN(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({ message: "Invalid rating value." });
    }

    // ✅ Step 1: Find the trip by bookingId (which is actually tripId)
    const trip = await Trip.findById(bookingId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // ✅ Step 2: Find the driverId from the trip
    const driverId = trip.driver;
    const driver = await DriverCreds.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // ✅ Step 4: Update driver's rating
    const currentAvg = driver.rating.average || 0;
    const currentCount = driver.rating.count || 0;

    const newCount = currentCount + 1;
    const newAverage = (currentAvg * currentCount + rating) / newCount;

    driver.rating.average = newAverage;
    driver.rating.count = newCount;
    await driver.save();

    const passenger = await PassengerCreds.findById(passengerId);
    if (passenger) {
      const booking = passenger.bookings.find(
        (b) => b.tripId.toString() === bookingId
      );
      if (booking) {
        booking.hasRated = true;
        await passenger.save();
      }
    }

    return res.status(200).json({ message: "Rating submitted successfully." });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
