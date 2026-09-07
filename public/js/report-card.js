const reportCardContainer =
  document.getElementById("reportCard");

const errorElement =
  document.getElementById("error");

async function loadReportCard() {
  const token =
    localStorage.getItem("studentToken");

  if (!token) {
    showError(
      "No student login token found. Please login first."
    );
    return;
  }

  try {
    const response = await fetch(
      "/api/grades/student/my-report-card",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(
      "Report card response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        "Failed to load report card"
      );
    }

    displayReportCard(data);
  } catch (error) {
    console.error(
      "Report card error:",
      error
    );

    showError(
      error.message ||
      "Failed to load report card"
    );
  }
}

function displayReportCard(data) {
  if (!reportCardContainer) {
    console.error(
      "Element with id='reportCard' was not found."
    );

    return;
  }

  const student =
    data.student || {};

  const grades =
    data.grades || [];

  let html = `
    <div class="student-info">

      <h2>
        Student Information
      </h2>

      <p>
        <strong>Name:</strong>
        ${escapeHtml(
          student.name || "N/A"
        )}
      </p>

      <p>
        <strong>Email:</strong>
        ${escapeHtml(
          student.email || "N/A"
        )}
      </p>

      <p>
        <strong>Roll Number:</strong>
        ${escapeHtml(
          student.rollNumber || "N/A"
        )}
      </p>

      <p>
        <strong>Enrollment Year:</strong>
        ${student.enrollmentYear ?? "N/A"}
      </p>

      <p>
        <strong>Department:</strong>
        ${escapeHtml(
          student.department || "N/A"
        )}
      </p>

      <p>
        <strong>Semester:</strong>
        ${student.semester ?? "N/A"}
      </p>

    </div>

    <div class="grades-section">

      <h2>
        Grades
      </h2>
  `;

  if (grades.length === 0) {
    html += `
      <p>
        No grades available yet.
      </p>
    `;
  } else {
    html += `
      <table>

        <thead>

          <tr>
            <th>Course</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Remarks</th>
          </tr>

        </thead>

        <tbody>
    `;

    grades.forEach((grade) => {
      html += `
        <tr>

          <td>
            ${escapeHtml(
              grade.courseId?.title ||
              "N/A"
            )}
          </td>

          <td>
            ${escapeHtml(
              grade.examName ||
              "N/A"
            )}
          </td>

          <td>
            ${grade.score ?? "N/A"}
          </td>

          <td>
            ${escapeHtml(
              grade.remarks ||
              "No remarks"
            )}
          </td>

        </tr>
      `;
    });

    html += `
        </tbody>

      </table>
    `;
  }

  html += `
    </div>
  `;

  reportCardContainer.innerHTML =
    html;
}

async function downloadReportCardPdf() {
  const token =
    localStorage.getItem("studentToken");

  if (!token) {
    showError(
      "No student login token found. Please login first."
    );

    return;
  }

  const button =
    document.getElementById(
      "downloadPdfButton"
    );

  try {
    if (button) {
      button.disabled = true;
      button.textContent =
        "Generating PDF...";
    }

    const response = await fetch(
      "/api/grades/student/my-report-card/pdf",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let message =
        "Failed to download PDF.";

      try {
        const data =
          await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } catch (error) {
        // Response was not JSON
      }

      throw new Error(message);
    }

    const blob =
      await response.blob();

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "student-report-card.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(
      "PDF download error:",
      error
    );

    showError(
      error.message ||
      "Failed to download PDF."
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        "Download PDF Report Card";
    }
  }
}

function showError(message) {
  if (errorElement) {
    errorElement.textContent =
      message;

    errorElement.style.display =
      "block";
  }

  if (reportCardContainer) {
    reportCardContainer.innerHTML =
      "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadReportCard();

    const downloadButton =
      document.getElementById(
        "downloadPdfButton"
      );

    if (downloadButton) {
      downloadButton.addEventListener(
        "click",
        downloadReportCardPdf
      );
    }
  }
);