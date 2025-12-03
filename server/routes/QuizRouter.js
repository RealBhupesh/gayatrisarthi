const express = require("express");
const quizRouter = express.Router();
const { verifyToken } = require("../middlewares/authorize");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require("uuid");
const Quiz = require("../models/QuizSchema");
require("dotenv").config();

// Initialize Generative AI
const setupGenerativeAI = () => {
  const apiKey = process.env.GEMINI_API;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};
const model = setupGenerativeAI();

// Prompt for Generative AI
const quizPromptTemplate = `You are tasked to generate a JSON object for a quiz tailored for students preparing for "{prepExam}". The quiz should include {noOfQuestions} multiple-choice questions related to the subject "{subject}". The quiz schema should follow this structure:
{
  "quizTitle": "A descriptive title for the quiz",
  "subject": "{subject}", // The subject of the quiz
  "questionsData": {
    "numberOfQues": {noOfQuestions}, // Total number of questions in the quiz
    "questions": [
      {
        "qno": 1, // Question number
        "ques": "Question text here", // 
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Array of 4 options
        "correct": "Option 1", // The correct answer (match with one of the options)
        "hint": "Hint for solving the problem"
      },
    ]
  }
}

Please ensure:
1. Each question has exactly 4 options, and one is marked as the correct answer.
2. The quiz title is descriptive and appropriate for the subject and exam level.
3. The hints are concise and helpful to students.

Make the questions challenging and suitable for students preparing for "{prepExam}" in the subject "{subject}". Return the result in the JSON format shown above.`;

// Generate content with retries
const generateContentWithRetries = async (prompt, retries = 3) => {
  let attempts = 0;
  while (attempts < retries) {
    try {
      const result = await model.generateContent(prompt);
      let responseText = await result.response.text();

      // Clean response text and parse it as JSON
      responseText = responseText
        .trim()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\\n/g, " ") // Remove newlines that might break JSON parsing
        .replace(/\\/g, "\\\\");

      const parsedResponse = JSON.parse(responseText);
      return parsedResponse;
    } catch (error) {
      if (error.status === 429) {
        console.error("Rate limit exceeded, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
      } else {
        console.error("Error generating content:", error.message);
        throw new Error("Failed to generate content");
      }
    }
    attempts++;
  }
  throw new Error("Maximum retries reached");
};

// Apply verifyToken middleware to all routes
// quizRouter.use(verifyToken);

// POST: Generate Quiz
quizRouter.post("/generate", verifyToken, async (req, res) => {
  const { prepExam, subject, noOfQuestions } = req.body;

  if (!prepExam || !subject || !noOfQuestions) {
    return res.status(400).json({
      success: false,
      message:
        "prepExam, number of questions and subject are required to generate a quiz.",
    });
  }

  const finalPrompt = quizPromptTemplate
    .replaceAll("{prepExam}", prepExam)
    .replaceAll("{subject}", subject)
    .replaceAll("{noOfQuestions}", noOfQuestions);

  try {
    const generatedQuiz = await generateContentWithRetries(finalPrompt);

    // Validate the quiz format
    if (
      !generatedQuiz.quizTitle ||
      !generatedQuiz.subject ||
      !Array.isArray(generatedQuiz.questionsData?.questions) ||
      generatedQuiz.questionsData.questions.some(
        (q) =>
          !q.ques ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          !q.correct
      )
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid format received for quiz.",
      });
    }

    // Attach metadata
    const quiz = {
      quizId: uuidv4(),
      quizTitle: generatedQuiz.quizTitle,
      subject: generatedQuiz.subject,
      questionsData: {
        ...generatedQuiz.questionsData,
        numberOfQues: generatedQuiz.questionsData.questions.length,
      },
      createdBy: req.user.userId || "unknown", // Assuming req.user.id is populated after token verification
    };

    // Respond with the generated quiz
    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error generating quiz",
    });
  }
});

// Predefined data
const examSubjectMap = {
  JEE: ["Mathematics", "Physics", "Chemistry"],
  NEET: ["Physics", "Chemistry", "Biology"],
  CAT: [
    "Management",
    "Financial Management",
    "Marketing Management",
    "Business Economics",
  ],
  UPSC: ["Management", "Business Economics", "Accounting"],
  GATE: ["Mathematics", "Physics", "Chemistry"],
  GRE: ["Mathematics", "Management", "Business Economics"],
  "MHTCET(PCM)": ["Mathematics", "Physics", "Chemistry"],
  "MHTCET(PCB)": ["Physics", "Chemistry", "Biology"],
  "MAH-B-BCA-BBA-BMS-BBM-CET": [
    "Reasoning (Verbal and Arithmetic)",
    "English language",
    "Computer basics",
    "General Knowledge and awareness",
  ],
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

quizRouter.get("/all", async (req, res) => {
  try {
    // Fetch all quizzes with complete data
    const quizzes = await Quiz.find();

    const organizedQuizzes = {};

    // Initialize structure for each exam and its subjects
    Object.keys(examSubjectMap).forEach((exam) => {
      organizedQuizzes[exam] = {};
      examSubjectMap[exam].forEach((subject) => {
        organizedQuizzes[exam][subject] = [];
      });
    });

    // Process each quiz
    quizzes.forEach((quiz) => {
      Object.keys(examSubjectMap).forEach((exam) => {
        if (quiz.forStreams.includes(exam)) {
          examSubjectMap[exam].forEach((subject) => {
            const subjectMatch = quiz.subject === subject;
            const titleMatch = new RegExp(escapeRegExp(subject), "i").test(
              quiz.quizTitle
            );

            if (subjectMatch || titleMatch) {
              organizedQuizzes[exam][subject].push(quiz);
            }
          });
        }
      });
    });

    // Format response
    const responseData = Object.keys(organizedQuizzes)
      .map((exam) => ({
        exam,
        subjects: Object.keys(organizedQuizzes[exam])
          .filter((subject) => organizedQuizzes[exam][subject].length > 0)
          .map((subject) => ({
            subject,
            quizzes: organizedQuizzes[exam][subject],
          })),
      }))
      .filter((exam) => exam.subjects.length > 0);

    return res.status(200).json({
      success: true,
      message: "Quizzes organized successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching organized quizzes:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching quizzes",
    });
  }
});

// GET: Fetch quizzes sorted by most recent (createdAt) with pagination
quizRouter.get("/quizzes", async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  // Ensure page and limit are numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be valid numbers",
    });
  }

  try {
    // Fetch quizzes with pagination and sorted by creation date in descending order
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Get the total number of quizzes
    const totalQuizzes = await Quiz.countDocuments();
    const totalPages = Math.ceil(totalQuizzes / limitNum);
    const hasNextPage = pageNum < totalPages;

    return res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      data: {
        quizzes,
        totalPages,
        currentPage: pageNum,
        totalQuizzes,
        hasNextPage, // Indicates if there are more pages to fetch
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching quizzes",
    });
  }
});

// POST: Create Quiz
quizRouter.post("/create", verifyToken, async (req, res) => {
  const {
    quizTitle,
    tags,
    totalTime,
    subject,
    forStreams,
    questionsData,
    quizDescription,
  } = req.body;

  // Validate required fields
  if (
    !quizTitle ||
    !quizDescription ||
    !Array.isArray(tags) ||
    tags.length === 0 ||
    !totalTime ||
    !subject ||
    !Array.isArray(forStreams) ||
    forStreams.length === 0 ||
    !questionsData ||
    !Array.isArray(questionsData.questions) ||
    questionsData.questions.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: quizTitle, tags, totalTime, subject, forStreams, or questionsData.",
    });
  }

  try {
    // Generate a unique quizId using uuid
    const quizId = uuidv4();

    // Create a new quiz instance
    const newQuiz = new Quiz({
      quizId,
      quizTitle,
      tags,
      totalTime,
      subject,
      forStreams,
      quizDescription,
      questionsData: {
        numberOfQues: questionsData.questions.length,
        questions: questionsData.questions,
      },
      createdBy: req.user.userId || "unknown", // Assuming req.user.id is populated after token verification
    });

    // Save the quiz to the database
    await newQuiz.save();

    // Respond with success
    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    console.log("Error creating quiz:", error.message);

    // Check for duplicate quizTitle
    if (error.code === 11000 && error.keyPattern?.quizTitle) {
      return res.status(409).json({
        success: false,
        message: "Quiz title already exists. Please choose a different title.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating quiz",
    });
  }
});

// DELETE: Delete Quiz
quizRouter.delete("/:quizId", verifyToken, async (req, res) => {
  const { quizId } = req.params;

  try {
    // Find the quiz by quizId
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if the current user is the owner of the quiz
    if (quiz.createdBy !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this quiz",
      });
    }

    // Delete the quiz
    await Quiz.deleteOne({ quizId });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error deleting quiz",
    });
  }
});

// PUT: Update Quiz QuestionsData
quizRouter.put("/:quizId", verifyToken, async (req, res) => {
  const { quizId } = req.params;
  const {
    questionsData,
    title,
    timeInMinutes,
    subject,
    selectedStreams,
    quizDescription,
  } = req.body;

  // Validate input
  if (!title || typeof title !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing title",
    });
  }

  if (
    !timeInMinutes ||
    typeof timeInMinutes !== "number" ||
    timeInMinutes <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing timeInMinutes",
    });
  }

  if (!subject || typeof subject !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing subject",
    });
  }

  if (
    !selectedStreams ||
    !Array.isArray(selectedStreams) ||
    selectedStreams.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing selectedStreams",
    });
  }

  if (questionsData && !Array.isArray(questionsData.questions)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing questionsData list",
    });
  }

  if (!quizDescription) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing quiz description",
    });
  }

  try {
    // Build the update object
    const updateData = {
      quizDescription,
      quizTitle: title,
      totalTime: timeInMinutes,
      subject,
      forStreams: selectedStreams,
      tags: [...selectedStreams, subject],
    };

    // Initialize questionsData if provided
    if (questionsData && questionsData.questions.length !== 0) {
      updateData.questionsData = {
        questions: questionsData.questions,
        numberOfQues: questionsData.questions.length,
      };
    }

    // Find and update the quiz
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { quizId },
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document and validate
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating quiz",
    });
  }
});

// GET: Search Quizzes by title or subject
quizRouter.get("/search", async (req, res) => {
  const { query, stream } = req.query;
  const { page = 1, limit = 12 } = req.query;

  // Ensure page and limit are numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Validate query parameter
  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  // Validate stream parameter is present
  if (!stream) {
    return res.status(400).json({
      success: false,
      message: "Stream parameter is required",
    });
  }

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be valid numbers",
    });
  }

  try {
    let searchCriteria = {
      $and: [
        {
          $or: [
            { quizTitle: { $regex: query, $options: "i" } },
            { subject: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
            { quizDescription: { $regex: query, $options: "i" } },
          ],
        },
      ],
    };

    // If stream is not "All", add stream filter to search in forStreams array
    if (stream !== "All") {
      searchCriteria.$and.push({ forStreams: stream });
    }

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalQuizzes / limitNum);
    const hasNextPage = pageNum < totalPages;

    // Fetch quizzes with pagination
    const quizzes = await Quiz.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quizzes found matching your search criteria",
        data: {
          quizzes: [],
          totalPages,
          currentPage: pageNum,
          totalQuizzes,
          hasNextPage,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quizzes found successfully",
      data: {
        quizzes,
        totalPages,
        currentPage: pageNum,
        totalQuizzes,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error("Error searching quizzes:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error searching quizzes",
    });
  }
});

// GET: Filter Quizzes by Stream
quizRouter.get("/filter/stream", async (req, res) => {
  const { stream } = req.query;
  const { page = 1, limit = 12 } = req.query;

  // Ensure page and limit are numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Validate stream parameter
  if (!stream) {
    return res.status(400).json({
      success: false,
      message: "Stream parameter is required",
    });
  }

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be valid numbers",
    });
  }

  try {
    let query = {};

    // If stream is not "All", add stream filter to match in forStreams array
    if (stream !== "All") {
      query = {
        forStreams: stream, // Exact match for array element
      };
    }

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(query);
    const totalPages = Math.ceil(totalQuizzes / limitNum);
    const hasNextPage = pageNum < totalPages;

    // Fetch quizzes with pagination
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quizzes found for the specified stream",
        data: {
          quizzes: [],
          totalPages,
          currentPage: pageNum,
          totalQuizzes,
          hasNextPage,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quizzes filtered by stream successfully",
      data: {
        quizzes,
        totalPages,
        currentPage: pageNum,
        totalQuizzes,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error("Error filtering quizzes by stream:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error filtering quizzes by stream",
    });
  }
});

module.exports = quizRouter;
