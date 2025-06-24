const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Create a task
router.post("/", taskController.createTask);

// Get all tasks
router.get("/", taskController.getTasks);

// Update a task
router.put("/:id", taskController.updateTask);

// Assign task to user
router.patch("/:id/assign", taskController.assignTask);

router.get("/:id", taskController.getTaskById);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
