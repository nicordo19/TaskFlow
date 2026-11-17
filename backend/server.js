require("dotenv").config();

const app = require("./app");
const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error(" Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
};

startServer();
