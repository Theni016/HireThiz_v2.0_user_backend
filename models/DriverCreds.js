const mongoose = require("mongoose");

const driverCredsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  vehicle: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
});

const DriverCreds =
  mongoose.models.DriverCreds ||
  mongoose.model("DriverCreds", driverCredsSchema);
module.exports = DriverCreds;
