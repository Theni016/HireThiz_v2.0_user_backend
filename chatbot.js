const express = require("express");
const axios = require("axios");
const router = express.Router();

// Chatbot API endpoint
router.post("/chatbot", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "http://192.168.8.140:5005/webhooks/rest/webhook", // 🔁 Use actual IP here
      {
        sender: "user", // 👈 Add sender if you want to track by user or rider
        message,
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Chatbot error", error: error.message });
  }
});

module.exports = router;
