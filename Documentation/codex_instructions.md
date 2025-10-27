# Codex Master Instruction

You are Codex AI Assistant.
Follow this document to build the “Richwell College Portal” system.
Work strictly *phase by phase* using the “phases.md” section.
After finishing a phase, wait for my command: **"Next Phase"** before continuing.

Output only working code or shell commands as needed — no explanations unless asked.



Documentation\college-enrollment-form.md
Here’s your **College Enrollment Form** formatted in clean **Markdown (MD)** style for your portal documentation or system prototype:

---

# 🏫 College Enrollment Form

**Instruction:** Fill out this Enrollment Form and submit it to the Admission Staff.

---

### 📋 Learner Information

* **Learner Reference Number (LRN):**
* **School Year:** 20___ - 20___
* **Year Level:**

  * [ ] First Year
  * [ ] Second Year
  * [ ] Third Year
  * [ ] Fourth Year
  
* **Student Type:**

  * [ ] New Student
  * [ ] Transferee
  * [ ] Old Student
* **Semester:**

  * [ ] 1st Semester
  * [ ] 2nd Semester

---

### 🎓 College Courses

* [ ] Bachelor of Science in Accounting and Information System
* [ ] Bachelor of Science in Information System
* [ ] Bachelor of Science in Civil Engineering
* [ ] Bachelor of Early Childhood Education
* [ ] Bachelor of Science in Entrepreneurship
* [ ] Bachelor of Technical-Vocational Teacher Education
* [ ] Bachelor of Science in Tourism Management
* [ ] Bachelor of Science in Criminology
* [ ] Bachelor of Science in Nursing

---

### 👤 Personal Information

| Field                          | Details                                              |
| ------------------------------ | ---------------------------------------------------- |
| **Last Name**                  |                                                      |
| **First Name**                 |                                                      |
| **Middle Name**                |                                                      |
| **Extension**                  |                                                      |
| **Date of Birth (mm/dd/yyyy)** |                                                      |
| **Place of Birth**             |                                                      |
| **Gender**                     | [ ] Male [ ] Female                                  |
| **Civil Status**               | [ ] Single [ ] Married [ ] Widowed [ ] Solo Parent   |
| **Address**                    | House No./Street Barangay Municipality/City Province |
| **Religion**                   |                                                      |
| **Citizenship**                |                                                      |
| **Contact Number**             |                                                      |
| **Email Address**              |                                                      |
| **Facebook Account**           |                                                      |

---

### 👪 Family Background

| Relationship                  | Last Name | First Name | Middle Name | Age | Occupation | Contact No. |
| ----------------------------- | --------- | ---------- | ----------- | --- | ---------- | ----------- |
| **Father**                    |           |            |             |     |            |             |
| **Mother (Maiden Name)**      |           |            |             |     |            |             |
| **Guardian**                  |           |            |             |     |            |             |
| **Relationship to Guardian:** |           |            |             |     |            |             |

---

### 🏫 Educational Background

| Level                                | Name of School | Address | School Year |
| ------------------------------------ | -------------- | ------- | ----------- |
| **Elementary**                       |                |         |             |
| **Junior High School**               |                |         |             |
| **Senior High School**               |                |         |             |
| **Previous School (for Transferee)** |                |         |             |

---

### 💡 Additional Information

**Is your family a beneficiary of 4Ps?**

* [ ] Yes [ ] No
  If *Yes*, write your 4Ps Household ID Number below:
  `_________________________________`

**Is the student a Learner with Disability?**

* [ ] Yes [ ] No

If *Yes*, specify the type of disability:

* [ ] Visual Impairment
* [ ] Hearing Impairment
* [ ] Autism Spectrum Disorder
* [ ] Speech/Language Disorder
* [ ] Learning Disability
* [ ] Cerebral Palsy
* [ ] Intellectual Disability
* [ ] Orthopedic/Physical Handicap
* [ ] Emotional-Behavioral Disorder
* [ ] Multiple Disorder
* [ ] Cancer
* [ ] Special Health Problem / Chronic Disease

---

### ✅ Certification

I hereby certify that all the above information is true and correct. Any misinformation shall serve as ground for the nullification of my enrollment at **Richwell Colleges, Incorporated.**

**Signature over Printed Name:**
`________________________________`

---

### 📣 Where Did You Hear About Us?

* [ ] Referral
* [ ] Online (Facebook, YouTube, etc.)
* [ ] Richwell Student
* [ ] Print Ads (Billboard, Flyers, etc.)
* [ ] Richwell Partners
* [ ] Career Guidance
* [ ] Online Cultural Competition
* [ ] Others (please specify): ___________________________

---

# **School Portal Development Phases (Full, Local Hosting Version)**

---

## **Phase 0: Planning & Requirements Gathering** Done

**Goal:** Define system scope and rules before coding.

1. Meet with stakeholders: Registrar, Dean, Admission, Professors, Students.
2. Create **user stories per role**:

   * **Students:** enroll, view grades, GPA, INC tracking.
   * **Professors:** encode grades, view sections, manage INCs.
   * **Registrar:** create sections, approve grades, enrollment analytics.
   * **Admission:** handle enrollment workflow.
   * **Dean:** assign professors, monitor academic performance.
3. Define **system rules**:

   * Max 30 units per semester
   * INC restrictions and year standing rules
   * Repeat logic (major/minor)
   * Prerequisite checks
4. Draft **ERD & database schema** (core + optional tables).
5. Identify **pre-built reusable components**:

   * Buttons, modals, tables, dropdowns, alerts, cards, charts.

---

## **Phase 1: Local Development Setup** 

**Goal:** Prepare dev environment and project structure.

1. Initialize **Node.js + Express** backend project.
2. Initialize **React + Tailwind** frontend project.
3. Install **ORM** (Prisma or TypeORM) for DB connection.
4. Install **Postman** for API testing.
5. Set up **local MySQL/MariaDB** database.
6. Create **reusable component folder** in React:

   ```
   /components
     Button.jsx
     Modal.jsx
     Table.jsx
     InputField.jsx
     Dropdown.jsx
     Chart.jsx
     DashboardCard.jsx
   ```
7. Configure **environment variables** (`.env`) for DB connection and auth.

---

## **Phase 2: Authentication & Role Management**

**Goal:** Secure login with role-based access.

1. Backend: implement **login/logout, session management**, JWT optional.
2. Frontend: use reusable **LoginForm**, **InputField**, **Alert** components.
3. Role-based middleware:

   * Students → dashboard & enrollment
   * Professors → grade entry + sections
   * Registrar → enrollment approvals
   * Admission → enrollment workflow
   * Dean → assignments & analytics
4. Password hashing & reset flows.
5. Test login for all roles locally.

---

## **Phase 3: Academic Data Management**

**Goal:** Manage programs, subjects, sections, and terms.

1. **Programs CRUD** → use Table, Modal, Button components.
2. **Subjects CRUD** → manage `year_standing` (nullable), prerequisites.
3. **Sections CRUD** → assign professors, max slots, schedule.
4. **Academic Terms CRUD** → create active semester/year.
5. Test all CRUD operations on local server.

---

## **Phase 4: Enrollment System**

**Goal:** Build full student enrollment workflow.

1. Registrar creates sections.
2. Admission opens enrollment form.
3. Student enrollment workflow:

   * Recommended subjects per semester
   * Add/drop subjects (≤30 units)
   * Validate prerequisites, year standing, INCs
   * Validate section slot availability
   * Summary modal → oath modal → confirm
   * Auto-generate student ID & password for new students
4. Save enrollment data to `enrollments` and `enrollment_subjects`.
5. Update **admission dashboard analytics**.
6. Test workflows locally:

   * Regular vs irregular students
   * INC blocking
   * Max units enforcement
   * Section slot limits

---

## **Phase 5: Grades Management**

**Goal:** Enter, approve, and view grades with INC & repeat logic.

1. Professors enter grades using **GradeTable** (dropdown only).
2. Students view grades (current & past) + GPA summary.
3. INC resolution workflow:

   * Students see INCs
   * Professors enter resolved grade
   * Registrar approves after completion form
4. Repeat logic:

   * Major → repeat after 6 months
   * Minor → repeat after 1 year
5. Validate all grades → only valid dropdown values.
6. Test complete workflow locally.

---

## **Phase 6: Analytics & Dashboard**

**Goal:** Role-based data visualization.

1. Backend APIs for summaries per role.
2. Frontend reusable components:

   * **Chart** (Recharts / Chart.js)
   * **DashboardCard**
3. Dashboards:

   * Students → GPA + INCs
   * Professors → class averages + INCs
   * Registrar → enrollment stats + pending approvals
   * Admission → applicant trends
   * Dean → professor load + course performance
4. Ensure dashboards are **elderly-friendly**, mobile responsive.

---

## **Phase 7: Frontend UI/UX**

**Goal:** Create consistent, reusable, user-friendly interface.

1. Use pre-built **Button, Modal, Table, InputField, Dropdown, Card** components.
2. Ensure **consistent color scheme, spacing, typography** (Tailwind).
3. Implement **form validation**, warnings for rules (INC, max units).
4. Test UI on multiple devices over local Wi-Fi.

---

## **Phase 8: Validation & Testing**

**Goal:** Ensure system correctness.

1. Unit tests → backend functions (enrollment, grades, repeat rules).
2. Integration tests → full workflow: enrollment → grades → INC → repeat.
3. Frontend tests → reusable components (forms, tables, modals).
4. Edge case tests:

   * INC blocking for year-standing subjects
   * Max 30 units per semester
   * Section slot limits
   * Repeat eligibility dates

---

## **Phase 9: Local Deployment**

**Goal:** Make portal accessible over school Wi-Fi.

1. Deploy Node.js + MySQL on **local school server/computer**.
2. Serve React frontend via Node.js or static files.
3. Configure **local IP** (e.g., `http://192.168.1.xxx:3000`) for Wi-Fi access.
4. Set **static IP** to prevent IP changes.
5. Test full system on multiple devices in the local network.
6. Regular **database backup** on local storage.

---

## **Phase 10: Maintenance & Updates**

**Goal:** Keep the system stable and extendable.

1. Monitor server logs for errors.
2. Fix bugs and improve features.
3. Update reusable components consistently.
4. Daily/weekly database backups.
5. Collect feedback for UI/UX improvements.
6. Add optional modules later:

   * Notifications
   * Advanced BI dashboards
   * Scheduling system

---
## 🧠 **1. System Overview**

**System Name (placeholder):** Richwell College Portal
**Goal:** Unified web-based portal for enrollment, grades, and analytics.

### 🎯 **Primary Roles**

| Role          | Core Function                                                      |
| ------------- | ------------------------------------------------------------------ |
| **Student**   | Enrollment, grades, INC/resolution, GPA summary                    |
| **Professor** | Encode grades, manage sections, analytics for classes              |
| **Registrar** | Manage sections, approve grades, official records, analytics       |
| **Admission** | Manage enrollment workflow, applicant tracking, analytics          |
| **Dean**      | Assign professors, manage schedules, academic oversight, analytics |

---

## 🧩 **2. System Modules (Functional Breakdown)**

### 🏫 **A. Authentication & Roles**

* Login system (Email/ID + Password)
* Role-based access control (RBAC)
* Password setup for new students after enrollment
* Reset password (email or OTP-based)

---

### 📝 **B. Enrollment Management**

#### Flow:

1. **Registrar** creates sections (linked to professors, subjects, slots)
2. **Admission** opens enrollment UI
3. **Applicant/Student**:

   * Fills form
   * Auto-recommended subjects per sem
   * Can add subjects (≤30 units)
   * System validates prerequisites + INCs
   * Shows available sections with slots
   * Modal summary → oath modal → confirm
   * If new student → generates Student ID + password setup
4. **Admission Dashboard** updates summary analytics automatically

#### Rules:

* INC or failed prerequisite → cannot enroll related subject
* INC last sem (core subject) → blocks related subject
* Slot limit per section (updates dynamically)
* Regular = choose section; Irregular = choose subject per section

---

### 🧾 **C. Grades Management**

#### Professor Side:

* View assigned sections
* CRUD grades per student
* Dropdown-only input for grades:

  ```
  [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0, INC, DRP]
  ```
* Analytics: grade distribution, class average, INC count

#### Registrar Side:

* Approve updated grades after completion form
* Override if correction requested (with log tracking)
* Generate transcript/report summary

#### Student Side:

* View grades (per sem + all time)
* See GPA summary and INC subjects

---

### 🧾 **D. INC Resolution**

1. Student sees INCs on dashboard.
2. Student + Professor meet.
3. Professor encodes updated grade.
4. Registrar verifies via physical form → approves update.
5. System updates official grade record.

✅ Digital workflow + real-world paper validation supported.

---

### 📚 **E. Subject & Repeat Logic**

* Each subject tagged as **major** or **minor**
* Repeat rules:

  | Type      | Repeat After | Example                                     |
  | --------- | ------------ | ------------------------------------------- |
  | **Major** | 6 months     | Failed in 1st sem → can retake 2nd sem      |
  | **Minor** | 1 year       | Failed in 1st sem → retake next school year |
* System auto-computes `repeat_eligible_date` when a student fails a subject.
* Enrollment form checks eligibility date before allowing re-enroll.

---

### 📊 **F. Analytics & BI Dashboards**

**Accessible to:** Dean, Registrar, Admission, Professors (basic), Students (summary)

| Role          | Analytics Type                                            |
| ------------- | --------------------------------------------------------- |
| **Dean**      | Prof/Section load, subject performance, course pass rate  |
| **Registrar** | Enrollment stats, completion reports, grade distributions |
| **Admission** | Applicant/enrollee trends, per-course totals              |
| **Professor** | Grade distribution, class averages, INC tracking          |
| **Student**   | GPA + INC summary only (no charts)                        |

✅ Implement using **Chart.js / Recharts** for interactive charts.

---

### ⚙️ **G. System Settings (Admin or Registrar only)**

* Manage academic year/semester
* Add/edit programs, subjects, professors, and courses
* Set enrollment period (open/close dates)
* System logs (activity tracking)

---

## 🧩 **3. Database Design (Preview of Core Tables)**

| Table             | Key Columns                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `users`           | user_id, name, email, password, role                                               |
| `students`        | student_id, user_id (FK), program_id, year_level, status                           |
| `professors`      | professor_id, user_id (FK), department                                             |
| `subjects`        | subject_id, code, name, units, subject_type (major/minor), prerequisite_id         |
| `sections`        | section_id, name, professor_id, subject_id, max_slots, semester                    |
| `enrollments`     | enrollment_id, student_id, section_id, status, date_enrolled                       |
| `grades`          | grade_id, enrollment_id, value, remarks, date_encoded, approved (bool)             |
| `inc_resolutions` | resolution_id, student_id, subject_id, old_grade, new_grade, approved_by_registrar |
| `analytics_logs`  | id, user_id, action, timestamp                                                     |
| `academic_terms`  | term_id, school_year, semester, active (bool)                                      |

---

## 💻 **4. Tech Stack Suggestion**

| Layer          | Tech                                        |
| -------------- | ------------------------------------------- |
| **Frontend**   | React (with Tailwind UI + Recharts)         |
| **Backend**    | Node.js (Express) or Laravel (PHP)          |
| **Database**   | MySQL / PostgreSQL                          |
| **Auth**       | JWT or Session-based                        |
| **Hosting**    | Render, Vercel, or school’s local server    |
| **BI/Reports** | Chart.js, Recharts, or Power BI integration |

---

## 📆 **5. Development Roadmap**

| Phase | Module       | Description                                |
| ----- | ------------ | ------------------------------------------ |
| **1** | Auth & Roles | Basic login + access levels                |
| **2** | Enrollment   | Section creation → student enrollment flow |
| **3** | Grades       | Professor CRUD + registrar approval        |
| **4** | INC & Repeat | Resolution and repeat rules                |
| **5** | Analytics    | Dashboards per role                        |
| **6** | Polish       | UI design, modals, logs, testing           |


## 🧩 **1. Core Entity List**

We’ll divide it by function to keep things clean.

### 🧠 **A. User & Role Management**

| Table     | Purpose                                                             |
| --------- | ------------------------------------------------------------------- |
| **users** | Master account table for login/authentication                       |
| **roles** | Defines user roles (student, professor, registrar, admission, dean) |

---

### 🎓 **B. Student & Professor Info**

| Table          | Purpose                                     |
| -------------- | ------------------------------------------- |
| **students**   | Student-specific data (linked to `users`)   |
| **professors** | Professor-specific data (linked to `users`) |

---

### 📘 **C. Academic & Curriculum Data**

| Table              | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| **programs**       | Course or degree programs (e.g., BSCS, BSEd)               |
| **subjects**       | All subjects offered (with type, units, and prerequisites) |
| **sections**       | Section groups per subject, linked to professors           |
| **academic_terms** | Defines semester and school year info                      |

---

### 🧾 **D. Enrollment & Grades**

| Table                   | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| **enrollments**         | Tracks student enrollment per term              |
| **enrollment_subjects** | Subjects the student takes per enrollment       |
| **grades**              | Records grades per student per subject          |
| **inc_resolutions**     | For tracking incomplete (INC) grade completions |

---

### 📊 **E. Analytics & Logs**

| Table              | Purpose                                     |
| ------------------ | ------------------------------------------- |
| **analytics_logs** | For BI/tracking actions or summary data     |
| **activity_logs**  | System logs for auditing actions (optional) |

---

## 🧱 **2. Table Structure Overview**

### 🧩 `roles`

| Column      | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `role_id`   | INT (PK) | Unique ID                                           |
| `role_name` | VARCHAR  | e.g. student, professor, registrar, admission, dean |

---

### 🧩 `users`

| Column       | Type                      | Description |
| ------------ | ------------------------- | ----------- |
| `user_id`    | INT (PK)                  |             |
| `email`      | VARCHAR                   |             |
| `password`   | VARCHAR                   |             |
| `role_id`    | INT (FK → roles.role_id)  |             |
| `status`     | ENUM('active','inactive') |             |
| `created_at` | DATETIME                  |             |

---

### 🧩 `students`

| Column       | Type                                   | Description |
| ------------ | -------------------------------------- | ----------- |
| `student_id` | INT (PK)                               |             |
| `user_id`    | INT (FK → users.user_id)               |             |
| `student_no` | VARCHAR (unique)                       |             |
| `program_id` | INT (FK → programs.program_id)         |             |
| `year_level` | INT                                    |             |
| `gpa`        | DECIMAL(3,2)                           |             |
| `has_inc`    | BOOLEAN                                |             |
| `status`     | ENUM('regular','irregular','inactive') |             |

---

### 🧩 `professors`

| Column              | Type                          | Description |
| ------------------- | ----------------------------- | ----------- |
| `professor_id`      | INT (PK)                      |             |
| `user_id`           | INT (FK → users.user_id)      |             |
| `department`        | VARCHAR                       |             |
| `employment_status` | ENUM('full-time','part-time') |             |

---

### 🧩 `programs`

| Column         | Type     | Description |
| -------------- | -------- | ----------- |
| `program_id`   | INT (PK) |             |
| `program_name` | VARCHAR  |             |
| `program_code` | VARCHAR  |             |
| `description`  | TEXT     |             |

---

### 🧩 `subjects`

| Column                 | Type                                       | Description                                  |
| ---------------------- | ------------------------------------------ | -------------------------------------------- |
| `subject_id`           | INT (PK)                                   |                                              |
| `code`                 | VARCHAR(20)                                | e.g., “AOOP101”                              |
| `name`                 | VARCHAR(100)                               |                                              |
| `units`                | INT                                        |                                              |
| `subject_type`         | ENUM('major','minor')                      |                                              |
| `year_standing`        | ENUM('1st','2nd','3rd','4th') **NULLABLE** | If null → no year restriction                |
| `recommended_year`     | ENUM('1st','2nd','3rd','4th') **NULLABLE** | The year this subject is recommended for     |
| `recommended_semester` | ENUM('1st','2nd','summer') **NULLABLE**    | The semester this subject is recommended for |
| `program_id`           | INT (FK → programs.program_id)             |                                              |
| `prerequisite_id`      | INT NULL (FK → subjects.subject_id)        |                                              |

---

### 🧩 `sections`

| Column            | Type                               | Description |
| ----------------- | ---------------------------------- | ----------- |
| `section_id`      | INT (PK)                           |             |
| `name`            | VARCHAR                            |             |
| `subject_id`      | INT (FK → subjects.subject_id)     |             |
| `professor_id`    | INT (FK → professors.professor_id) |             |
| `max_slots`       | INT                                |             |
| `available_slots` | INT                                |             |
| `semester`        | VARCHAR                            |             |
| `school_year`     | VARCHAR                            |             |
| `schedule`        | VARCHAR                            |             |
| `status`          | ENUM('open','closed')              |             |

---

### 🧩 `academic_terms`

| Column        | Type                       | Description |
| ------------- | -------------------------- | ----------- |
| `term_id`     | INT (PK)                   |             |
| `school_year` | VARCHAR (e.g. "2025-2026") |             |
| `semester`    | ENUM('1st','2nd','summer') |             |
| `is_active`   | BOOLEAN                    |             |

---

### 🧩 `enrollments`

| Column          | Type                                    | Description |
| --------------- | --------------------------------------- | ----------- |
| `enrollment_id` | INT (PK)                                |             |
| `student_id`    | INT (FK → students.student_id)          |             |
| `term_id`       | INT (FK → academic_terms.term_id)       |             |
| `date_enrolled` | DATETIME                                |             |
| `total_units`   | INT                                     |             |
| `status`        | ENUM('pending','confirmed','cancelled') |             |

---

### 🧩 `enrollment_subjects`

| Column          | Type                                 | Description |
| --------------- | ------------------------------------ | ----------- |
| `id`            | INT (PK)                             |             |
| `enrollment_id` | INT (FK → enrollments.enrollment_id) |             |
| `section_id`    | INT (FK → sections.section_id)       |             |
| `subject_id`    | INT (FK → subjects.subject_id)       |             |
| `units`         | INT                                  |             |

---

### 🧩 `grades`

| Column                  | Type                                                                                    | Description |
| ----------------------- | --------------------------------------------------------------------------------------- | ----------- |
| `grade_id`              | INT (PK)                                                                                |             |
| `enrollment_subject_id` | INT (FK → enrollment_subjects.id)                                                       |             |
| `grade_value`           | ENUM('1.0','1.25','1.5','1.75','2.0','2.25','2.5','2.75','3.0','4.0','5.0','INC','DRP') |             |
| `remarks`               | VARCHAR                                                                                 |             |
| `encoded_by`            | INT (FK → professors.professor_id)                                                      |             |
| `approved`              | BOOLEAN                                                                                 |             |
| `date_encoded`          | DATETIME                                                                                |             |
| `repeat_eligible_date`  | DATE (auto-calculated for failed/INC subjects)                                          |             |

---

### 🧩 `inc_resolutions`

| Column                  | Type                               | Description |
| ----------------------- | ---------------------------------- | ----------- |
| `resolution_id`         | INT (PK)                           |             |
| `student_id`            | INT (FK → students.student_id)     |             |
| `subject_id`            | INT (FK → subjects.subject_id)     |             |
| `old_grade`             | ENUM(‘INC’)                        |             |
| `new_grade`             | ENUM('1.0','1.25',...,'5.0')       |             |
| `professor_id`          | INT (FK → professors.professor_id) |             |
| `approved_by_registrar` | BOOLEAN                            |             |
| `date_submitted`        | DATETIME                           |             |

---

### 🧩 `analytics_logs`

| Column        | Type                     | Description |
| ------------- | ------------------------ | ----------- |
| `log_id`      | INT (PK)                 |             |
| `user_id`     | INT (FK → users.user_id) |             |
| `action`      | VARCHAR                  |             |
| `description` | TEXT                     |             |
| `timestamp`   | DATETIME                 |             |

---

## 🧮 **3. ERD Relationships (Summary View)**

```
roles ───< users ───< students
                 └───< professors

programs ───< subjects ───< sections
                     ↑         ↑
                     └───< grades ───< inc_resolutions

academic_terms ───< enrollments ───< enrollment_subjects ───< grades

students ───< enrollments
professors ───< sections
registrar/admission (via users.role)
```

-