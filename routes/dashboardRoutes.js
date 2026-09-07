const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

// Admin dashboard
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  getAdminDashboard
);

// Teacher dashboard
router.get(
  "/teacher",
  authenticate,
  authorize("teacher"),
  getTeacherDashboard
);

// Student dashboard
router.get(
  "/student",
  authenticate,
  authorize("student"),
  getStudentDashboard
);

module.exports = router;