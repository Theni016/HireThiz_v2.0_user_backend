// models/Trip.js (User)
const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DriverCreds",
    required: true,
  },
  driverName: { type: String, required: true },
  vehicle: { type: String, required: true },
  startLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  destination: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  seatsAvailable: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  bookings: [
    {
      passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PassengerCreds",
      },
      name: String,
      phone: String,
      seatsBooked: Number,
      totalAmount: Number,
      hasRated: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("Trip", TripSchema);
