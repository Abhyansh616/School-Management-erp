const socket = io();

let currentRole = null;
let currentToken = null;

const announcementList =
  document.getElementById(
    "announcementList"
  );

const adminPanel =
  document.getElementById(
    "adminPanel"
  );

const announcementForm =
  document.getElementById(
    "announcementForm"
  );

const adminStatus =
  document.getElementById(
    "adminStatus"
  );

const publishButton =
  document.getElementById(
    "publishButton"
  );

const backLink =
  document.getElementById(
    "backLink"
  );

// GET TOKEN + ROLE
const getAuthentication = () => {
  const roles = [
    "admin",
    "teacher",
    "student",
  ];

  for (const role of roles) {
    const token =
      localStorage.getItem(
        `${role}Token`
      );

    if (token) {
      return {
        role,
        token,
      };
    }
  }

  return {
    role: null,
    token: null,
  };
};

const auth =
  getAuthentication();

currentRole =
  auth.role;

currentToken =
  auth.token;

// REDIRECT IF NOT LOGGED IN
if (!currentToken) {
  window.location.href =
    "/login";
}

// SHOW ADMIN PANEL
if (currentRole === "admin") {
  adminPanel.style.display =
    "block";
}

// SET DASHBOARD LINK
if (currentRole === "admin") {
  backLink.href =
    "/admin-dashboard";
} else if (
  currentRole === "teacher"
) {
  backLink.href =
    "/teacher-dashboard";
} else {
  backLink.href =
    "/student-dashboard";
}

// ESCAPE HTML
const escapeHtml = (
  value
) => {
  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;
};

// FORMAT DATE
const formatDate = (
  dateValue
) => {
  const date =
    new Date(dateValue);

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

// CREATE ANNOUNCEMENT HTML
const createAnnouncementElement =
  (announcement) => {
    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "announcement";

    wrapper.dataset.id =
      announcement._id;

    const creatorName =
      announcement.createdBy?.name ||
      "School Administration";

    wrapper.innerHTML = `
      <h3>
        ${escapeHtml(
          announcement.title
        )}
      </h3>

      <div class="announcement-message">
        ${escapeHtml(
          announcement.message
        )}
      </div>

      <div class="announcement-meta">
        Published by
        <strong>
          ${escapeHtml(
            creatorName
          )}
        </strong>
        •
        ${formatDate(
          announcement.publishedAt ||
          announcement.createdAt
        )}
      </div>
    `;

    return wrapper;
  };

// ADD ANNOUNCEMENT TO TOP
const addAnnouncement = (
  announcement
) => {
  const existing =
    document.querySelector(
      `[data-id="${announcement._id}"]`
    );

  if (existing) {
    return;
  }

  const emptyMessage =
    announcementList.querySelector(
      ".empty-message"
    );

  if (emptyMessage) {
    announcementList.innerHTML =
      "";
  }

  const element =
    createAnnouncementElement(
      announcement
    );

  announcementList.prepend(
    element
  );
};

// LOAD ANNOUNCEMENTS
const loadAnnouncements =
  async () => {
    try {
      const response =
        await fetch(
          "/api/announcements",
          {
            headers: {
              Authorization:
                `Bearer ${currentToken}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load announcements"
        );
      }

      announcementList.innerHTML =
        "";

      if (
        !data.announcements ||
        data.announcements.length ===
          0
      ) {
        announcementList.innerHTML = `
          <div class="empty-message">
            No announcements available.
          </div>
        `;

        return;
      }

      data.announcements.forEach(
        (announcement) => {
          addAnnouncement(
            announcement
          );
        }
      );
    } catch (error) {
      console.error(
        "Load announcements error:",
        error
      );

      announcementList.innerHTML = `
        <div class="empty-message">
          Failed to load announcements.
        </div>
      `;
    }
  };

// ADMIN: PUBLISH
if (
  announcementForm &&
  currentRole === "admin"
) {
  announcementForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const title =
        document
          .getElementById("title")
          .value.trim();

      const message =
        document
          .getElementById("message")
          .value.trim();

      if (!title || !message) {
        adminStatus.textContent =
          "Title and message are required.";

        return;
      }

      publishButton.disabled =
        true;

      adminStatus.textContent =
        "Publishing...";

      try {
        const response =
          await fetch(
            "/api/announcements",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${currentToken}`,
              },

              body: JSON.stringify({
                title,
                message,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to publish announcement"
          );
        }

        announcementForm.reset();

        adminStatus.textContent =
          "Announcement published successfully.";

        setTimeout(() => {
          adminStatus.textContent =
            "";
        }, 3000);
      } catch (error) {
        console.error(
          "Publish announcement error:",
          error
        );

        adminStatus.textContent =
          error.message;
      } finally {
        publishButton.disabled =
          false;
      }
    }
  );
}

// SOCKET.IO LIVE ANNOUNCEMENTS
socket.on(
  "new-announcement",
  (announcement) => {
    addAnnouncement(
      announcement
    );
  }
);

// SOCKET CONNECTION LOG
socket.on(
  "connect",
  () => {
    console.log(
      "Connected to announcement server:",
      socket.id
    );
  }
);

socket.on(
  "disconnect",
  () => {
    console.log(
      "Disconnected from announcement server"
    );
  }
);

// INITIAL LOAD
loadAnnouncements();