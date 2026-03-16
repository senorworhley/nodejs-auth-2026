const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");

const router = express.Router();

router.get("/welcome", authMiddleware, adminMiddleware, (req, res) => {
  const { username, userId, role } = req.userInfo;
  res.json({
    message: "Welcome to the Admin Home Page!",
    user: {
      _id: userId,
      username,
      role,
    },
  });
});

module.exports = router;
