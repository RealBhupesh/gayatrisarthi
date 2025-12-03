const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const passport = require("passport");
const userRouter = require("./routes/UserRouter");
const scoreRouter = require("./routes/ScoreRouter");
const quizRouter = require("./routes/QuizRouter.js");
const attemptHistory = require("./routes/historyRouter");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
    origin: ["http://localhost:5173", "https://www.vidhyasarthi.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Google Generative AI Setup
const apiKey = process.env.GEMINI_API;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

app.use("/api/userProfile", userRouter);
app.use("/api/userscore", scoreRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/history", attemptHistory);

app.get("/", async (req, res) => {
  res.send("hello world");
});

const quizPrompt = `Generate 10 questions in JSON format mentioned below related to topic mentioned below. Do not return anything else. Keep the answers short.
JSON format:
{
  "questions": [
    {
      "id": 1,
      "prompt": "What is the purpose of the let keyword in JavaScript?",
      "answers": [
        { "text": "Declare a variable with block scope", "correct": true },
        { "text": "Declare a global variable", "correct": false },
        { "text": "Define a function", "correct": false }
      ],
      "hint": "Its used at the start of a program"
    },
    // ... more questions
  ]
}
Topic:
{{topic}}
`;

// Protected Quiz Generation Route with Retry Logic
app.post("/gen_quiz", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required." });
  }

  const finalPrompt = quizPrompt.replace("{{topic}}", topic);
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const result = await model.generateContent(finalPrompt);
      let quiz = result.response.text();
      // Fix the JSON parsing error
      quiz = quiz
        .trim()
        .replace(/```json/g, "")
        .replace(/```/g, "");

      try {
        const quizJSON = JSON.parse(quiz);
        return res.json(quizJSON); // Return the parsed JSON object
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return res.status(500).json({ error: "Failed to parse quiz JSON" });
      }
    } catch (error) {
      if (error.status === 429) {
        // Rate limit exceeded
        console.error("Rate limit exceeded, retrying in 1 minute...");
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute
        attempts++;
      } else {
        console.error("Error generating quiz:", error);
        return res.status(500).json({ error: "Error generating quiz" });
      }
    }
  }

  res.status(500).json({ error: "Maximum retries reached" });
});

// Generate Exams for a Stream
// Utility function to handle retries and clean response
async function generateContentWithRetries(prompt, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      const result = await model.generateContent(prompt);
      let responseText = await result.response.text();

      // Clean up the response text and parse as JSON
      responseText = responseText
        .trim()
        .replace(/```json/g, "")
        .replace(/```/g, "");

      try {
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse; // Return the parsed JSON
      } catch (parseError) {
        console.error(
          "Error parsing JSON response:",
          parseError.message,
          responseText
        );
        throw new Error("Invalid JSON format received from the API.");
      }
    } catch (error) {
      if (error.status === 429) {
        console.error(
          `Rate limit exceeded on attempt ${attempts + 1}, retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute before retrying
      } else {
        console.error(`Error on attempt ${attempts + 1}: ${error.message}`);
        throw new Error(error.message);
      }
      attempts++;
      console.log(`Retrying... (${attempts}/${retries})`);
    }
  }
  throw new Error("Maximum retries reached without successful response.");
}

// Generate Exams
app.post("/generate-exams", async (req, res) => {
  const { stream } = req.body;
  if (!stream) return res.status(400).json({ error: "Stream is required." });

  const finalPrompt = `Provide a JSON array of popular exams for the stream "${stream}". Each element should be a string representing an exam name.Include "10th boards" and "12th boards" as well.`;
  try {
    const examsArray = await generateContentWithRetries(finalPrompt);
    return res.json({ exams: examsArray });
  } catch (error) {
    console.error("Error generating exams:", error.message);
    return res.status(500).json({ error: "Error generating exams" });
  }
});

// Generate Subjects for an Exam
app.post("/generate-subjects", async (req, res) => {
  const { exam } = req.body;
  if (!exam) return res.status(400).json({ error: "Exam is required." });

  const finalPrompt = `Provide a JSON array of subjects for the exam "${exam}". Each element should be a string representing a subject name.`;
  try {
    const subjectsArray = await generateContentWithRetries(finalPrompt);
    return res.json({ subjects: subjectsArray });
  } catch (error) {
    console.error("Error generating subjects:", error.message);
    return res.status(500).json({ error: "Error generating subjects" });
  }
});

// Generate Quiz for a Subject and Difficulty
app.post("/generate-quiz", async (req, res) => {
  const { subject, difficulty } = req.body;
  if (!subject || !difficulty) {
    return res
      .status(400)
      .json({ error: "Subject and difficulty are required." });
  }

  // Updated final prompt to match the schema structure
  const finalPrompt = `Create a JSON array of 20 multiple-choice questions for the subject "${subject}" with a difficulty level of "${difficulty}". Each question should include:
    - A unique "id" (integer) for the question.
    - A "prompt" string for the question text.
    - An "answers" array of 4 objects, where each object has:
      - "text" (the answer text).
      - "correct" (a boolean indicating if the answer is correct).
    - A "hint" string (optional, can be empty).

  Ensure the JSON array is properly formatted and valid. Example format for one question:
  {
    "id": 1,
    "prompt": "What is 2 + 2?",
    "answers": [
      { "text": "2", "correct": false },
      { "text": "3", "correct": false },
      { "text": "4", "correct": true },
      { "text": "5", "correct": false }
    ],
    "hint": "Think about the basic addition operation."
  }`;

  try {
    // Generate the quiz questions
    const questionsArray = await generateContentWithRetries(finalPrompt);

    // Log to verify the generated content
    console.log(questionsArray);

    if (
      !Array.isArray(questionsArray) ||
      questionsArray.some(
        (q) =>
          !q.id ||
          !q.prompt ||
          !Array.isArray(q.answers) ||
          q.answers.length !== 4
      )
    ) {
      console.error("Invalid quiz question format:", questionsArray);
      return res
        .status(500)
        .json({ error: "Invalid format for quiz questions." });
    }

    // Map the questions to match the schema structure
    const formattedQuestions = questionsArray.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      answers: question.answers.map((answer) => ({
        text: answer.text,
        correct: answer.correct,
      })),
      hint: question.hint || "", // Optional, set to empty string if no hint is provided
    }));

    // Create a new quiz document
    const newQuiz = new Quiz({
      userId: req.user.id, // Assuming `req.user.id` contains the authenticated user's ID
      topic: subject,
      questions: formattedQuestions, // Storing the formatted questions
    });

    // Save the quiz to the database
    await newQuiz.save();

    return res.status(201).json({
      message: "Quiz generated and saved successfully.",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    return res.status(500).json({ error: "Error generating quiz" });
  }
});
app.get("/quizzes", async (req, res) => {
  try {
    // Remove the userId filter to get all quizzes
    const quizzes = await Quiz.find({});
    //console.log("Found quizzes:", quizzes);

    if (!quizzes || quizzes.length === 0) {
      //console.log("No quizzes found");
      return res.json([]);
    }

    const validatedQuizzes = quizzes.map((quiz) => ({
      _id: quiz._id.toString(),
      userId: quiz.userId,
      topic: quiz.topic,
      questions: quiz.questions,
      createdAt: quiz.createdAt,
    }));

    console.log("Sending validated quizzes:", validatedQuizzes);
    return res.json(validatedQuizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    return res.status(500).json({ error: "Error fetching quizzes" });
  }
});
app.post("/create-quiz", async (req, res) => {
  try {
    const { topic, questions } = req.body;

    // Validate input
    if (
      !topic ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({ error: "Invalid quiz data" });
    }

    // Validate each question
    const isValid = questions.every((question) => {
      if (!question.prompt) return false;
      if (!Array.isArray(question.answers) || question.answers.length !== 4)
        return false;
      if (!question.answers.some((answer) => answer.correct)) return false;
      if (!question.answers.every((answer) => answer.text)) return false;
      return true;
    });

    if (!isValid) {
      return res.status(400).json({ error: "Invalid question format" });
    }

    // Create new quiz
    const newQuiz = new Quiz({
      userId: req.user.id,
      topic,
      questions: questions.map((q, index) => ({
        id: index + 1,
        prompt: q.prompt,
        answers: q.answers,
        hint: q.hint || "",
      })),
    });

    // Save to database
    await newQuiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Failed to create quiz" });
  }
});
//login     take email from oauth --> check for in db --> get the userid --> jwt with userId --> return as cookie ot token, localstorage or cookie tabs
//register  user-details and onboarding data --> userId with uuid --> jwt with userId and return as cookie or token -->localstorage or cookie tabs
//

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
