const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");


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
// exports.getAgentReport = async (req, res) => {
//   try {
//     const agentId = req.params.agentId;

//     const tasks = await Task.find({ assignedTo: agentId });

//     const completed = tasks.filter((t) => t.status === "completed").length;
//     const pending = tasks.filter((t) => t.status === "pending").length;

//     res.json({
//       agentId,
//       total: tasks.length,
//       completed,
//       pending,
//     });
//   } catch (error) {
//     console.error("[getAgentReport]", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getAgentReport = async (req, res) => {
//   try {
//     const agentId = req.params.agentId;

//     const tasks = await Task.find({ assignedTo: agentId });

//     const summary = {
//       agentId,
//       total: tasks.length,
//       completed: 0,
//       pending: 0,
//       in_progress: 0,
//       cancelled: 0,
//     };

//     tasks.forEach((task) => {
//       switch (task.status) {
//         case "completed":
//           summary.completed++;
//           break;
//         case "pending":
//           summary.pending++;
//           break;
//         case "in_progress":
//           summary.in_progress++;
//           break;
//         case "cancelled":
//           summary.cancelled++;
//           break;
//       }
//     });

//     res.json(summary);
//   } catch (error) {
//     console.error("[getAgentReport]", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getAgentReport = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const pipeline = [
      {
        $match: {
          assignedTo: new mongoose.Types.ObjectId(agentId),
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          in_progress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ];

    const results = await Task.aggregate(pipeline);

    // Ensure all 12 months are included
    const fullReport = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = results.find((r) => r._id === month);

      return {
        month, // number 1-12
        total: found?.total || 0,
        completed: found?.completed || 0,
        pending: found?.pending || 0,
        in_progress: found?.in_progress || 0,
        cancelled: found?.cancelled || 0,
      };
    });

    res.json({
      agentId,
      report: fullReport,
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

// Get summary for all agents with task counts by status
exports.getAgentTaskSummary = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("name _id");

    const summaries = await Promise.all(
      agents.map(async (agent) => {
        const tasks = await Task.find({ assignedTo: agent._id });

        const counts = {
          completed: 0,
          pending: 0,
          inProgress: 0,
          cancelled: 0,
        };

        tasks.forEach((task) => {
          const status = task.status;
          if (status === "completed") counts.completed++;
          else if (status === "pending") counts.pending++;
          else if (status === "in-progress") counts.inProgress++;
          else if (status === "cancelled") counts.cancelled++;
        });

        return {
          agentId: agent._id,
          name: agent.name,
          ...counts,
          total: tasks.length,
        };
      })
    );

    res.json(summaries);
  } catch (error) {
    console.error("[getAgentTaskSummary] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get summary for currently logged-in agent
exports.getMyReport = async (req, res) => {
  try {
    const agentId = req.user._id; // Assumes auth middleware adds user to req
    const tasks = await Task.find({ assignedTo: agentId });

    const summary = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      cancelled: 0,
    };

    tasks.forEach((task) => {
      switch (task.status) {
        case "completed":
          summary.completed++;
          break;
        case "pending":
          summary.pending++;
          break;
        case "in_progress":
          summary.inProgress++;
          break;
        case "cancelled":
          summary.cancelled++;
          break;
        default:
          break;
      }
    });

    res.json(summary);
  } catch (error) {
    console.error("[getMyReport]", error);
    res.status(500).json({ message: "Server error" });
  }
};
