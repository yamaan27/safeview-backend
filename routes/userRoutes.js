const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// All routes below are protected
// router.use(authMiddleware);

router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/:id", userController.getUserById);
// // Test route
router.get("/test", (req, res) => {
  console.log("Test route hit at /api/auth/test"); // Debug log
  res.json({ message: "Auth route Loginworking" });
});

module.exports = router;
