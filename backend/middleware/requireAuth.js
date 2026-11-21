const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.taskflow_token;

    if (!token) {
      return res.status(401).json({
        error: "Authentification requise",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        error: "Session invalide",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "Utilisateur introuvable",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Session invalide ou expirée",
      });
    }

    console.error("Erreur authentification :", error);

    res.status(500).json({
      error: "Erreur interne du serveur",
    });
  }
};

module.exports = requireAuth;
