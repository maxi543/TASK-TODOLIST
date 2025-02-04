const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Todo = require("./models/todo-schema");

router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/todo-add", (req, res) => {
  if (req.session.user) {
    res.render("todo-add");
  } else {
    res.status(403).send("You must log in.");
  }
});
router.get("/todo", async (req, res) => {
  if (req.session.user) {
    try {
      const data = await Todo.find({ userId: req.session.user.id });
      res.render("todo", { tasks: data, user: req.session.user });
    } catch (err) {
      console.error("Error fetching todos:", err);
      res.status(500).send("Internal server error");
    }
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("could not log out");
    }
    res.clearCookie("user");
    return res.redirect("/register");
  });
});
router.post("/api/register", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Checking for existing user...");

    const existingUser = await User.findOne({ email: req.body.email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.log("Hashing password...");
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    console.log("Saving new user...");
    await newUser.save();
    console.log("Registration success");
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      console.log("Login failed: Invalid credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = { id: user._id, username: user.username };
    console.log("Login successful. Session:", req.session);  // Log the session object
    console.log("Redirecting to /todo");
    return res.redirect("/todo");
  } catch (error) {
    console.error("error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/todo", async (req, res) => {
  console.log("GET /todo route hit. Session:", req.session); // Log the session
  if (req.session.user) {
    try {
      const data = await Todo.find({ userId: req.session.user.id });
      res.render("todo", { tasks: data, user: req.session.user });
    } catch (err) {
      console.error("Error fetching todos:", err);
      res.status(500).send("Internal server error");
    }
  } else {
    console.log("User not authenticated, redirecting to /login");
    res.redirect("/login");
  }
});

// Simplified route to add a new to-do

router.post("/todo-add", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const { title, description, date } = req.body;

    if (!description || !date) {
      return res.status(400).send("Description and date are required");
    }

    const newTodo = new Todo({
      title,
      description,
      date,
      userId: req.session.user.id,
    });

    await newTodo.save();
    res.redirect("/todo");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving todo item");
  }
});
router.get("/edit/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log("Task ID from URL:", taskId);

    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid Task ID format");
      return res.status(400).send("Invalid Task ID format");
    }
    const task = await Todo.findById(taskId);
    console.log("Task found:", task);

    if (!task) {
      console.log("Task not found in the database");
      return res.status(404).send("Task not found");
    }

    res.render("edit", { task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send("Server Error");
  }
});
router.put("/edit/:id", async (req, res) => {
  try {
    console.log("PUT /edit/:id route hit");
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);

    const taskId = req.params.id;

    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid Task ID format");
      return res.status(400).send("Invalid Task ID format");
    }
    const { title, description } = req.body;

    const updatedTask = await Todo.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedTask) {
      console.log("Task not found, sending 404");
      return res.status(404).send("Task not found");
    }
    console.log("Task updated successfully");

    res.status(200).send("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Server Error");
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    console.log("DELETE /delete/:id route hit");
    console.log("req.params:", req.params);
    const taskId = req.params.id;

    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid Task ID format");
      return res.status(400).send("Invalid Task ID format");
    }
    const deletedTask = await Todo.findByIdAndDelete(taskId);
    console.log("Deleted task:", deletedTask);

    if (!deletedTask) {
      console.log("Task not found for deletion");
      return res.status(404).send("Task not found for deletion");
    }
    console.log("Task deleted successfully");
    res.status(200).send("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
