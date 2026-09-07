const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin-only test route
router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Admin Dashboard!",
      user: req.user,
    });
  }
);

module.exports = router;