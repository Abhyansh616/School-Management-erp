const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  saveGrade,
  getCourseGrades,
  getMyReportCard,
  getStudentReportCard,
  downloadMyReportCardPdf,
} = require("../controllers/gradeController");

const router = express.Router();

// SAVE / UPDATE GRADE
router.post(
  "/:courseId",
  authenticate,
  authorize("admin", "teacher"),
  saveGrade
);

// GET GRADES FOR COURSE
router.get(
  "/course/:courseId",
  authenticate,
  authorize("teacher", "admin"),
  getCourseGrades
);

// STUDENT VIEW OWN REPORT CARD
router.get(
  "/student/my-report-card",
  authenticate,
  authorize("student"),
  getMyReportCard
);

// STUDENT DOWNLOAD OWN REPORT CARD PDF
router.get(
  "/student/my-report-card/pdf",
  authenticate,
  authorize("student"),
  downloadMyReportCardPdf
);

// ADMIN VIEW SPECIFIC STUDENT REPORT CARD
router.get(
  "/student/:studentId/report-card",
  authenticate,
  authorize("admin"),
  getStudentReportCard
);

module.exports = router;