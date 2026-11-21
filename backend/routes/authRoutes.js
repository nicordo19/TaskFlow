const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const COOKIE_NAME = "taskflow_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

// INSCRIPTION
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        error:
          "Nom, email valide et mot de passe de 8 caractères minimum requis (72 octets maximum)",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Cet email est déjà utilisé",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id.toString());

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Compte créé avec succès",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Cet email est déjà utilisé",
      });
    }

    console.error("Erreur inscription :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

// CONNEXION
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Email et mot de passe requis",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Identifiants incorrects",
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: "Identifiants incorrects",
      });
    }

    const token = createToken(user._id.toString());

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Connexion réussie",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Erreur connexion :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
});

// UTILISATEUR CONNECTÉ
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        error: "Non authentifié",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    res.status(401).json({
      error: "Session invalide ou expirée",
    });
  }
});

// DÉCONNEXION
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  res.status(200).json({
    message: "Déconnexion réussie",
  });
});

module.exports = router;
