const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Grade = require("../models/Grade");



const getAdminDashboard = async (req, res) => {
  try {
    

    const totalActiveStudents = await Student.countDocuments({
      isActive: true,
    });

    

    const totalCourses = await Course.countDocuments({
      isActive: true,
    });


    const attendanceStats = await Attendance.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },

      {
        $unwind: "$student",
      },

      {
        $match: {
          "student.isActive": true,
        },
      },

      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let totalAttendanceRecords = 0;
    let presentRecords = 0;
    let lateRecords = 0;

    attendanceStats.forEach((item) => {
      totalAttendanceRecords += item.count;

      if (item._id === "Present") {
        presentRecords += item.count;
      }

      if (item._id === "Late") {
        lateRecords += item.count;
      }
    });

    const averageAttendance =
      totalAttendanceRecords === 0
        ? 0
        : Number(
            (
              ((presentRecords + lateRecords) /
                totalAttendanceRecords) *
              100
            ).toFixed(2)
          );



    const attendanceBreakdown = attendanceStats.map(
      (item) => ({
        _id: item._id,
        count: item.count,
      })
    );

  

    return res.status(200).json({
      role: "admin",

      totalActiveStudents,

      totalCourses,

      averageAttendance,

      attendanceBreakdown,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while loading admin dashboard",
    });
  }
};


const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.userId;

  

    const courses = await Course.find({
      teacherId,
      isActive: true,
    })
      .select("_id title description enrolledStudents")
      .populate(
        "teacherId",
        "name email"
      );

    const courseIds = courses.map(
      (course) => course._id
    );


    const gradeStats = await Grade.aggregate([
      {
        $match: {
          courseId: {
            $in: courseIds,
          },
        },
      },

      // Join grades with courses
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },

      {
        $unwind: "$course",
      },

      
      {
        $match: {
          "course.teacherId": req.user.userId,
          "course.isActive": true,
        },
      },

      {
        $group: {
          _id: null,

          totalGrades: {
            $sum: 1,
          },

          passedGrades: {
            $sum: {
              $cond: [
                {
                  $gte: ["$score", 40],
                },
                1,
                0,
              ],
            },
          },

          averageScore: {
            $avg: "$score",
          },
        },
      },
    ]);

    let totalGrades = 0;
    let passingRate = 0;
    let averageScore = 0;

    if (gradeStats.length > 0) {
      totalGrades =
        gradeStats[0].totalGrades || 0;

      const passedGrades =
        gradeStats[0].passedGrades || 0;

      passingRate =
        totalGrades === 0
          ? 0
          : Number(
              (
                (passedGrades /
                  totalGrades) *
                100
              ).toFixed(2)
            );

      averageScore =
        gradeStats[0].averageScore == null
          ? 0
          : Number(
              gradeStats[0].averageScore.toFixed(2)
            );
    }

    

    return res.status(200).json({
      role: "teacher",

      totalCourses: courses.length,

      passingRate,

      averageScore,

      totalGrades,

      courses,
    });
  } catch (error) {
    console.error(
      "Teacher dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while loading teacher dashboard",
    });
  }
};


const getStudentDashboard = async (req, res) => {
  try {
    

    const student = await Student.findOne({
      userId: req.user.userId,
      isActive: true,
    }).populate(
      "userId",
      "name email"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    

    const attendanceStats =
      await Attendance.aggregate([
        {
          $match: {
            studentId: student._id,
          },
        },

        // Join Attendance -> Course
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },

        {
          $unwind: "$course",
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: 1,
            },

            present: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Present",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            late: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Late",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            absent: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Absent",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    let totalAttendance = 0;
    let presentAttendance = 0;
    let lateAttendance = 0;
    let absentAttendance = 0;

    if (attendanceStats.length > 0) {
      totalAttendance =
        attendanceStats[0].total || 0;

      presentAttendance =
        attendanceStats[0].present || 0;

      lateAttendance =
        attendanceStats[0].late || 0;

      absentAttendance =
        attendanceStats[0].absent || 0;
    }

    const attendancePercentage =
      totalAttendance === 0
        ? 0
        : Number(
            (
              ((presentAttendance +
                lateAttendance) /
                totalAttendance) *
              100
            ).toFixed(2)
          );

    // ---------------------------------------------
    // 3. Recent exam scores
    // ---------------------------------------------

    const recentGrades =
      await Grade.find({
        studentId: student._id,
      })
        .populate(
          "courseId",
          "title"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    const examScores =
      recentGrades
        .reverse()
        .map((grade) => ({
          examName: grade.examName,

          score: grade.score,

          courseId: grade.courseId
            ? {
                title:
                  grade.courseId.title,
              }
            : null,

          date: grade.createdAt,
        }));

    

    const enrolledCourses =
      await Course.find({
        enrolledStudents: student._id,
        isActive: true,
      })
        .populate(
          "teacherId",
          "name email"
        )
        .select(
          "title description teacherId"
        );

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(200).json({
      role: "student",

      student: {
        id: student._id,

        name:
          student.userId?.name ||
          "Student",

        email:
          student.userId?.email ||
          "",

        rollNumber:
          student.rollNumber,

        department:
          student.department,

        semester:
          student.semester,
      },

      attendancePercentage,

      attendance: {
        total: totalAttendance,

        present:
          presentAttendance,

        late:
          lateAttendance,

        absent:
          absentAttendance,
      },

      courses: enrolledCourses,

      examScores,
    });
  } catch (error) {
    console.error(
      "Student dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while loading student dashboard",
    });
  }
};


module.exports = {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
};