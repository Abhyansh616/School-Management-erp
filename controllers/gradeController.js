const Student = require("../models/Student");
const Grade = require("../models/Grade");
const Course = require("../models/Course");
const PDFDocument = require("pdfkit");

// SAVE / UPDATE GRADE
const saveGrade = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId, examName, score, remarks } = req.body;

    if (!studentId || !examName || score === undefined) {
      return res.status(400).json({
        message: "studentId, examName and score are required",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        message: "Score must be between 0 and 100",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Teacher can only modify grades for their own course
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You can only modify grades for your assigned courses",
      });
    }

    // Student must be enrolled in the course
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(400).json({
        message: "Student is not enrolled in this course",
      });
    }

    const grade = await Grade.findOneAndUpdate(
      {
        studentId,
        courseId,
        examName,
      },
      {
        studentId,
        courseId,
        examName,
        score,
        remarks,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    )
      .populate("studentId")
      .populate("courseId", "title description");

    return res.status(200).json({
      message: "Grade saved successfully",
      grade,
    });
  } catch (error) {
    console.error("Save grade error:", error);

    return res.status(500).json({
      message: "Server error while saving grade",
    });
  }
};

// GET GRADES FOR A COURSE
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Teacher can only view grades for own course
    if (
      req.user.role === "teacher" &&
      course.teacherId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You can only view grades for your assigned courses",
      });
    }

    const grades = await Grade.find({
      courseId,
    })
      .populate("studentId")
      .populate("courseId", "title description");

    return res.status(200).json({
      count: grades.length,
      grades,
    });
  } catch (error) {
    console.error("Get course grades error:", error);

    return res.status(500).json({
      message: "Server error while fetching grades",
    });
  }
};

// STUDENT VIEW OWN REPORT CARD
const getMyReportCard = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
    }).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const grades = await Grade.find({
      studentId: student._id,
    })
      .populate("courseId", "title description")
      .populate("studentId");

    return res.status(200).json({
      student: {
        id: student._id,
        name: student.userId?.name || "N/A",
        email: student.userId?.email || "N/A",
        rollNumber: student.rollNumber,
        enrollmentYear: student.enrollmentYear,
        department: student.department,
        semester: student.semester,
      },
      count: grades.length,
      grades,
    });
  } catch (error) {
    console.error("Get student report card error:", error);

    return res.status(500).json({
      message: "Server error while fetching report card",
    });
  }
};

// ADMIN VIEW SPECIFIC STUDENT REPORT CARD
const getStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate(
      "userId",
      "name email"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const grades = await Grade.find({
      studentId: student._id,
    })
      .populate("courseId", "title description")
      .populate("studentId");

    return res.status(200).json({
      student: {
        id: student._id,
        name: student.userId?.name || "N/A",
        email: student.userId?.email || "N/A",
        rollNumber: student.rollNumber,
        enrollmentYear: student.enrollmentYear,
        department: student.department,
        semester: student.semester,
      },
      count: grades.length,
      grades,
    });
  } catch (error) {
    console.error("Get student report card error:", error);

    return res.status(500).json({
      message: "Server error while fetching report card",
    });
  }
};

// DOWNLOAD STUDENT REPORT CARD AS PDF
const downloadMyReportCardPdf = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
    }).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const grades = await Grade.find({
      studentId: student._id,
    }).populate("courseId", "title");

    const studentName = student.userId?.name || "N/A";

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report-card-${student.rollNumber}.pdf"`
    );

    doc.pipe(res);

    // HEADER
    doc
      .fontSize(22)
      .text("SCHOOL MANAGEMENT ERP", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(18)
      .text("STUDENT REPORT CARD", {
        align: "center",
      });

    doc.moveDown(2);

    // STUDENT INFORMATION
    doc
      .fontSize(13)
      .text("Student Information", {
        underline: true,
      });

    doc.moveDown();

    doc
      .fontSize(11)
      .text(`Name: ${studentName}`);

    doc.text(
      `Email: ${student.userId?.email || "N/A"}`
    );

    doc.text(
      `Roll Number: ${student.rollNumber}`
    );

    doc.text(
      `Enrollment Year: ${student.enrollmentYear}`
    );

    doc.text(
      `Department: ${student.department}`
    );

    doc.text(
      `Semester: ${student.semester}`
    );

    doc.moveDown(2);

    // GRADES
    doc
      .fontSize(13)
      .text("Academic Performance", {
        underline: true,
      });

    doc.moveDown();

    if (grades.length === 0) {
      doc
        .fontSize(11)
        .text("No grades available yet.");
    } else {
      grades.forEach((grade, index) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. Course: ${
              grade.courseId?.title || "N/A"
            }`
          );

        doc.text(
          `   Exam: ${grade.examName}`
        );

        doc.text(
          `   Score: ${grade.score}/100`
        );

        doc.text(
          `   Remarks: ${
            grade.remarks || "No remarks"
          }`
        );

        doc.moveDown();
      });
    }

    doc.moveDown(2);

    // FOOTER
    doc
      .fontSize(9)
      .text(
        "Generated by School Management ERP",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "PDF report card error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate PDF report card",
      });
    }
  }
};

module.exports = {
  saveGrade,
  getCourseGrades,
  getMyReportCard,
  getStudentReportCard,
  downloadMyReportCardPdf,
};