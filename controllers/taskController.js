const Task = require("../models/Task");

// @desc Create a new task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      assignedTo,
      startTime,
      endTime,
      proof,
      status,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = new Task({
      title,
      description,
      location,
      assignedTo,
      startTime,
      endTime,
      proof,
      status,
      createdBy,
    });

    const savedTask = await task.save();
    res.status(201).json({ message: "Task created", task: savedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Assign task to a user
exports.assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: "Assigned user ID is required" });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task assigned", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get a task by ID
exports.getTaskById = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate("assignedTo", "name email");
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  // @desc Delete a task
  exports.deleteTask = async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  