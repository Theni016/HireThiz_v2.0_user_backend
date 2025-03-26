const mongoose = require("mongoose");

const passengerCredsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookings: [
    {
      tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
      },
      seatsBooked: {
        type: Number,
        required: true,
      },
      bookedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const PassengerCreds =
  mongoose.models.PassengerCreds ||
  mongoose.model("PassengerCreds", passengerCredsSchema);

module.exports = PassengerCreds;
