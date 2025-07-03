const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log(`authMiddleware triggered for: ${req.originalUrl}`); // Log the URL
  const authHeader = req.headers.authorization;
  console.log(`Authorization header: ${authHeader || "None"}`); // Log the header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid Bearer token provided"); // Debug log
    return res.status(403).json({ message: "Forbidden - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Token: ${token}`); // Log the token (be cautious with sensitive data in production)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token decoded: ${JSON.stringify(decoded)}`); // Log decoded token
    req.user = decoded;
    next();
  } catch (error) {
    console.log(`Token verification error: ${error.message}`); // Log error
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }
};

module.exports = authMiddleware;
