const mongoose = require("mongoose");

// Define the schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create the model
const User = mongoose.model("User", userSchema);

// Export the model
module.exports = User;
