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
});

const PassengerCreds =
  mongoose.models.PassengerCreds ||
  mongoose.model("PassengerCreds", passengerCredsSchema);

module.exports = PassengerCreds;
