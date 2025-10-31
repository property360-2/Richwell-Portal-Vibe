# 🧱 Richwell College Portal – Database Schema (v2.0)
> Updated schema with ARCHIVE fields and correct section management logic.

---

## 1️⃣ USERS

Stores all system staff accounts — Dean, Registrar, Admission, Professors.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admission','registrar','dean','professor') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
````

---

## 2️⃣ STUDENTS

Holds all student data, including optional JSON document uploads.

```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sex VARCHAR(10),
  address TEXT,
  contact_no VARCHAR(30),
  course_id INT,
  year_level INT,
  status ENUM('new','current','transferee','irregular','dropped') DEFAULT 'new',
  documents JSON NULL,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL, -- FK to users.id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 3️⃣ COURSES

Represents academic programs managed by Deans.

```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  dean_id INT,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dean_id) REFERENCES users(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 4️⃣ SUBJECTS

Includes prerequisite relationships and archive capability.

```sql
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  units INT NOT NULL,
  course_id INT NOT NULL,
  year_level INT,
  semester INT,
  subject_type ENUM('major','minor') NOT NULL,
  prerequisite_id INT NULL,
  active BOOLEAN DEFAULT TRUE,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (prerequisite_id) REFERENCES subjects(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 5️⃣ SECTIONS

Created and managed by the Dean, referenced during enrollment.

```sql
CREATE TABLE sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  course_id INT NOT NULL,
  year_level INT NOT NULL,
  semester INT NOT NULL,
  professor_id INT NULL,
  slots INT DEFAULT 30,
  is_special BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,  -- Dean ID
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (professor_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 6️⃣ ASSIGNED_SUBJECTS

Dean assigns professors to subjects and sections.

```sql
CREATE TABLE assigned_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  professor_id INT NOT NULL,
  section_id INT NOT NULL,
  subject_id INT NOT NULL,
  term VARCHAR(20),
  year VARCHAR(9),
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES users(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 7️⃣ ENROLLMENTS

Connects students to subjects and sections.
Supports nullable `section_id` for irregular students.

```sql
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  section_id INT NULL,
  assigned_by ENUM('system','registrar','dean') DEFAULT 'system',
  term VARCHAR(20),
  year VARCHAR(9),
  grade DECIMAL(3,2) NULL,
  remarks VARCHAR(50) NULL,
  status ENUM('pending','enrolled','completed') DEFAULT 'pending',
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 8️⃣ INC_RECORDS

Tracks incomplete subjects and their resolution workflow.

```sql
CREATE TABLE inc_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id INT NOT NULL,
  issued_by INT NOT NULL, -- Professor
  issued_at DATE,
  deadline DATE,
  resolved_by INT NULL,   -- Registrar
  resolved_at DATE NULL,
  status ENUM('pending','for_registrar','resolved','expired') DEFAULT 'pending',
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  archived_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
  FOREIGN KEY (issued_by) REFERENCES users(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id),
  FOREIGN KEY (archived_by) REFERENCES users(id)
);
```

---

## 9️⃣ AUDIT_TRAIL

Centralized log of all system actions.

```sql
CREATE TABLE audit_trail (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id INT,
  old_value TEXT NULL,
  new_value TEXT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id)
);
```

---

## 🔟 SCHOOL_TERMS

Controls academic year and semester cycle.

```sql
CREATE TABLE school_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_year VARCHAR(9),
  semester INT,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ ARCHIVE BEHAVIOR SUMMARY

| Table               | Can Archive        | Can View Archives | Can Restore |
| ------------------- | ------------------ | ----------------- | ----------- |
| `students`          | Registrar          | Dean, Registrar   | Dean        |
| `courses`           | Dean               | Dean              | Dean        |
| `subjects`          | Dean               | Dean              | Dean        |
| `sections`          | Dean               | Dean, Registrar   | Dean        |
| `assigned_subjects` | Dean               | Dean              | Dean        |
| `enrollments`       | System / Registrar | Registrar         | Dean        |
| `inc_records`       | System             | Registrar         | Dean        |
| `users`             | Developer          | Developer         | Developer   |

All archived records remain visible only to authorized roles and are filtered out from all active queries.

---

## 🧾 FILTERING STANDARD

Every module must use:

```sql
SELECT * FROM table_name WHERE archived = FALSE;
```

Only **Dean and Registrar** dashboards may view or restore archived records:

```sql
SELECT * FROM table_name WHERE archived = TRUE;
```

---

## 🧮 AUDIT EXAMPLES

| actor     | action  | table    | record_id | old_value            | new_value          |
| --------- | ------- | -------- | --------- | -------------------- | ------------------ |
| Dean      | archive | subjects | 12        | `"archived":false`   | `"archived":true`  |
| Registrar | archive | students | 115       | `"status":"dropped"` | `"archived":true`  |
| Dean      | restore | sections | 7         | `"archived":true`    | `"archived":false` |

---

## 💾 Summary

* **No record deletion** anywhere in the system.
* All archive events log to `audit_trail`.
* Archived data only visible to Dean and Registrar (depending on table).
* Standardized archive columns across all major entities.
* Fully backward compatible with the v1.1 schema.
