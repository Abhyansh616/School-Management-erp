const mongoose = require("mongoose");

const User = require("../models/user");
const Student = require("../models/Student");


// Admin: Create teacher
const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: "teacher",
    });

    return res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        isActive: teacher.isActive,
      },
    });
  } catch (error) {
    console.error("Create teacher error:", error);

    return res.status(500).json({
      message: "Server error while creating teacher",
    });
  }
};


// Admin: Create student account
const createStudentUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: "student",
    });

    return res.status(201).json({
      message: "Student account created successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isActive: student.isActive,
      },
    });
  } catch (error) {
    console.error("Create student user error:", error);

    return res.status(500).json({
      message: "Server error while creating student account",
    });
  }
};


// Admin: Create student profile
const createStudentProfile = async (req, res) => {
  try {
    const {
      userId,
      rollNumber,
      enrollmentYear,
      department,
      semester,
    } = req.body;

    if (
      !userId ||
      !rollNumber ||
      !enrollmentYear ||
      !department ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "userId, rollNumber, enrollmentYear, department and semester are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "student",
      isActive: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Active student user not found",
      });
    }

    const existingProfile = await Student.findOne({
      userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Student profile already exists for this user",
      });
    }

    const existingRollNumber = await Student.findOne({
      rollNumber,
    });

    if (existingRollNumber) {
      return res.status(409).json({
        message: "Roll number already exists",
      });
    }

    const student = await Student.create({
      userId,
      rollNumber,
      enrollmentYear,
      department,
      semester,
      isActive: true,
    });

    const populatedStudent = await Student.findById(student._id).populate(
      "userId",
      "name email role isActive"
    );

    return res.status(201).json({
      message: "Student profile created successfully",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("Create student profile error:", error);

    return res.status(500).json({
      message: "Server error while creating student profile",
    });
  }
};


// Admin: Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("Get teachers error:", error);

    return res.status(500).json({
      message: "Server error while fetching teachers",
    });
  }
};


// Admin: Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({
      isActive: true,
    })
      .populate("userId", "name email role isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "Server error while fetching students",
    });
  }
};


module.exports = {
  createTeacher,
  createStudentUser,
  createStudentProfile,
  getTeachers,
  getStudents,
};