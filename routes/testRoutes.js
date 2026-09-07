const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

module.exports = router;