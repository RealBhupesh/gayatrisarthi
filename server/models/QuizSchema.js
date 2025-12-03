const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true, // Ensures each quiz has a unique identifier
    },
    quizTitle: {
      type: String,
      required: true,
      unique: true, // Ensures each quiz has a unique identifier
    },
    quizDescription: {
      type: String,
      required: true,
    },
    tags: {
      type: [String], // Array of tags (e.g., "math", "science")
      required: true,
    },
    totalTime: {
      type: Number, // Total time for the quiz in minutes or seconds
      required: true,
    },
    subject: {
      type: String, // The subject of the quiz (e.g., Math, Physics)
      required: true,
    },
    forStreams: {
      type: [String], // Array of streams this quiz is intended for (e.g., "Science", "Commerce")
      required: true,
    },
    questionsData: {
      numberOfQues: {
        type: Number, // Number of questions in the quiz
        required: true,
      },
      questions: [
        {
          qno: {
            type: Number, // Question number (serial)
            required: true,
          },
          ques: {
            type: String, // The question text
            required: true,
          },
          options: {
            type: [String], // Array of options for the question
            required: true,
          },
          correct: {
            type: String, // Correct answer (can store the actual answer text or index)
            required: true,
          },
          hint: {
            type: String, // Correct answer (can store the actual answer text or index)
          },
        },
      ],
    },
    createdBy: {
      type: String, // User ID or teacher ID who created the quiz
      required: true,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
