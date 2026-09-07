const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createTeacher,
  createStudentUser,
  createStudentProfile,
  getTeachers,
  getStudents,
} = require("../controllers/userController");

const router = express.Router();


// ADMIN ONLY

// Create teacher account
router.post(
  "/teachers",
  authenticate,
  authorize("admin"),
  createTeacher
);


// Create student account
router.post(
  "/students",
  authenticate,
  authorize("admin"),
  createStudentUser
);


// Create student profile
router.post(
  "/students/profile",
  authenticate,
  authorize("admin"),
  createStudentProfile
);


// Get all teachers
router.get(
  "/teachers",
  authenticate,
  authorize("admin"),
  getTeachers
);


// Get all students
router.get(
  "/students",
  authenticate,
  authorize("admin"),
  getStudents
);


module.exports = router;