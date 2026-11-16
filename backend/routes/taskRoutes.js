const express = require("express");

const router = express.Router();

const tasks = [];

router.get("/", (req, res) => {
  res.status(200).json({ items: tasks });
});

router.post("/", (req, res) => {
  if (typeof req.body.title !== "string" || req.body.title.trim() === "") {
    return res.status(400).json({
      error: "Le titre est obligatoire",
    });
  }
  const task = {
    id: tasks.length + 1,
    title: req.body.title,
    status: req.body.status,
  };

  tasks.push(task);
  res.status(201).json({
    message: "Données reçues",
    task: task,
  });
  console.log(task);
});

module.exports = router;
