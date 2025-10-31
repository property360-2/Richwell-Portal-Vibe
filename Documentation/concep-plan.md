## 🧩 Overview

The **Richwell College Portal** is a comprehensive academic system designed to handle every major academic process:

- Enrollment and subject advising
- Grade encoding and INC resolution
- Course and section management
- Transferee subject mapping
- Student analytics and academic tracking

The portal enforces a **no-deletion policy** — all records are archived, never deleted, ensuring full traceability and compliance with school documentation standards.

---

## 🏫 Objectives

- Automate enrollment and subject validation.
- Maintain academic integrity via INC policies.
- Implement flexible section management for irregular students.
- Log all system actions for transparency.
- Support analytics for each user without heavy backend load.
- Use a unified archive system instead of deletions.

---

## 👥 User Roles Overview

| Role             | Description                                                                                            | Access Level           |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- |
| 🏛️ **Dean**      | Manages subjects, sections, professors, and prerequisites. Has full archive access and restore rights. | Academic Administrator |
| 📚 **Registrar** | Handles transferees, INC resolutions, and can view archived students and enrollments.                  | Record Authority       |
| 🧍‍♂️ **Admission** | Manages enrollment intake; can only view active data (read-only sections).                             | Frontline Operator     |
| 🧑‍🏫 **Professor** | Encodes grades and resolves INCs within allowed timeframe.                                             | Faculty User           |
| 👨‍🎓 **Student**   | Views enrolled subjects, grades, INCs, and personal analytics.                                         | End User               |

---

## 🧠 System Flow

```

[Dean] → Creates Subjects, Sections, Assigns Professors
↓
[Admission] → Handles Enrollment & Advising (read-only access to sections)
↓
[Registrar] → Maps Transferees, Confirms INC Resolutions
↓
[Professor] → Encodes Grades, Resolves INC (within allowed timeframe)
↓
[Student] → Views Records, Grades, INC Status, Analytics

```

---

## 🏛️ Admission

### Purpose

Handles **student enrollment**, **subject advising**, and **account generation**.  
Operates **locally (LAN/localhost only)** using **Kiosk Mode**.

### Flow

1. **Admission Login** → `/admission/login`
2. **Open Enrollment Form** (Fullscreen, no navbar)
3. Student selects type:
   - **New Student**
   - **Current Student**
   - **Transferee**
4. **System Behavior:**
   - **New Student:** Auto-assigns subjects, random or Dean-assigned section.
   - **Current Student:** Fetches existing info → shows eligible subjects → allows section selection.
   - **Transferee:** Data encoded, forwarded to Registrar for subject validation.
5. **Confirmation Modal:**
   - Shows input data, assigned subjects, warning message before confirm.
6. **Account Generation:**
   - Auto-creates username & temp password.
7. **Slot System:**
   - Each section has limited slots (`sections.slots` decrements after confirmation).

### Access

- Read-only access to sections.
- Cannot create, edit, or archive sections.

---

## 📚 Registrar

### Purpose

Handles **transferee subject mapping**, **INC resolution confirmation**, and **student archiving**.

### Core Functions

1. **Transferee Mapping:**
   - Maps credited subjects from TOR.
   - Generates student account upon final validation.
2. **INC Resolution:**
   - Confirms grades from professors.
   - Marks INC as resolved or expired.
3. **Archive Authority:**
   - Can archive students (`status='dropped'` or graduated).
   - Can view archived students and enrollments (read-only).

### INC Policy

| Subject Type | Time Limit | Action                  |
| ------------ | ---------- | ----------------------- |
| Minor        | 6 months   | Mark as repeat required |
| Major        | 1 year     | Mark as repeat required |

---

## 🧑‍🏫 Professor

### Purpose

Encodes grades, resolves INCs, and views class sections.

### Core Functions

- **View Assigned Subjects** (Dean-controlled)
- **Encode Grades** (edit-only, no delete, only 1.0,1.25,1.5,1.75,2.0,2.25,2.5,2.75,3.0 and inc)
- **Resolve INCs** within valid timeframes.
- **View Students** in their section.
- **Request Section Transfer** (sent to Registrar).
- **Frontend Analytics** (no backend table):
  - Grade distribution
  - Pass/Fail rate
  - INC resolution ratio
- **Audit Trail** logs all edits and updates.

### Restrictions

- Cannot add/delete students.
- Cannot manage sections.
- Cannot view archived data.

---

## 🎓 Dean

### Purpose

Academic head; manages **subjects**, **courses**, **sections**, **faculty assignments**, and **prerequisites**.

### Core Functions

- **Create/Edit/Archive:**
  - Courses
  - Subjects
  - Sections
  - Assigned Subjects
- **Assign Professors** to sections.
- **Add Prerequisites** to subjects.
- **View Analytics:**
  - Pass rates
  - Faculty loads
  - INC trends
- **Restore Archives** when needed.

### Section Management Logic

| Action          | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| Create Section  | Dean inputs section info, assigns professor, sets slot count. |
| Archive Section | Marks section closed or merged.                               |
| Restore Section | Reopens archived section if needed.                           |
| Access          | Only Dean and Registrar can view archived sections.           |

---

## 👨‍🎓 Student

### Purpose

End-user interface for viewing academic records and progress.

### Core Features

- **Login:** From auto-generated credentials.
- **Dashboard:**
  - Displays subjects, average grade, and active INCs.
  - Shows warnings for unresolved or expired INCs.
- **Filter by Year & Semester** to view history.
- **Personal Analytics (Frontend Only):**
  - Grade Distribution Chart
  - GPA per Term
  - Academic Trend
  - INC Summary
- **Editable:** Username and Password only.

### Restrictions

- Cannot modify grades or sections.
- Cannot see archived records.

---

## ⚙️ Archive System (No Delete Policy)

### Core Rule

> No records are ever deleted.  
> Everything is marked as `archived = true` and remains accessible for authorized users.

### Common Archive Columns

```sql
archived BOOLEAN DEFAULT FALSE,
archived_at TIMESTAMP NULL,
archived_by INT NULL
```

### Who Can See Archives

| Role      | Access                             | Restore Rights |
| --------- | ---------------------------------- | -------------- |
| Dean      | ✅ Full                            | ✅ Can restore |
| Registrar | ✅ Partial (students, enrollments) | ❌ View-only   |
| Admission | ❌ None                            | ❌ None        |
| Professor | ❌ None                            | ❌ None        |
| Student   | ❌ None                            | ❌ None        |

### Auto Filters

All active queries must include:

```sql
WHERE archived = FALSE
```

Dean and Registrar dashboards may include a toggle:

```sql
WHERE archived = TRUE
```

---

## 🧱 Database Highlights

| Table               | Description                         | Archive Enabled |
| ------------------- | ----------------------------------- | --------------- |
| `users`             | System staff accounts               | ✅              |
| `students`          | Student info + documents (JSON)     | ✅              |
| `courses`           | Academic programs                   | ✅              |
| `subjects`          | Curriculum subjects + prerequisites | ✅              |
| `sections`          | Dean-created sections               | ✅              |
| `assigned_subjects` | Professor–Section mapping           | ✅              |
| `enrollments`       | Student–Subject link                | ✅              |
| `inc_records`       | INC tracking                        | ✅              |
| `audit_trail`       | Action logs                         | ❌              |
| `school_terms`      | Academic cycle                      | ❌              |

---

## 🧩 JSON Field (Student Documents)

`students.documents` (nullable JSON)

```json
{
  "birth_certificate": {
    "filename": "birthcert_2025-0112.pdf",
    "url": "https://drive.google.com/.../view",
    "verified": true,
    "uploaded_at": "2025-10-31T10:32:00Z"
  },
  "form137": {
    "filename": "form137_2025-0112.pdf",
    "verified": false
  }
}
```

- Used for optional document uploads.
- Ready for future cloud integration (e.g., Google Drive, Cloudinary).

---

## 🧾 Audit Trail

Every add/edit/archive action is logged:

```sql
actor_id INT,
action VARCHAR(50),
table_name VARCHAR(50),
record_id INT,
old_value TEXT,
new_value TEXT,
timestamp TIMESTAMP
```

### Examples

| Actor     | Action  | Table    | Record ID | Change         |
| --------- | ------- | -------- | --------- | -------------- |
| Dean      | archive | subjects | 45        | archived=true  |
| Registrar | archive | students | 118       | dropped=true   |
| Dean      | restore | sections | 12        | archived=false |

---

## 🔒 Access Rules Summary

| Role      | Core Permissions                                        | Archive Access |
| --------- | ------------------------------------------------------- | -------------- |
| Dean      | Full management (create/edit/archive/restore)           | ✅ Full        |
| Registrar | Transferee mapping, INC confirmation, student archiving | ✅ Partial     |
| Admission | Enrollment intake (read-only sections)                  | ❌ None        |
| Professor | Encode grades, resolve INC                              | ❌ None        |
| Student   | View grades, analytics                                  | ❌ None        |

---

## 💡 System Highlights

- **Archive System** → No deletion; all archived actions logged.
- **Frontend Analytics** → Lightweight and dynamic.
- **INC Auto-Policy** → 6 months (minor) / 1 year (major).
- **Nullable Section IDs** → For irregular or transferee enrollments.
- **JSON Documents** → Future-proof for file integration.
- **Strict 30-Unit Cap** → Enforced on enrollment.
- **Kiosk Mode Admission** → Localhost access only.

---

## 🧠 Tech Stack (Suggested)

| Layer      | Stack                         |
| ---------- | ----------------------------- |
| Backend    | Node.js / Express or NestJS   |
| ORM        | Prisma                        |
| Database   | MySQL or PostgreSQL           |
| Frontend   | React + Tailwind              |
| Auth       | JWT / Session-based           |
| Deployment | Modular, LAN + Web compatible |

---

## ✅ Summary

The **Richwell College Portal v2.0** introduces:

- A stable academic flow per department.
- Centralized section control (Dean-managed only).
- Transparent archive system for record-keeping.
- Strict user access boundaries.
- Scalable, normalized schema ready for integration.
