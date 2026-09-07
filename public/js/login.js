const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "Logging in...";
  message.className = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const token = data.token;
    const role = data.user.role;

    if (role === "admin") {
      localStorage.setItem("adminToken", token);
    } else if (role === "teacher") {
      localStorage.setItem("teacherToken", token);
    } else if (role === "student") {
      localStorage.setItem("studentToken", token);
    } else {
      throw new Error("Unknown user role.");
    }

    message.textContent = "Login successful!";
    message.className = "success";

    setTimeout(function () {
      if (role === "admin") {
        window.location.href = "/admin-dashboard";
      } else if (role === "teacher") {
        window.location.href = "/teacher-dashboard";
      } else if (role === "student") {
        window.location.href = "/student-dashboard";
      }
    }, 500);

  } catch (error) {
    console.error("Login error:", error);

    message.textContent = error.message || "Login failed";
    message.className = "error";
  }
});