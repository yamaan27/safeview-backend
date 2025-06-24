const Task = require("../models/Task");
const User = require("../models/User");

// Get total tasks, completed tasks, pending tasks
exports.getSummaryReport = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: "completed" });
    const pending = await Task.countDocuments({ status: "pending" });

    res.json({ total, completed, pending });
  } catch (error) {
    console.error("[getSummaryReport]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get agent-wise task stats
exports.getAgentReport = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const tasks = await Task.find({ assignedTo: agentId });

    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;

    res.json({
      agentId,
      total: tasks.length,
      completed,
      pending,
    });
  } catch (error) {
    console.error("[getAgentReport]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Monthly report (last 6 months)
exports.getMonthlyReport = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await Task.aggregate(pipeline);

    res.json(result);
  } catch (error) {
    console.error("[getMonthlyReport]", error);
    res.status(500).json({ message: "Server error" });
  }
};
