# School Management ERP

A full-stack **School Management Enterprise Resource Planning (ERP)** system built using **Node.js, Express.js, MongoDB, EJS, JWT, Socket.IO, Chart.js, PDFKit, and CSV processing**.

The system provides separate functionality for **Administrators, Teachers, and Students**, including course management, attendance, grading, report cards, analytics, bulk student uploads, CSV exports, PDF reports, and real-time announcements.

---

# 1. Features

## Authentication and Authorization

* JWT-based authentication
* Password hashing using bcrypt
* Role-Based Access Control (RBAC)
* Attribute-Based Access Control (ABAC)
* Three roles:

  * Admin
  * Teacher
  * Student
* Active/inactive user accounts
* Protected API routes

## Admin Features

* Admin dashboard
* School-wide analytics
* Create courses
* Assign teachers to courses
* Enroll students into courses
* View course information
* Bulk upload students using CSV
* Real-time CSV upload progress
* Publish real-time announcements
* Export attendance reports
* View student report cards

## Teacher Features

* Teacher dashboard
* View assigned courses
* View enrolled students
* Mark attendance
* Present / Absent / Late attendance statuses
* Upload grades
* View grades for assigned courses
* Export attendance reports
* Receive real-time announcements

## Student Features

* Student dashboard
* View enrolled courses
* View personal attendance
* View attendance percentage
* View personal report card
* View recent examination scores
* Download report card as PDF
* Receive real-time announcements

## Analytics

* Total active students
* Total courses
* School-wide attendance percentage
* Attendance breakdown
* Teacher passing rate
* Average grades
* Student attendance percentage
* Recent examination score chart

## File Processing

* Bulk student CSV upload
* CSV validation
* Duplicate email detection
* Duplicate roll-number detection
* Attendance CSV export
* PDF report card generation

## Real-Time Features

* Socket.IO integration
* Real-time CSV upload progress
* Real-time school announcements
* Live updates without refreshing the page

---

# 2. Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Socket.IO

## Frontend

* EJS
* HTML5
* CSS3
* JavaScript
* Chart.js

## File Processing

* csv-parser
* json2csv
* PDFKit
* Multer

## Security

* Helmet
* CORS
* Express Rate Limit
* Express Mongo Sanitize
* dotenv

## Documentation

* Mermaid.js

---

# 3. Database Design

The ERP uses MongoDB with Mongoose.

Main collections:

* User
* Student
* Course
* Attendance
* Grade
* Announcement

### Relationships

* A User can have a Student profile.
* A User can teach multiple Courses.
* A Student can enroll in multiple Courses.
* A Course can contain multiple Students.
* A Student can have multiple Attendance records.
* A Course can have multiple Attendance records.
* A Student can receive multiple Grades.
* A Course can contain multiple Grades.
* A User can create multiple Announcements.

---

# 4. Project Structure

```text
school-management-erp/
│
├── controllers/
│   ├── announcementController.js
│   ├── attendanceController.js
│   ├── bulkUploadController.js
│   ├── courseController.js
│   ├── dashboardController.js
│   └── gradeController.js
│
├── docs/
│   ├── erd.md
│   └── sequence-diagram.md
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── Announcement.js
│   ├── Attendance.js
│   ├── Course.js
│   ├── Grade.js
│   ├── Student.js
│   └── user.js
│
├── public/
│   └── js/
│       ├── admin-bulk-upload.js
│       ├── announcements.js
│       ├── dashboards.js
│       ├── login.js
│       ├── report-card.js
│       └── take-attendance.js
│
├── routes/
│   ├── announcementRoutes.js
│   ├── attendanceRoutes.js
│   ├── authRoutes.js
│   ├── bulkUploadRoutes.js
│   ├── courseRoutes.js
│   ├── dashboardRoutes.js
│   ├── gradeRoutes.js
│   ├── pageRoutes.js
│   └── testRoutes.js
│
├── uploads/
│
├── validations/
│
├── views/
│   ├── admin-bulk-upload.ejs
│   ├── admin-dashboard.ejs
│   ├── announcements.ejs
│   ├── login.ejs
│   ├── report-card.ejs
│   ├── student-dashboard.ejs
│   ├── take-attendance.ejs
│   └── teacher-dashboard.ejs
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── seed.js
└── server.js
```

---

# 5. Running the Project on a New Computer

This section explains how to set up and run the project on another computer.

The following instructions are intended for a fresh Windows computer using VS Code.

---

## Step 1 — Install Node.js

Install Node.js from the official Node.js website.

Node.js **20 or later** is recommended.

After installation, open **Command Prompt**, PowerShell, or the VS Code terminal and verify:

```bash
node -v
```

Then:

```bash
npm -v
```

Both commands should return a version number.

---

## Step 2 — Install Git

Git is required to download the project from GitHub.

Verify Git:

```bash
git --version
```

If a version number is displayed, Git is installed correctly.

---

## Step 3 — Clone the GitHub Repository

Open a terminal in the location where you want to keep the project.

Run:

```bash
git clone https://github.com/Abhyansh616/School-Management-erp.git
```

Then enter the project directory:

```bash
cd School-Management-erp
```

---

## Step 4 — Open the Project in VS Code

From inside the project directory, run:

```bash
code .
```

Alternatively:

1. Open VS Code.
2. Select **File → Open Folder**.
3. Select the `School-Management-erp` folder.

The project should now appear in the VS Code Explorer.

---

# 6. Install Project Dependencies

Open the VS Code terminal.

Make sure the terminal is inside the project folder.

Run:

```bash
npm install
```

This installs all packages listed in `package.json`.

The project dependencies include Express, Mongoose, EJS, JWT, Socket.IO, Chart.js-related frontend support, CSV processing, PDFKit, security middleware, and other required packages.

---

# 7. Configure MongoDB

The application requires MongoDB to store users, students, courses, attendance, grades, and announcements.

There are two supported approaches.

### Option A — MongoDB Atlas

MongoDB Atlas is recommended if the project is being run on another computer without a local MongoDB installation.

Create a MongoDB Atlas account and create a database cluster.

Then:

1. Open the MongoDB Atlas dashboard.
2. Select the database cluster.
3. Select **Connect**.
4. Select **Drivers / Connect your application**.
5. Copy the MongoDB connection string.
6. Replace the username, password, cluster information, and database name as required.

The connection string will look similar to:

```text
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

Do not copy the example literally. Use the connection string generated for your own MongoDB Atlas database.

### Important MongoDB Atlas Settings

If using MongoDB Atlas, make sure:

* A database user has been created.
* The database user's username and password are correct.
* The computer's IP address is allowed in the Atlas network access settings.
* The database connection string is correct.

For temporary development/testing, Atlas can be configured to allow the required development machine to connect. For production use, use appropriate network restrictions.

---

## Step 8 — Create the `.env` File

The repository contains:

```text
.env.example
```

Create a new file in the project root named:

```text
.env
```

The `.env` file should be located next to `server.js` and `package.json`.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
FRONTEND_URL=http://localhost:3000
```

### Example

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster-url/school_erp
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

Use your own MongoDB connection string and your own JWT secret.

### Security Warning

**Never commit `.env` to GitHub.**

The `.env` file may contain:

* MongoDB credentials
* Database connection information
* JWT secret

The repository should only contain `.env.example` with placeholder values.

---

# 9. Seed the Initial Admin Account

The project includes a seed script that creates the initial development administrator.

Run:

```bash
npm run seed
```

If the database connection is configured correctly, the seed script will create the development admin account if it does not already exist.

Development login:

```text
Email: admin@schoolerp.com
Password: Admin@12345
Role: admin
```

These credentials are intended for development/testing.

For a real production deployment, change the password and use appropriate credentials.

Running the seed command again will not create a duplicate admin if the account already exists.

---

# 10. Start the Application

For development mode, run:

```bash
npm run dev
```

The application uses Nodemon, so the server automatically restarts when relevant files are changed.

Alternatively, start the application normally with:

```bash
npm start
```

When the server starts successfully, it should be available at:

```text
http://localhost:3000
```

---

# 11. Open the Application

Open a browser and visit:

```text
http://localhost:3000/login
```

You should see the School Management ERP login page.

Use the seeded admin credentials:

```text
Email: admin@schoolerp.com
Password: Admin@12345
```

After successful login, the admin can access the admin functionality.

---

# 12. Main Application Pages

## Login

```text
http://localhost:3000/login
```

## Admin Dashboard

```text
http://localhost:3000/admin-dashboard
```

## Teacher Dashboard

```text
http://localhost:3000/teacher-dashboard
```

## Student Dashboard

```text
http://localhost:3000/student-dashboard
```

## Attendance

```text
http://localhost:3000/take-attendance
```

## Report Card

```text
http://localhost:3000/report-card
```

## Admin Bulk Upload

```text
http://localhost:3000/admin/bulk-upload
```

## Announcements

```text
http://localhost:3000/announcements
```

---

# 13. First-Time Testing Flow

After starting the project, the recommended testing order is:

### 1. Login as Admin

Open:

```text
http://localhost:3000/login
```

Use:

```text
admin@schoolerp.com
```

and:

```text
Admin@12345
```

### 2. Open Admin Dashboard

Verify that the dashboard loads and displays school analytics.

### 3. Create/Manage Courses

Use the admin functionality to create courses and assign teachers.

### 4. Add Students

Students can be added through the supported student registration/bulk-upload functionality.

### 5. Test Teacher Functionality

Login using a teacher account and verify:

* Assigned courses
* Enrolled students
* Attendance
* Grades
* Attendance export

### 6. Test Student Functionality

Login using a student account and verify:

* Student dashboard
* Enrolled courses
* Attendance
* Attendance percentage
* Grades
* Report card
* PDF report card

### 7. Test Announcements

Create an announcement as an authorized user and verify that it appears through the real-time announcement system.

### 8. Test Bulk Upload

From the admin bulk upload page, upload a CSV file containing student records and verify the real-time upload progress.

---

# 14. Bulk Student CSV Format

The bulk upload feature accepts CSV files with the following columns:

```text
name,email,password,rollNumber,enrollmentYear,department,semester
```

Example:

```csv
name,email,password,rollNumber,enrollmentYear,department,semester
Student One,student1@example.com,password123,STU001,2026,Computer Science,6
Student Two,student2@example.com,password123,STU002,2026,Computer Science,6
```

The system validates the uploaded records and checks for duplicate email addresses and roll numbers.

---

# 15. Main API Endpoints

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Courses

```text
POST /api/courses
GET /api/courses
GET /api/courses/:courseId
```

## Attendance

```text
POST /api/attendance/:courseId
GET /api/attendance/course/:courseId
GET /api/attendance/student/my-attendance
GET /reports/attendance/:courseId/export
```

## Grades

```text
POST /api/grades/:courseId
GET /api/grades/course/:courseId
GET /api/grades/student/my-report-card
GET /api/grades/student/my-report-card/pdf
GET /api/grades/student/:studentId/report-card
```

## Dashboards

```text
GET /api/dashboard/admin
GET /api/dashboard/teacher
GET /api/dashboard/student
```

## Bulk Student Upload

```text
POST /api/upload/students
```

## Announcements

```text
GET /api/announcements
POST /api/announcements
```

---

# 16. Role-Based Access Control

## Admin

The administrator has complete access to school management functionality.

Admin capabilities include:

* Manage courses
* Assign teachers
* Enroll students
* View school analytics
* Upload students in bulk
* Publish announcements
* View reports
* Export attendance
* View report cards

## Teacher

Teachers can operate only on courses assigned to them.

Teacher capabilities include:

* View assigned courses
* View enrolled students
* Mark attendance
* Upload grades
* View grades for assigned courses
* Export attendance reports
* View announcements

Teachers cannot modify attendance or grades belonging to courses assigned to another teacher.

## Student

Students have access only to their own academic information.

Student capabilities include:

* View enrolled courses
* View personal attendance
* View attendance percentage
* View personal report card
* Download personal report card PDF
* View examination scores
* View announcements

---

# 17. Attendance System

Teachers can mark attendance for students enrolled in their assigned courses.

Available statuses:

```text
Present
Absent
Late
```

Attendance records contain:

```text
studentId
courseId
date
status
```

The system also calculates attendance percentages for dashboards and reports.

Attendance reports can be exported as CSV.

---

# 18. Grade and Report Card System

Grades contain:

```text
studentId
courseId
examName
score
remarks
```

Students can view their personal report card through the ERP.

The system also generates a downloadable PDF report card using PDFKit.

---

# 19. CSV Attendance Export

Teachers and administrators can export attendance records using:

```text
GET /reports/attendance/:courseId/export
```

The exported CSV contains information such as:

* Student name
* Student email
* Roll number
* Department
* Semester
* Course
* Date
* Attendance status

---

# 20. Real-Time Bulk Upload

Administrators can upload multiple students using a CSV file.

The bulk upload process uses:

* Multer for file upload
* csv-parser for CSV processing
* MongoDB for storing users and student profiles
* Socket.IO for real-time progress updates

The interface displays upload progress while the CSV is being processed.

---

# 21. Real-Time Announcements

The ERP uses Socket.IO to provide real-time school announcements.

Authorized users can publish announcements, and connected users can receive updates without manually refreshing the page.

---

# 22. Analytics Dashboard

The project provides separate dashboards according to the logged-in user's role.

### Admin Dashboard

Displays:

* Total active students
* Total courses
* Average school attendance
* Attendance breakdown

### Teacher Dashboard

Displays:

* Assigned courses
* Passing rate
* Average score
* Course information

### Student Dashboard

Displays:

* Student information
* Enrolled courses
* Attendance percentage
* Recent examination scores

Charts are displayed using Chart.js.

---

# 23. Documentation and Diagrams

The `docs/` directory contains the project diagrams.

## ER Diagram

```text
docs/erd.md
```

The ER diagram documents relationships between:

* User
* Student
* Course
* Attendance
* Grade
* Announcement

## WebSocket Sequence Diagram

```text
docs/sequence-diagram.md
```

The sequence diagram explains the flow of the CSV bulk-upload process and real-time Socket.IO progress updates.

Both diagrams are written using Mermaid.js.

---

# 24. Troubleshooting

## Problem: `npm` is not recognized

Make sure Node.js is installed correctly.

Check:

```bash
node -v
npm -v
```

If these commands do not work, reinstall Node.js and restart VS Code.

---

## Problem: `git` is not recognized

Install Git and restart the terminal.

Check:

```bash
git --version
```

---

## Problem: MongoDB connection failed

Check the following:

1. `MONGO_URI` exists in `.env`.
2. The MongoDB connection string is correct.
3. The MongoDB username is correct.
4. The MongoDB password is correct.
5. MongoDB Atlas allows the computer's IP address.
6. The database user has the required permissions.
7. There are no accidental spaces or quotation marks in the connection string.

---

## Problem: `.env` is not working

Make sure the file is named exactly:

```text
.env
```

Not:

```text
.env.txt
```

The `.env` file must be in the project root:

```text
School-Management-erp/
├── .env
├── package.json
├── server.js
└── ...
```

---

## Problem: Port 3000 is already in use

Another application may already be using port 3000.

Stop the other application or change the port in `.env`:

```env
PORT=3001
```

Then open:

```text
http://localhost:3001
```

---

## Problem: Seed command fails

First verify that MongoDB is connected and that `MONGO_URI` is correct.

Then run:

```bash
npm run seed
```

---

## Problem: Page does not load

Make sure the server is running:

```bash
npm run dev
```

Then check:

```text
http://localhost:3000
```

Also check the VS Code terminal for server or MongoDB errors.

---

# 25. Important Security Notes

* Do not commit `.env`.
* Do not publish real MongoDB credentials.
* Do not publish real JWT secrets.
* Change development/demo passwords before production use.
* Use appropriate MongoDB network restrictions for production.
* Use strong secrets for JWT authentication.
* Do not use development credentials in a production environment.

---

# 26. Quick Setup Summary

For someone who already has Node.js, Git, and MongoDB ready, the basic setup is:

```bash
git clone https://github.com/Abhyansh616/School-Management-erp.git
cd School-Management-erp
npm install
```

Create `.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
FRONTEND_URL=http://localhost:3000
```

Then:

```bash
npm run seed
npm run dev
```

Open:

```text
http://localhost:3000/login
```

Development admin:

```text
Email: admin@schoolerp.com
Password: Admin@12345
```

---

# 27. Repository

GitHub:

https://github.com/Abhyansh616/School-Management-erp

---

# 28. Project Status

This project is developed as a School Management ERP academic/final assignment demonstrating:

* Full-stack web development
* MongoDB data modeling
* Authentication
* RBAC and ABAC
* Course management
* Attendance management
* Grade management
* Analytics
* CSV processing
* PDF generation
* WebSocket communication
* Real-time announcements
* Database relationships
* ER and sequence diagrams
* API development
* Security middleware

---

## Author

**Abhyansh Sinha**

School Management ERP
B.Tech CSE
