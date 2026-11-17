const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log(" MongoDB connecté avec succès !");
};

module.exports = connectDB;
