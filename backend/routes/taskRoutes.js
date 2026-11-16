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
  if (req.body.title.length > 120) {
    return res.status(400).json({
      error: "Le titre ne doit pas dépasser 120 caractères",
    });
  }

  if (!["todo", "doing", "done"].includes(req.body.status)) {
    return res.status(400).json({
      error: "Le statut doit être todo, doing ou done",
    });
  }

  if (
    req.body.description !== undefined &&
    (typeof req.body.description !== "string" ||
      req.body.description.length > 1000)
  ) {
    return res.status(400).json({
      error: "La description doit être un texte de 1000 caractères maximum",
    });
  }

  if (
    req.body.dueDate !== undefined &&
    req.body.dueDate !== null &&
    (typeof req.body.dueDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(req.body.dueDate))
  ) {
    return res.status(400).json({
      error: "La date doit être au format YYYY-MM-DD",
    });
  }

  if (req.body.dueDate != null) {
    const date = new Date(req.body.dueDate);
    const dateValide =
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === req.body.dueDate;

    if (!dateValide) {
      return res.status(400).json({
        error: "La date indiquée n'existe pas",
      });
    }
  }

  const task = {
    id: tasks.length + 1,
    title: req.body.title,
    status: req.body.status,
    description: req.body.description,
    dueDate: req.body.dueDate,
  };

  tasks.push(task);
  res.status(201).json({
    message: "Données reçues",
    task: task,
  });
  console.log(task);
});

module.exports = router;
