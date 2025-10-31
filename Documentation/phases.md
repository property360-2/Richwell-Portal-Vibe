# 🧭 Richwell College Portal – Development Phases (v2.0)
> Official project roadmap for system implementation based on Concept Plan v2.0.

---

## ⚙️ Development Overview

The project will be built modularly to ensure stability, scalability, and ease of maintenance.  
Each phase represents a milestone layer — from foundation setup to full academic automation.  

---

# 🏗️ Phase 1: Database & Core Backend Setup

### 🎯 Objective
Establish the foundation for data integrity and backend communication using Prisma ORM and Express/NestJS.

### 🧱 Key Tasks
1. **Database Initialization**
   - Create all tables defined in Schema v2.0.
   - Add constraints, relationships, and indexes.
   - Ensure cascade rules and foreign key integrity.

2. **Prisma Setup**
   - Initialize `prisma/schema.prisma`.
   - Define all models with enums and JSON fields.
   - Generate migrations:
     ```bash
     npx prisma migrate dev --name init
     ```

3. **Seed Data**
   - Create default roles:
     - Dean, Registrar, Admission, Professor
   - Create sample course, subjects, and a sample term.

4. **Global Middleware**
   - Input validation (Zod or Joi).
   - Global error handler.
   - Response wrapper (status + message + payload).
   - Logger (winston/pino).

5. **Audit Trail Middleware**
   - Intercept every `POST/PUT/PATCH/ARCHIVE`.
   - Store actor, action, and delta (old/new value).

6. **Testing**
   - Verify schema joins and cascading.
   - Test audit trail inserts per table.

### ✅ Deliverables
- Working database + Prisma migration.
- Connected backend API with CRUD for each major entity.
- Basic audit trail auto-logging.
- Documentation for all Prisma models.

---

# 🔐 Phase 2: Authentication & Role-Based Access Control (RBAC)

### 🎯 Objective
Implement secure login and role isolation across the system.

### 🔑 Key Tasks
1. **JWT Authentication**
   - Login route for `users` and `students`.
   - Token-based session validation.
   - Refresh token setup (optional).

2. **RBAC Middleware**
   - Restrict endpoints by role:
     ```ts
     if (user.role !== 'dean') return 403;
     ```

3. **Password Handling**
   - Hash passwords via bcrypt.
   - Default password generation for new accounts.

4. **User Management**
   - CRUD for `users` (Dean only).
   - Role assignment restrictions.

5. **Session Timeout / Localhost Limitation**
   - Admission portal limited to local IP range.
   - Auto logout after inactivity.

6. **Testing**
   - Validate JWT across all endpoints.
   - Ensure unauthorized roles can’t access others’ data.

### ✅ Deliverables
- Authenticated routes for all user types.
- Protected REST API per role.
- Token-based login flow for both `users` and `students`.

---

# 🧾 Phase 3: Enrollment, Advising & Academic Core

### 🎯 Objective
Build the functional academic workflow — enrollment, subject validation, and section control.

### 🧱 Key Modules

#### 🏛️ Admission Module
- Localhost-only access (Kiosk Mode).
- Enrollment form:
  - New Student
  - Current Student
  - Transferee
- Auto-generate accounts after confirmation.
- Section selection with slot decrement.
- Auto-validate subject eligibility and unit cap (≤30 units).

#### 📚 Registrar Module
- Transferee subject mapping.
- INC confirmation workflow.
- Manual assignment for irregular students (nullable `section_id`).
- Student archiving (e.g., dropped, graduated).

#### 🧑‍🏫 Professor Module
- View assigned sections.
- Encode grades.
- Resolve INC (based on policy).
- View and search student list per term.

#### 🏛️ Dean Module
- Section management:
  - Create / Edit / Archive / Restore.
- Subject management:
  - Add / Edit / Archive subjects.
  - Assign prerequisites.
- Faculty assignment (link subjects → professors).
- Course management (add/edit).

#### 👨‍🎓 Student Module
- Dashboard (subjects, grades, INCs).
- Year/Sem filter.
- Account management (change password).
- View-only access to records.

---

### ⚙️ Functional Integrations
- Audit trail auto-logs all CRUD/Archive actions.
- INC deadline generator:
  ```js
  deadline = subject_type === "major" 
    ? addMonths(12) 
    : addMonths(6);
````

* Automated section slot decrement on enrollment.

---

### ✅ Deliverables

* Fully functional enrollment + subject advising system.
* All user dashboards operational.
* Stable backend APIs ready for frontend binding.
* All archive actions functioning and logged.

---

# 📊 Phase 4: Analytics, Automation & Archiving

### 🎯 Objective

Introduce computed analytics, auto-archiving, and internal automation.

### ⚙️ Analytics (Frontend-based)

| Role      | Analytics                                           |
| --------- | --------------------------------------------------- |
| Dean      | Pass rates, faculty loads, INC trends               |
| Registrar | INC resolution status, active vs. archived students |
| Professor | Grade distribution, class performance               |
| Student   | GPA trend, INC summary                              |

### 🤖 Automation Add-ons

1. **Auto-Archiver**

   * Archives old terms, sections, and expired INCs automatically.
   * Triggered via cron job or term switch.

2. **Bulk Sectioning**

   * Dean/Registrar assigns sections to multiple students.
   * Backend logic handles slot updates + audit logging.

3. **Auto Resectioning (Future Integration)**

   * Automatically reassigns students if section slots exceed limit.

4. **Forecasting (Optional Future AI Module)**

   * Predicts subject demand per course using past enrollments.

---

### ✅ Deliverables

* Analytics dashboards.
* Auto-archive system (no deletion).
* Bulk section assignment feature.
* Fully logged automation events.

---

# 🧩 Phase 5: Final QA, Optimization & Deployment

### 🎯 Objective

Finalize testing, optimize queries, and deploy production-ready build.

### 🧪 Quality Assurance Checklist

1. **Data Integrity**

   * Verify FKs, cascade rules, and archive logic.
2. **Role Testing**

   * Each role tested independently.
   * Check RBAC for isolation and scope leaks.
3. **Performance**

   * Optimize slow queries.
   * Index `student_id`, `subject_id`, `section_id` in joins.
4. **Security**

   * Sanitize input (prevent SQLi, XSS).
   * Enforce HTTPS for production.
5. **Error Logging**

   * Centralized error collector (e.g., Winston logger).
6. **Frontend QA**

   * Responsive layout (Tailwind).
   * Test kiosk flow for Admission.
7. **Documentation**

   * Update README and API references.

---

### 🧾 Deployment

* **Backend:** Node/NestJS hosted (local + online support)
* **Frontend:** React + Tailwind build
* **DB:** MySQL / PostgreSQL
* **Auth:** JWT with refresh token
* **Future Extensions:**

  * AI forecasting
  * Automated resectioning
  * Bulk operations
  * Payment module integration (mock ready)

---

## 🧱 Final Phase Flow Summary

| Phase | Focus                    | Outcome                       |
| ----- | ------------------------ | ----------------------------- |
| 1     | Database & Backend Setup | Working API + schema base     |
| 2     | Auth & RBAC              | Secure access for all roles   |
| 3     | Academic Core            | Enrollment, grading, advising |
| 4     | Analytics & Automation   | Auto-archiving, data insights |
| 5     | QA & Deployment          | Production-ready release      |

---

## 📦 Version Control

* **Branching Strategy:**
  `main` → stable releases
  `dev` → feature integration
  `feature/*` → per module (e.g., `feature/enrollment`)

* **Commit Convention:**
  `feat:` new feature
  `fix:` bug fix
  `refactor:` code structure
  `docs:` documentation updates

---

## 🧠 Notes for Dev Team

* Keep all `DELETE` routes disabled; only archive.
* Always log `actor_id` for every action.
* Use ENV-based configurations for roles and database.
* Validate all user input before hitting the DB.
* Modularize controllers for scalability (future automation-ready).

---
