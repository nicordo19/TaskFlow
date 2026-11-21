const express = require("express");
const mongoose = require("mongoose");

const Task = require("../models/Task");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Toutes les routes nécessitent une connexion
router.use(requireAuth);

// Vérifier si un identifiant MongoDB est valide
const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};

// GET /api/tasks
// Récupérer uniquement les tâches de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Erreur récupération tâches :", error);

    res.status(500).json({
      error: "Impossible de récupérer les tâches",
    });
  }
});

// GET /api/tasks/:id
// Récupérer une tâche appartenant à l'utilisateur
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur récupération tâche :", error);

    res.status(500).json({
      error: "Impossible de récupérer la tâche",
    });
  }
});

// POST /api/tasks
// Créer une tâche pour l'utilisateur connecté
router.post("/", async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Le titre est obligatoire",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        error: "Description invalide",
      });
    }

    if (status !== undefined && !["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({
        error: "Statut invalide",
      });
    }

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      (typeof dueDate !== "string" ||
        !dueDate.trim() ||
        Number.isNaN(Date.parse(dueDate)))
    ) {
      return res.status(400).json({
        error: "Date invalide",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ?? "",
      status: status ?? "todo",
      dueDate: dueDate ?? null,
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Erreur création tâche :", error);

    res.status(500).json({
      error: "Impossible de créer la tâche",
    });
  }
});

// PATCH /api/tasks/:id
// Modifier uniquement une tâche appartenant à l'utilisateur
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const { title, description, status, dueDate } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          error: "Titre invalide",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          error: "Description invalide",
        });
      }

      updates.description = description;
    }

    if (status !== undefined) {
      if (!["todo", "doing", "done"].includes(status)) {
        return res.status(400).json({
          error: "Statut invalide",
        });
      }

      updates.status = status;
    }

    if (dueDate !== undefined) {
      if (
        dueDate !== null &&
        (typeof dueDate !== "string" ||
          !dueDate.trim() ||
          Number.isNaN(Date.parse(dueDate)))
      ) {
        return res.status(400).json({
          error: "Date invalide",
        });
      }

      updates.dueDate = dueDate;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "Aucune modification valide fournie",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur modification tâche :", error);

    res.status(500).json({
      error: "Impossible de modifier la tâche",
    });
  }
});

// DELETE /api/tasks/:id
// Supprimer uniquement une tâche appartenant à l'utilisateur
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        error: "Identifiant de tâche invalide",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Tâche introuvable",
      });
    }

    res.status(200).json({
      message: "Tâche supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression tâche :", error);

    res.status(500).json({
      error: "Impossible de supprimer la tâche",
    });
  }
});

module.exports = router;
