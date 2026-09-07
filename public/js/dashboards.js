const dashboardRole = document.body.dataset.dashboardRole;

async function loadDashboard() {
  const errorElement = document.getElementById("error");

  let token = null;

  if (dashboardRole === "admin") {
    token = localStorage.getItem("adminToken");
  } else if (dashboardRole === "teacher") {
    token = localStorage.getItem("teacherToken");
  } else if (dashboardRole === "student") {
    token = localStorage.getItem("studentToken");
  }

  if (!token) {
    errorElement.textContent =
      "No login token found. Please login first.";
    return;
  }

  try {
    const response = await fetch(
      `/api/dashboard/${dashboardRole}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    console.log("Dashboard response:", data);

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        "Failed to load dashboard"
      );
    }

    if (dashboardRole === "admin") {
      loadAdminDashboard(data);
    }

    if (dashboardRole === "teacher") {
      loadTeacherDashboard(data);
    }

    if (dashboardRole === "student") {
      loadStudentDashboard(data);
    }

  } catch (error) {
    console.error("Dashboard error:", error);

    errorElement.textContent =
      error.message || "Failed to load dashboard";
  }
}



function loadAdminDashboard(data) {
  document.getElementById("totalStudents").textContent =
    data.totalActiveStudents ?? 0;

  document.getElementById("averageAttendance").textContent =
    `${data.averageAttendance ?? 0}%`;

  document.getElementById("totalCourses").textContent =
    data.totalCourses ?? 0;

  const breakdown =
    data.attendanceBreakdown || [];

  const labels = breakdown.map(
    item => item._id
  );

  const values = breakdown.map(
    item => item.count
  );

  const canvas =
    document.getElementById("attendanceChart");

  if (!canvas) {
    return;
  }

  new Chart(canvas, {
    type: "bar",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Attendance Records",
          data: values
        }
      ]
    },

    options: {
      responsive: true
    }
  });
}



function loadTeacherDashboard(data) {
  document.getElementById("totalCourses").textContent =
    data.totalCourses ?? 0;

  document.getElementById("passingRate").textContent =
    `${data.passingRate ?? 0}%`;

  document.getElementById("averageScore").textContent =
    data.averageScore ?? 0;

  const courseList =
    document.getElementById("courseList");

  const courses =
    data.courses || [];

  if (courses.length === 0) {
    courseList.innerHTML =
      "<p>No assigned courses.</p>";

    return;
  }

  courseList.innerHTML = "";

  courses.forEach(course => {
    const div =
      document.createElement("div");

    div.className = "course";

    div.innerHTML = `
      <strong>
        ${escapeHtml(course.title)}
      </strong>

      <br>

      <small>
        ${escapeHtml(
          course.description ||
          "No description"
        )}
      </small>
    `;

    courseList.appendChild(div);
  });
}



function loadStudentDashboard(data) {
  document.getElementById(
    "attendancePercentage"
  ).textContent =
    `${data.attendancePercentage ?? 0}%`;

  const student =
    data.student;

  if (student) {
    document.getElementById(
      "studentInfo"
    ).innerHTML = `
      <strong>
        ${escapeHtml(student.name || "")}
      </strong>

      <br>

      Roll Number:
      ${escapeHtml(student.rollNumber || "")}

      <br>

      Department:
      ${escapeHtml(student.department || "")}

      <br>

      Semester:
      ${student.semester ?? ""}
    `;
  }

  const courseList =
    document.getElementById("courseList");

  const courses =
    data.courses || [];

  if (courses.length === 0) {
    courseList.innerHTML =
      "<p>No enrolled courses.</p>";
  } else {
    courseList.innerHTML = "";

    courses.forEach(course => {
      const div =
        document.createElement("div");

      div.className = "course";

      div.innerHTML = `
        <strong>
          ${escapeHtml(course.title)}
        </strong>

        <br>

        <small>
          Teacher:
          ${escapeHtml(
            course.teacherId?.name ||
            "Not assigned"
          )}
        </small>
      `;

      courseList.appendChild(div);
    });
  }

  const examScores =
    data.examScores || [];

  const labels =
    examScores.map(exam =>
      `${exam.examName} - ${
        exam.courseId?.title ||
        "Course"
      }`
    );

  const scores =
    examScores.map(
      exam => exam.score
    );

  const canvas =
    document.getElementById(
      "examScoreChart"
    );

  if (!canvas) {
    return;
  }

  new Chart(canvas, {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Exam Score",
          data: scores,
          tension: 0.3
        }
      ]
    },

    options: {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


document.addEventListener(
  "DOMContentLoaded",
  loadDashboard
);