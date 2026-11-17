const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Autoriser les requêtes de notre frontend React
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Permettre à Express de lire les données JSON
app.use(express.json());

// Route pour vérifier que l'API fonctionne
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes de gestion des tâches
app.use("/api/tasks", taskRoutes);

module.exports = app;
