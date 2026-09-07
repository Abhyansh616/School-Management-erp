const express = require("express");
const multer = require("multer");
const path = require("path");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  processStudentCsv,
} = require("../controllers/bulkUploadController");

const router = express.Router();

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(null, "uploads/");
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const uniqueName =
        `students-${Date.now()}${path.extname(
          file.originalname
        )}`;

      cb(null, uniqueName);
    },
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();

      if (extension !== ".csv") {
        return cb(
          new Error(
            "Only CSV files are allowed"
          )
        );
      }

      cb(null, true);
    },
  });

router.post(
  "/students",
  authenticate,
  authorize("admin"),
  upload.single("file"),
  processStudentCsv
);

module.exports = router;