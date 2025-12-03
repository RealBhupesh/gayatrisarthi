const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { verifyToken } = require("../middlewares/authorize");
const Users = require("../models/UserSchema"); // Path to your user model
const Score = require("../models/rankSchema");
const jwt = require("jsonwebtoken");
const userRouter = express.Router();

// Route to check if a user exists or to create a new user if not
userRouter.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Email is required",
    });
  }

  try {
    // Check if the user already exists by email
    let user = await Users.findOne({ email }).select("-password");

    if (user) {
      // User exists, generate JWT token
      const token = jwt.sign(
        { userId: user.userId, role: user.role }, // Payload
        process.env.JWT_SECRET, // Secret key from environment variables
        { expiresIn: "7d" } // Token expires in 7 days
      );

      return res.status(200).json({
        success: true,
        data: {
          user,
          token, // Send the JWT token
        },
        exists: true,
        message: "User exists",
      });
    } else {
      return res.status(200).json({
        success: true, // Indicates that a new user will need further onboarding
        data: null,
        exists: false,
        message: "New user, onboarding required",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Server error, please try again later",
    });
  }
});

// Register route
userRouter.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    phoneNumber,
    instituteName,
    city,
    state,
    instituteType,
    fullName,
    stream,
    prepExam,
    role,
  } = req.body;

  // Check if required fields are present
  if (
    !email ||
    !phoneNumber ||
    !instituteName ||
    !city ||
    !state ||
    !instituteType ||
    !fullName ||
    !stream ||
    !prepExam
  ) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "All fields are required",
    });
  }

  try {
    // Check if the user already exists by email or phone
    const existingUser = await Users.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message:
          existingUser.email === email
            ? "This email is already registered"
            : "This phone number is already registered",
        field: existingUser.email === email ? "email" : "phoneNumber",
      });
    }

    // Generate userId using UUID
    const userId = uuidv4();

    // Create a new user
    const newUser = new Users({
      userId,
      username,
      email,
      password,
      phoneNumber,
      instituteName,
      city,
      state,
      instituteType,
      fullName,
      stream,
      prepExam,
      role,
    });

    await newUser.save();

    delete newUser["password"];

    const rankId = uuidv4();

    try {
      const newRank = new Score({
        userId,
        rankId,
        username,
        fullName,
        email,
        phoneNumber,
        score: 0, // Default score
      });
      await newRank.save();
    } catch (rankError) {
      // If rank creation fails, delete the created user
      await Users.findOneAndDelete({ userId });

      if (rankError.code === 11000) {
        const duplicateField = Object.keys(rankError.keyPattern)[0];
        return res.status(400).json({
          success: false,
          data: null,
          message:
            duplicateField === "email"
              ? "This email is already registered in ranks"
              : "This phone number is already registered in ranks",
          field: duplicateField,
        });
      }

      throw rankError; // Re-throw other errors
    }

    const token = jwt.sign(
      { userId: newUser.userId, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("server error", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        data: null,
        message:
          duplicateField === "email"
            ? "This email is already registered"
            : "This phone number is already registered",
        field: duplicateField,
      });
    }

    // Handle other server errors
    res.status(500).json({
      success: false,
      data: null,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
});

// userRouter.post("/login", async (req, res) => {
//   const { email } = req.body;

//   // Check if email is provided
//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       data: null,
//       message: "Email is required",
//     });
//   }

//   try {
//     // Check if the user exists by email
//     const user = await Users.findOne({ email }).select("-password");
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "No user found with this email",
//       });
//     }

//     // Generate JWT token with userId and role, set expiration for 7 days
//     const token = jwt.sign(
//       { userId: user.userId, role: user.role }, // Payload
//       process.env.JWT_SECRET, // Secret key from environment variables
//       { expiresIn: "7d" } // Token expires in 7 days
//     );

//     // Send success response with token and user data
//     res.status(200).json({
//       success: true,
//       data: {
//         user,
//         token, // Send the JWT token
//       },
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       data: null,
//       message: "Server error, please try again later",
//     });
//   }
// });

userRouter.get("/profile", verifyToken, async (req, res) => {
  try {
    // Extract userId from the decoded token
    const userId = req.user.userId;

    // Find the user in the database using the userId
    const user = await Users.findOne({ userId }).select("-password");

    // If the user does not exist
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    // Return the user data in the desired format
    return res.status(200).json({
      success: true,
      data: user,
      message: "User data retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error, please try again later",
    });
  }
});

// Simple version - just updates role to admin
userRouter.put("/make-admin", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "Email is required",
    });
  }

  try {
    const updatedUser = await Users.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User role updated to admin successfully",
    });
  } catch (error) {
    console.error("Make admin error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error, please try again later",
    });
  }
});

// Get all users route
userRouter.get("/all", verifyToken, async (req, res) => {
  try {
    // Check if the requesting user is an admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     data: null,
    //     message: "Access denied. Admin only."
    //   });
    // }

    // Fetch all users with role 'user', excluding password field
    const users = await Users.find({ role: "user" }).select("-password");
    // const users = await Users.find().select("-password");
    return res.status(200).json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error, please try again later",
    });
  }
});

module.exports = userRouter;
