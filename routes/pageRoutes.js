const express = require("express");

const router = express.Router();

// LOGIN PAGE
router.get(
  "/login",
  (req, res) => {
    res.render("login");
  }
);

// ADMIN DASHBOARD
router.get(
  "/admin-dashboard",
  (req, res) => {
    res.render(
      "admin-dashboard"
    );
  }
);

// TEACHER DASHBOARD
router.get(
  "/teacher-dashboard",
  (req, res) => {
    res.render(
      "teacher-dashboard"
    );
  }
);

// STUDENT DASHBOARD
router.get(
  "/student-dashboard",
  (req, res) => {
    res.render(
      "student-dashboard"
    );
  }
);

// TAKE ATTENDANCE
router.get(
  "/take-attendance",
  (req, res) => {
    res.render(
      "take-attendance"
    );
  }
);

// REPORT CARD
router.get(
  "/report-card",
  (req, res) => {
    res.render(
      "report-card"
    );
  }
);

// ADMIN BULK UPLOAD
router.get(
  "/admin/bulk-upload",
  (req, res) => {
    res.render(
      "admin-bulk-upload"
    );
  }
);

// ANNOUNCEMENTS
router.get(
  "/announcements",
  (req, res) => {
    res.render(
      "announcements"
    );
  }
);

module.exports = router;