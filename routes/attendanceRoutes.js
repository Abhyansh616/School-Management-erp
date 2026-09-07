const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  markAttendance,
  getCourseAttendance,
  getMyAttendance,
  exportAttendanceCsv,
} = require("../controllers/attendanceController");

const router = express.Router();

// MARK ATTENDANCE
router.post(
  "/:courseId",
  authenticate,
  authorize("admin", "teacher"),
  markAttendance
);

// GET COURSE ATTENDANCE
router.get(
  "/course/:courseId",
  authenticate,
  authorize("admin", "teacher"),
  getCourseAttendance
);

// GET MY ATTENDANCE
router.get(
  "/student/my-attendance",
  authenticate,
  authorize("student"),
  getMyAttendance
);

// EXPORT ATTENDANCE AS CSV
router.get(
  "/:courseId/export",
  authenticate,
  authorize("admin", "teacher"),
  exportAttendanceCsv
);

module.exports = router;