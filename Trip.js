// models/Trip.js
const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PassengerCreds",
    required: true,
  },
  driverName: { type: String, required: true },
  vehicle: { type: String, required: true },
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "PassengerCreds" }],
  startLocation: { type: String, required: true },
  destination: { type: String, required: true },
  seatsAvailable: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String },
});

module.exports = mongoose.model("Trip", TripSchema);
