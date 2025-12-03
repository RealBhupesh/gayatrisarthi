const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // Ensures each user can only have one rank entry
    },
    rankId: {
      type: String,
      required: true,
      unique: true, // Ensures unique rank identifier
    },
    username: {
      type: String,
      // required: true,
      trim: true, // Removes extra whitespace
    },
    fullName: {
      type: String,
      required: true,
      trim: true, // Removes extra whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures email is unique
      match: [/.+@.+\..+/, "Please enter a valid email address"], // Email validation
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // Ensures phone number is unique
      match: [/^\d{10}$/, "Phone number must be a 10-digit number"], // Basic phone number validation
    },
    score: {
      type: Number,
      required: true,
      default: 0, // Initial value
      min: [0, "Score cannot be less than 0"], // Validation to prevent negative scores
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

const Rank = mongoose.model("Rank", rankSchema);
module.exports = Rank;
