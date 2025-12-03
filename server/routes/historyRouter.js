const express = require("express");
const attemptHistory = express.Router();
const { verifyToken } = require("../middlewares/authorize");
const { v4: uuidv4 } = require("uuid");
const QuizHistory = require("../models/quizAttempt");

// POST: Record quiz attempt
attemptHistory.post("/attempt", verifyToken, async (req, res) => {
  const { quizId, timeTaken } = req.body;

  // Validate required fields
  if (!quizId || typeof timeTaken !== "number") {
    return res.status(400).json({
      success: false,
      message:
        "quizId and timeTaken are required and timeTaken must be a number",
    });
  }

  try {
    // Create a new quiz attempt history
    const attempt = new QuizHistory({
      attemptId: uuidv4(), // Generate a unique attemptId
      userId: req.user.userId, // From the verified token
      quizId: quizId,
      timeTaken: timeTaken,
    });

    // Save the quiz attempt to the database
    await attempt.save();

    return res.status(201).json({
      success: true,
      message: "Quiz attempt recorded successfully",
      data: attempt,
    });
  } catch (error) {
    console.error("Error recording quiz attempt:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while recording quiz attempt",
    });
  }
});

// GET: Fetch quiz history for the authenticated user
attemptHistory.get("/attempts", verifyToken, async (req, res) => {
  const userId = req.user.userId; // Get userId from the verified token
  try {
    const attempts = await QuizHistory.find({ userId: userId });

    // Respond with the quiz history data
    return res.status(200).json({
      success: true,
      message: "Quiz attempts fetched successfully",
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching quiz history:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Server error while fetching quiz history",
    });
  }
});

attemptHistory.get("/quiz-rank/:quizId", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { quizId } = req.params;

  try {
    // Get the best attempt (highest score) for each user for this quiz
    const allUsersBestAttempts = await QuizHistory.aggregate([
      // Match documents for the specific quiz
      { $match: { quizId: quizId } },

      // Group by userId and get the best attempt (highest score only)
      {
        $group: {
          _id: "$userId",
          bestScore: { $max: "$score" },
          attempts: { $sum: 1 },
          lastAttemptDate: { $max: "$createdAt" },
        },
      },

      // Sort by score (descending - higher is better)
      { $sort: { bestScore: -1 } },
    ]);

    // If no attempts found for this quiz
    if (allUsersBestAttempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attempts found for this quiz",
        data: null,
      });
    }

    // Get user's attempt details
    const userAttempt = allUsersBestAttempts.find(
      (attempt) => attempt._id === userId
    );

    // If user hasn't attempted this quiz
    if (!userAttempt) {
      return res.status(200).json({
        success: true,
        message: "User hasn't attempted this quiz yet",
        data: {
          rank: null,
          totalParticipants: allUsersBestAttempts.length,
          percentile: null,
          bestScore: null,
          attempts: 0,
          lastAttemptDate: null,
          betterThanCount: null,
          worseThanCount: null,
          sameScoreCount: null,
        },
      });
    }

    const totalParticipants = allUsersBestAttempts.length;

    // Count people with better and worse scores
    const betterThanCount = allUsersBestAttempts.filter(
      (attempt) => attempt.bestScore > userAttempt.bestScore
    ).length;

    const worseThanCount = allUsersBestAttempts.filter(
      (attempt) => attempt.bestScore < userAttempt.bestScore
    ).length;

    // Calculate rank (people with same scores get same rank)
    const sameScoreCount = allUsersBestAttempts.filter(
      (attempt) => attempt.bestScore === userAttempt.bestScore
    ).length;

    const rank = betterThanCount + 1;

    // Calculate percentile
    let percentile;

    if (totalParticipants === 1) {
      // If only one participant, they get 100 percentile
      percentile = 100;
    } else if (betterThanCount === 0) {
      // If no one scored better (includes ties at top score)
      percentile = 100;
    } else {
      // Calculate how many people they scored better than
      const scoredBetterThan = worseThanCount;
      // Divide by (total participants - 1) to exclude themselves
      percentile = (scoredBetterThan / (totalParticipants - 1)) * 100;
    }

    return res.status(200).json({
      success: true,
      message: "Rank fetched successfully",
      data: {
        rank,
        totalParticipants,
        percentile: Math.round(percentile * 100) / 100, // Round to 2 decimal places
        bestScore: userAttempt.bestScore,
        attempts: userAttempt.attempts,
        lastAttemptDate: userAttempt.lastAttemptDate,
        betterThanCount,
        worseThanCount,
        sameScoreCount,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz rank:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz rank",
      error: error.message,
    });
  }
});

module.exports = attemptHistory;
