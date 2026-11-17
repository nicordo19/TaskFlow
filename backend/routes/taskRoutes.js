const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();

    res.status(200).json({ items: tasks });
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

router.post("/", async (req, res) => {
  try {
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

    const task = await Task.create({
      title: req.body.title,
      status: req.body.status,
      description: req.body.description,
      dueDate: req.body.dueDate,
    });

    res.status(201).json({
      message: "Données reçues",
      task: task,
    });
    console.log(task);
  } catch (error) {
    console.error("Erreur lors de la création de la tâche :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    // Modifier le titre uniquement s'il est envoyé
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || req.body.title.trim() === "") {
        return res.status(400).json({
          error: "Le titre est obligatoire",
        });
      }

      if (req.body.title.trim().length > 120) {
        return res.status(400).json({
          error: "Le titre ne doit pas dépasser 120 caractères",
        });
      }

      task.title = req.body.title.trim();
    }

    // Modifier le statut uniquement s'il est envoyé
    if (req.body.status !== undefined) {
      if (!["todo", "doing", "done"].includes(req.body.status)) {
        return res.status(400).json({
          error: "Le statut doit être todo, doing ou done",
        });
      }

      task.status = req.body.status;
    }

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur lors de la modification de la tâche :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

module.exports = router;
