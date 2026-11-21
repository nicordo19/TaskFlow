const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Autoriser les requêtes du frontend React
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Lire les données JSON envoyées par le frontend
app.use(express.json());

// Lire les cookies d'authentification
app.use(cookieParser());

// Vérifier que le serveur fonctionne
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes des tâches
app.use("/api/tasks", taskRoutes);

module.exports = app;
