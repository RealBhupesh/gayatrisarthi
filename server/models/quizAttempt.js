const mongoose = require("mongoose");

const quizHistorySchema = new mongoose.Schema(
  {
    attemptId: {
      type: String,
      required: true,
      unique: true, // Ensures each attempt has a unique identifier
    },
    userId: {
      type: String,
      required: true, // Reference to the user who attempted the quiz
    },
    quizId: {
      type: String,
      required: true, // Reference to the quiz being attempted
    },
    timeTaken: {
      type: Number, // Time taken to complete the quiz (in seconds or minutes)
      required: true,
    },
    score: {
      type: Number, // Score obtained in the quiz
      required: true,
    },
    subject: {
      type: String, // Subject of the quiz (e.g., Math, Physics)
      required: true,
    },
    numberOfQues: {
      type: Number, // Number of questions in the quiz
      required: true,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

const QuizHistory = mongoose.model("QuizHistory", quizHistorySchema);

module.exports = QuizHistory;
