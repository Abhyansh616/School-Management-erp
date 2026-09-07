const params = new URLSearchParams(
  window.location.search
);

const courseId = params.get("courseId");

const courseTitle =
  document.getElementById("courseTitle");

const courseDescription =
  document.getElementById("courseDescription");

const courseIdDisplay =
  document.getElementById("courseIdDisplay");

const studentList =
  document.getElementById("studentList");

const attendanceForm =
  document.getElementById("attendanceForm");

const attendanceDate =
  document.getElementById("attendanceDate");

const submitButton =
  document.getElementById("submitButton");

const message =
  document.getElementById("message");

const errorElement =
  document.getElementById("error");




if (!courseId) {

  showError(
    "No course selected. Please open attendance from a course."
  );

  submitButton.disabled = true;

} else {

  courseIdDisplay.textContent = courseId;

  loadCourse();

}


const today =
  new Date()
    .toISOString()
    .split("T")[0];

attendanceDate.value = today;



async function loadCourse() {

  const token =
    localStorage.getItem("teacherToken");

  if (!token) {

    showError(
      "Teacher login required."
    );

    return;
  }

  try {

    const response =
      await fetch(
        `/api/courses/${courseId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "Unable to load course."
      );
    }

    const course =
      data.course || data;

    courseTitle.textContent =
      course.title ||
      "Course";

    courseDescription.textContent =
      course.description ||
      "No description";

    loadStudents(course);

  } catch (error) {

    console.error(
      "Course loading error:",
      error
    );

    showError(
      error.message
    );
  }
}



function loadStudents(course) {

  const students =
    course.enrolledStudents || [];

  if (students.length === 0) {

    studentList.innerHTML =
      "<p>No students enrolled in this course.</p>";

    submitButton.disabled = true;

    return;
  }

  studentList.innerHTML = "";

  students.forEach((student) => {

    const studentId =
      student._id ||
      student.id;

    const row =
      document.createElement("div");

    row.className =
      "student-row";

    row.innerHTML = `
      <div class="student-info">

        <div class="student-name">
          ${escapeHtml(
            student.userId?.name ||
            student.name ||
            "Student"
          )}
        </div>

        <div class="roll-number">
          Roll Number:
          ${escapeHtml(
            student.rollNumber ||
            "N/A"
          )}
        </div>

      </div>

      <div class="attendance-options">

        <label>
          <input
            type="radio"
            name="attendance-${studentId}"
            value="Present"
            checked
          >
          Present
        </label>

        <label>
          <input
            type="radio"
            name="attendance-${studentId}"
            value="Absent"
          >
          Absent
        </label>

        <label>
          <input
            type="radio"
            name="attendance-${studentId}"
            value="Late"
          >
          Late
        </label>

      </div>
    `;

    row.dataset.studentId =
      studentId;

    studentList.appendChild(row);

  });
}



attendanceForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    const token =
      localStorage.getItem("teacherToken");

    if (!token) {

      showError(
        "Teacher login required."
      );

      return;
    }

    const date =
      attendanceDate.value;

    if (!date) {

      showError(
        "Please select an attendance date."
      );

      return;
    }

    const rows =
      document.querySelectorAll(
        ".student-row"
      );

    const attendance =
      [];

    rows.forEach((row) => {

      const studentId =
        row.dataset.studentId;

      const selected =
        row.querySelector(
          `input[name="attendance-${studentId}"]:checked`
        );

      if (selected) {

        attendance.push({
          studentId,
          status: selected.value
        });

      }

    });

    if (attendance.length === 0) {

      showError(
        "Please mark attendance for at least one student."
      );

      return;
    }

    submitButton.disabled = true;

    submitButton.textContent =
      "Saving...";

    try {

      const response =
        await fetch(
          `/api/attendance/${courseId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              date,
              attendance
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          "Failed to save attendance."
        );
      }

      showSuccess(
        data.message ||
        "Attendance saved successfully."
      );

    } catch (error) {

      console.error(
        "Attendance submission error:",
        error
      );

      showError(
        error.message
      );

    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "Save Attendance";
    }

  }
);



function showError(text) {

  errorElement.textContent =
    text;

  errorElement.className =
    "message error";
}

function showSuccess(text) {

  message.textContent =
    text;

  message.className =
    "message success";
}



function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}