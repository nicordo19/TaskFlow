const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/taskflow");

  console.log(" MongoDB connecté avec succès !");
};

module.exports = connectDB;
