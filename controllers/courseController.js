const mongoose = require("mongoose");

const Course = require("../models/Course");
const Student = require("../models/Student");
const User = require("../models/user");

// Admin: Create a course
const createCourse = async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;

    if (!title || !teacherId) {
      return res.status(400).json({
        message: "Title and teacherId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        message: "Invalid teacherId",
      });
    }

    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      isActive: true,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Active teacher not found",
      });
    }

    const course = await Course.create({
      title,
      description,
      teacherId,
      enrolledStudents: [],
    });

    const populatedCourse = await Course.findById(course._id)
      .populate("teacherId", "name email role");

    return res.status(201).json({
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(500).json({
      message: "Server error while creating course",
    });
  }
};


// Admin: Assign/change teacher
const assignTeacher = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        message: "Invalid teacherId",
      });
    }

    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      isActive: true,
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Active teacher not found",
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { teacherId },
      { new: true }
    ).populate("teacherId", "name email role");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      message: "Teacher assigned successfully",
      course,
    });
  } catch (error) {
    console.error("Assign teacher error:", error);

    return res.status(500).json({
      message: "Server error while assigning teacher",
    });
  }
};


// Admin: Enroll student in course
const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        message: "Invalid studentId",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      isActive: true,
    }).populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Active student not found",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (!course.enrolledStudents.some(
      (id) => id.toString() === studentId
    )) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    const populatedCourse = await Course.findById(course._id)
      .populate("teacherId", "name email role")
      .populate("enrolledStudents", "rollNumber enrollmentYear department semester");

    return res.status(200).json({
      message: "Student enrolled successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Enroll student error:", error);

    return res.status(500).json({
      message: "Server error while enrolling student",
    });
  }
};


// Admin: Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate("teacherId", "name email role")
      .populate(
        "enrolledStudents",
        "rollNumber enrollmentYear department semester"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get all courses error:", error);

    return res.status(500).json({
      message: "Server error while fetching courses",
    });
  }
};


// Teacher: Get only assigned courses
const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      teacherId: req.user.userId,
      isActive: true,
    })
      .populate("teacherId", "name email role")
      .populate(
        "enrolledStudents",
        "rollNumber enrollmentYear department semester"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get teacher courses error:", error);

    return res.status(500).json({
      message: "Server error while fetching teacher courses",
    });
  }
};


// Student: Get only enrolled courses
const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const courses = await Course.find({
      enrolledStudents: student._id,
      isActive: true,
    })
      .populate("teacherId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get student courses error:", error);

    return res.status(500).json({
      message: "Server error while fetching student courses",
    });
  }
};


// Teacher/Admin/Student: Get one course with ABAC protection
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      isActive: true,
    })
      .populate("teacherId", "name email role")
      .populate(
        "enrolledStudents",
        "rollNumber enrollmentYear department semester"
      );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Admin has complete access
    if (req.user.role === "admin") {
      return res.status(200).json({ course });
    }

    // Teacher can access only their assigned course
    if (req.user.role === "teacher") {
      if (course.teacherId._id.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Access denied. This course is not assigned to you.",
        });
      }

      return res.status(200).json({ course });
    }

    // Student can access only courses they are enrolled in
    if (req.user.role === "student") {
      const student = await Student.findOne({
        userId: req.user.userId,
        isActive: true,
      });

      if (!student) {
        return res.status(404).json({
          message: "Student profile not found",
        });
      }

      const isEnrolled = course.enrolledStudents.some(
        (studentItem) =>
          studentItem._id.toString() === student._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          message: "Access denied. You are not enrolled in this course.",
        });
      }

      return res.status(200).json({ course });
    }

    return res.status(403).json({
      message: "Access denied",
    });
  } catch (error) {
    console.error("Get course error:", error);

    return res.status(500).json({
      message: "Server error while fetching course",
    });
  }
};


module.exports = {
  createCourse,
  assignTeacher,
  enrollStudent,
  getAllCourses,
  getTeacherCourses,
  getStudentCourses,
  getCourseById,
};