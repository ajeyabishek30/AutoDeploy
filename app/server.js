
const express = require("express");

const app = express();
const PORT = 3000;

// Allow Express to read JSON request bodies
app.use(express.json());

// Temporary storage
let tasks = [];
let nextId = 1;

// Home endpoint
app.get("/", (req, res) => {
  res.send("Welcome to AutoDeploy Version 2!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AutoDeploy API is running"
  });
});

// GET: Retrieve all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET: Retrieve one task
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find(
    t => t.id === Number(req.params.id)
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  res.json(task);
});

// POST: Create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "A non-empty title is required"
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false
  };

  tasks.push(task);

  res.status(201).json(task);
});

// PUT: Update an existing task
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find(
    t => t.id === Number(req.params.id)
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const { title, completed } = req.body || {};

  if (typeof title !== "string" || !title.trim() ||
      typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Valid title and completed fields are required"
    });
  }

  task.title = title.trim();
  task.completed = completed;

  res.json(task);
});

// DELETE: Remove a task
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex(
    t => t.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  tasks.splice(index, 1);

  res.status(204).send();
});

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AutoDeploy server running on port ${PORT}`);
  });
}

module.exports = app;