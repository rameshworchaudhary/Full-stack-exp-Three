require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

require("./config/db");

const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("JWT Authentication API Running...");
});

module.exports = app;