const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ items: [] });
});

router.post("/", (req, res) => {
  console.log(req.body);

  res.status(201).json({
    message: "Données reçues",
  });
});

module.exports = router;
