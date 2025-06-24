// const express = require("express");
// const router = express.Router();

// // Test route
// router.get("/test", (req, res) => {
//   console.log("Test route hit at /api/auth/test"); // Debug log
//   res.json({ message: "Auth route Loginworking" });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

router.post("/login", login);

module.exports = router;

