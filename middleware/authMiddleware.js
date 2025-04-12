const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // 🔒 You can move this to an env variable for better practice

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access Denied. Invalid Authorization Header" });
  }

  // Extract token after 'Bearer '
  const token = authHeader.split(" ")[1];

  console.log("✅ Extracted Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      return res.status(400).json({ message: "Token missing user ID" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return res.status(400).json({ message: "Invalid Token" });
  }
};
