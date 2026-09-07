const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Student = require("../models/Student");
const { Parser } = require("json2csv");

// MARK ATTENDANCE
const markAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, attendance } = req.body;

    if (!date || !Array.isArray(attendance)) {
      return res.status(400).json({
        message: "date and attendance array are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Teacher can only mark attendance for their own course
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only mark attendance for your assigned courses",
      });
    }

    const enrolledStudentIds =
      course.enrolledStudents.map((id) =>
        id.toString()
      );

    const validStatuses = [
      "Present",
      "Absent",
      "Late",
    ];

    const records = [];

    for (const item of attendance) {
      if (!item.studentId || !item.status) {
        return res.status(400).json({
          message:
            "Each attendance record must contain studentId and status",
        });
      }

      if (!enrolledStudentIds.includes(item.studentId)) {
        return res.status(400).json({
          message:
            "One or more students are not enrolled in this course",
        });
      }

      if (!validStatuses.includes(item.status)) {
        return res.status(400).json({
          message:
            "Invalid attendance status. Use Present, Absent or Late",
        });
      }

      records.push({
        studentId: item.studentId,
        courseId,
        date: new Date(date),
        status: item.status,
      });
    }

    // Remove previous attendance records for the same
    // course/date/student combination
    for (const record of records) {
      await Attendance.deleteMany({
        courseId: record.courseId,
        studentId: record.studentId,
        date: record.date,
      });
    }

    const savedRecords =
      await Attendance.insertMany(records);

    return res.status(201).json({
      message:
        "Attendance marked successfully",
      count: savedRecords.length,
      attendance: savedRecords,
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while marking attendance",
    });
  }
};

// GET ATTENDANCE FOR A COURSE
const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Teacher can only view attendance
    // for their own course
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only view attendance for your assigned courses",
      });
    }

    const attendance =
      await Attendance.find({
        courseId,
      })
        .populate(
          "studentId",
          "rollNumber department semester"
        )
        .sort({
          date: -1,
        });

    return res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get course attendance error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching attendance",
    });
  }
};

// GET MY ATTENDANCE
const getMyAttendance = async (req, res) => {
  try {
    const student =
      await Student.findOne({
        userId: req.user.userId,
      });

    if (!student) {
      return res.status(404).json({
        message:
          "Student profile not found",
      });
    }

    const attendance =
      await Attendance.find({
        studentId: student._id,
      })
        .populate(
          "courseId",
          "title description"
        )
        .sort({
          date: -1,
        });

    return res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get my attendance error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching your attendance",
    });
  }
};

// EXPORT COURSE ATTENDANCE AS CSV
const exportAttendanceCsv = async (
  req,
  res
) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(
      courseId
    )
      .populate(
        "teacherId",
        "name email"
      )
      .populate({
        path: "enrolledStudents",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Teacher can only export
    // attendance for their own course
    if (
      req.user.role === "teacher" &&
      course.teacherId._id.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only export attendance for your assigned courses",
      });
    }

    const attendance =
      await Attendance.find({
        courseId,
      })
        .populate({
          path: "studentId",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .sort({
          date: 1,
        });

    if (attendance.length === 0) {
      return res.status(404).json({
        message:
          "No attendance records found for this course",
      });
    }

    const csvData =
      attendance.map((record) => ({
        Student_Name:
          record.studentId?.userId?.name ||
          "N/A",

        Student_Email:
          record.studentId?.userId?.email ||
          "N/A",

        Roll_Number:
          record.studentId?.rollNumber ||
          "N/A",

        Department:
          record.studentId?.department ||
          "N/A",

        Semester:
          record.studentId?.semester ||
          "N/A",

        Course:
          course.title,

        Date:
          record.date
            .toISOString()
            .split("T")[0],

        Status:
          record.status,
      }));

    const fields = [
      "Student_Name",
      "Student_Email",
      "Roll_Number",
      "Department",
      "Semester",
      "Course",
      "Date",
      "Status",
    ];

    const parser = new Parser({
      fields,
    });

    const csv =
      parser.parse(csvData);

    const safeCourseName =
      course.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-${safeCourseName}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error(
      "Export attendance CSV error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while exporting attendance",
    });
  }
};

module.exports = {
  markAttendance,
  getCourseAttendance,
  getMyAttendance,
  exportAttendanceCsv,
};