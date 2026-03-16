const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/auth-controller");

const router = express.Router();

// all routes that are related to users only will be defined here
router.post("/register", registerUser);
router.post("/change-password", authMiddleware, changePassword);
router.post("/login", loginUser);

module.exports = router;
