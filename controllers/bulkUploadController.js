const fs = require("fs");
const csv = require("csv-parser");

const User = require("../models/user");
const Student = require("../models/Student");

const processStudentCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const io = req.app.get("io");

    const filePath = req.file.path;
    const socketId = req.headers["x-socket-id"];

    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        try {
          const total = rows.length;

          if (total === 0) {
            fs.unlinkSync(filePath);

            return res.status(400).json({
              message:
                "CSV file does not contain any student records",
            });
          }

          if (io && socketId) {
            io.to(socketId).emit(
              "bulk-upload-start",
              {
                total,
              }
            );
          }

          let imported = 0;
          let skipped = 0;
          const errors = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
              const name =
                row.name?.trim();

              const email =
                row.email
                  ?.trim()
                  .toLowerCase();

              const password =
                row.password?.trim();

              const rollNumber =
                row.rollNumber?.trim();

              const enrollmentYear =
                Number(
                  row.enrollmentYear
                );

              const department =
                row.department?.trim();

              const semester =
                Number(row.semester);

              // Validate required fields
              if (
                !name ||
                !email ||
                !password ||
                !rollNumber ||
                !enrollmentYear ||
                !department ||
                !semester
              ) {
                skipped++;

                errors.push({
                  row: i + 2,
                  message:
                    "Missing required field",
                });
              } else {
                // Check duplicate email
                const existingUser =
                  await User.findOne({
                    email,
                  });

                // Check duplicate roll number
                const existingStudent =
                  await Student.findOne({
                    rollNumber,
                  });

                if (
                  existingUser ||
                  existingStudent
                ) {
                  skipped++;

                  errors.push({
                    row: i + 2,
                    message:
                      "Email or roll number already exists",
                  });
                } else {
                  // Create User
                  const user =
                    await User.create({
                      name,
                      email,
                      password,
                      role: "student",
                    });

                  // Create Student profile
                  await Student.create({
                    userId: user._id,
                    rollNumber,
                    enrollmentYear,
                    department,
                    semester,
                    isActive: true,
                  });

                  imported++;
                }
              }
            } catch (rowError) {
              skipped++;

              errors.push({
                row: i + 2,
                message:
                  rowError.message,
              });
            }

            const processed =
              i + 1;

            const progress =
              Math.round(
                (processed / total) *
                  100
              );

            if (io && socketId) {
              io.to(socketId).emit(
                "bulk-upload-progress",
                {
                  processed,
                  total,
                  progress,
                  imported,
                  skipped,
                }
              );
            }
          }

          // Delete uploaded file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          if (io && socketId) {
            io.to(socketId).emit(
              "bulk-upload-complete",
              {
                total,
                imported,
                skipped,
                errors,
              }
            );
          }

          return res.status(200).json({
            message:
              "Bulk student upload completed",
            total,
            imported,
            skipped,
            errors,
          });
        } catch (processingError) {
          console.error(
            "CSV processing error:",
            processingError
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          if (io && socketId) {
            io.to(socketId).emit(
              "bulk-upload-error",
              {
                message:
                  "Failed to process CSV file",
              }
            );
          }

          return res.status(500).json({
            message:
              "Failed to process CSV file",
          });
        }
      })
      .on("error", (error) => {
        console.error(
          "CSV parsing error:",
          error
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (io && socketId) {
          io.to(socketId).emit(
            "bulk-upload-error",
            {
              message:
                "Failed to parse CSV file",
            }
          );
        }

        return res.status(500).json({
          message:
            "Failed to parse CSV file",
        });
      });
  } catch (error) {
    console.error(
      "Bulk upload error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error during bulk upload",
    });
  }
};

module.exports = {
  processStudentCsv,
};