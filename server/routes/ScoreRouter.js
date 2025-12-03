const express = require("express");
const scoreRouter = express.Router();
const Score = require("../models/rankSchema");
const { verifyToken } = require("../middlewares/authorize");
const Users = require("../models/UserSchema");
const { v4: uuidv4 } = require("uuid");
const QuizHistory = require("../models/quizAttempt");

// Update score route and add history
scoreRouter.put("/update", verifyToken, async (req, res) => {
  const { updateBy, subject, questionData, quizId, timeTaken } = req.body;

  // Validate input
  if (typeof updateBy !== "number") {
    return res.status(400).json({
      success: false,
      message: "updateBy must be a number",
    });
  }

  try {
    let rankDoc = await Score.findOne({ userId: req.user.userId });
    if (!rankDoc) {
      const userData = await Users.findOne({ userId: req.user.userId });

      if (!userData) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Create a new rank document
      rankDoc = new Score({
        userId: req.user.userId,
        rankId: uuidv4(),
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        score: updateBy, // Initialize the score with updateBy value
      });

      await rankDoc.save();
    } else {
      rankDoc.score += updateBy;
      await rankDoc.save();
    }

    const attempt = new QuizHistory({
      attemptId: uuidv4(), // Generate a unique attemptId
      userId: req.user.userId, // From the verified token
      quizId: quizId,
      timeTaken: timeTaken,
      score: updateBy,
      subject,
      numberOfQues: questionData.numberOfQues,
    });

    // Save the quiz attempt to the database
    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      data: { ...rankDoc, ...attempt },
    });
  } catch (error) {
    console.error("Error updating score:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Server error while updating score",
    });
  }
});

// GET: Combined leaderboard route for both global and quiz-specific leaderboards
scoreRouter.get("/leaderboard/:quizId?", async (req, res) => {
  const { quizId } = req.params;
  const { page = 1, limit = 10, stream } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be valid numbers",
    });
  }

  try {
    // Handle quiz-specific leaderboard
    if (quizId) {
      let usersQuery = {};
      if (stream) {
        usersQuery.stream = stream;
      }
      
      const users = await Users.find(usersQuery).lean();
      const userIds = users.map(u => u.userId);

      const attempts = await QuizHistory.aggregate([
        { $match: { 
          quizId,
          userId: { $in: userIds }
        }},
        { $sort: { score: -1 } },
        {
          $group: {
            _id: "$userId",
            highestAttempt: { $first: "$$ROOT" },
          },
        },
        { $sort: { "highestAttempt.score": -1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]);

      const leaderboard = attempts.map(a => {
        const user = users.find(u => u.userId === a._id);
        return {
          ...a.highestAttempt,
          fullName: user ? user.fullName : null,
          stream: user ? user.stream : null,
        };
      });

      const totalRecords = await QuizHistory.distinct("userId", { 
        quizId,
        userId: { $in: userIds }
      }).then(arr => arr.length);

      const totalPages = Math.ceil(totalRecords / limitNum);

      return res.status(200).json({
        success: true,
        message: "Per quiz leaderboard fetched successfully",
        data: {
          leaderboard,
          totalPages,
          currentPage: pageNum,
          totalRecords,
        },
      });
    }
    
    // Handle global leaderboard
    else {
      let userIds = [];
      if (stream) {
        const users = await Users.find({ stream }).lean();
        userIds = users.map(u => u.userId);
      }

      const query = stream ? { userId: { $in: userIds } } : {};
      
      const leaderboard = await Score.find(query)
        .sort({ score: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      const users = await Users.find({ 
        userId: { $in: leaderboard.map(entry => entry.userId) }
      }).lean();

      const leaderboardWithStream = leaderboard.map(entry => {
        const user = users.find(user => user.userId === entry.userId);
        return {
          ...entry,
          stream: user ? user.stream : null,
        };
      });

      const totalRecords = await Score.countDocuments(query);
      const totalPages = Math.ceil(totalRecords / limitNum);

      return res.status(200).json({
        success: true,
        message: "Global leaderboard fetched successfully",
        data: {
          leaderboard: leaderboardWithStream,
          totalPages,
          currentPage: pageNum,
          totalRecords,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching leaderboard",
    });
  }
});

module.exports = scoreRouter;
