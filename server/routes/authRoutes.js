const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  getUserCounts,
  getUsersByRole,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.get("/counts", authMiddleware, getUserCounts);
router.get("/users", authMiddleware, getUsersByRole);

module.exports = router;