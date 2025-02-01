const mongoose = require("mongoose");

// Define the to-do schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Task title
  description: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Timestamp
});

// Create a model
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
