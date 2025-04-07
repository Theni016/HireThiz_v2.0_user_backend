const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const chatbotRoutes = require("./chatbot");
const routes = require("./routes");
const authRoutes = require("./authRoutes");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api", chatbotRoutes);
app.use("/api", routes);
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// MongoDB Connection

mongoose
  .connect("mongodb://localhost:27017/hirethiz", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB 🚀"))
  .catch((error) => console.error("MongoDB connection error:", error));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {});

// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
