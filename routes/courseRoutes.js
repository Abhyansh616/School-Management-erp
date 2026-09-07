const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createCourse,
  assignTeacher,
  enrollStudent,
  getAllCourses,
  getTeacherCourses,
  getStudentCourses,
  getCourseById,
} = require("../controllers/courseController");

const router = express.Router();


// Create course
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCourse
);

// Assign teacher
router.put(
  "/:courseId/teacher",
  authenticate,
  authorize("admin"),
  assignTeacher
);

// Enroll student
router.put(
  "/:courseId/enroll",
  authenticate,
  authorize("admin"),
  enrollStudent
);

// Get all courses
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllCourses
);


// Teacher's own courses
router.get(
  "/teacher/my-courses",
  authenticate,
  authorize("teacher"),
  getTeacherCourses
);


// Student's enrolled courses
router.get(
  "/student/my-courses",
  authenticate,
  authorize("student"),
  getStudentCourses
);


// Admin / Teacher / Student
router.get(
  "/:courseId",
  authenticate,
  authorize("admin", "teacher", "student"),
  getCourseById
);


module.exports = router;