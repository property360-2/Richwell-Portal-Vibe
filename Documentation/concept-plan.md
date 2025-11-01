# 🧩 Richwell College Portal v3.0 — Concept & Plan (Django + Atomic)

> **Stack:** Django + DRF • PostgreSQL/MySQL • CDN for static/media • Atomic Design Frontend (React or Django Templates)
> **Theme:** Light mode • Primary Purple `#6B4EFF` • Accent Yellow `#FFD740` • Neutral Gray `#F7F7FB`

---

## 1) Product Overview

A modular, archive-first academic system covering enrollment, grade encoding, transferee mapping, section/curriculum management, and student analytics. All records follow a **no-delete** policy via soft-archive.

**Key Tenets**

* Soft-delete (Archive) with restore workflow
* Clear, role-based access per department
* Audit trail for every mutation
* Atomic UI components for speed and consistency
* CDN-backed static and media delivery

---

## 2) Roles & Scope

| Role          | Core Powers                                                | Archive Access                 |
| ------------- | ---------------------------------------------------------- | ------------------------------ |
| **Dean**      | Courses, Subjects, Sections, Professor assignment, Prereqs | Full + restore                 |
| **Registrar** | Transferee mapping, INC confirmation, Student archive      | Partial (students/enrollments) |
| **Admission** | Enrollment intake, advising (sections read-only)           | None                           |
| **Professor** | Grade encoding, INC resolution                             | None                           |
| **Student**   | View records, grades, analytics                            | None                           |

System flow remains: **Dean → Admission → Registrar → Professor → Student**.

---

## 3) Architecture

### 3.1 Backend Apps (Django)

```
backend/
├─ config/                 # settings, urls, wsgi/asgi
├─ core/                   # common mixins, utils, pagination, permissions
├─ users/                  # auth, roles, profiles
├─ students/               # student profile, documents (JSON)
├─ courses/                # programs, curricula
├─ subjects/               # subjects, prerequisites
├─ sections/               # sections, capacity, professor assignment
├─ enrollments/            # student-subject linking, unit cap
├─ grades/                 # grade encoding, INC records
├─ terms/                  # school years, semesters
├─ archive/                # restore endpoints, archive views
└─ audit/                  # audit trail logging
```

### 3.2 Core Mixins & Utilities

* **ArchiveMixin**: `archived, archived_at, archived_by`
* **TimeStampMixin**: `created_at, updated_at`
* **OwnedBySchoolTerm**: `term_fk` (for partitioning by term)
* **Audit hook**: signal-based or service layer logger (on create/update/archive/restore)

### 3.3 Database Notes

* **students.documents**: JSON field for uploads meta (future-ready for Cloudinary/S3)
* **nullable section_id** in `enrollments` for irregular/transferees
* **strict unit cap (30)** enforced at enrollment service layer

---

## 4) Models (Outline)

```python
# core/models.py
class ArchiveMixin(models.Model):
    archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)
    class Meta:
        abstract = True

class TimeStampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

# audit/models.py
class AuditTrail(models.Model):
    actor = models.ForeignKey('users.User', on_delete=models.CASCADE)
    action = models.CharField(max_length=50)  # create/update/archive/restore
    table_name = models.CharField(max_length=100)
    record_id = models.IntegerField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
```

**Users**

* `User (extends AbstractUser)` with `role` choice [DEAN, REGISTRAR, ADMISSION, PROFESSOR, STUDENT]
* `Profile` with minimal extras, FK to `User`

**Academics**

* `Term`: `school_year`, `semester`, `active`
* `Course` (ArchiveMixin)
* `Subject` (ArchiveMixin): `code`, `title`, `units`, `type` (MAJOR/MINOR)
* `SubjectPrereq`: m2m through table
* `Section` (ArchiveMixin): `code`, `course`, `term`, `professor`, `capacity`, `slots_remaining`
* `AssignedSubject` (ArchiveMixin): link `section` ↔ `subject` ↔ `professor`

**Students & Enrollment**

* `Student` (ArchiveMixin, TimeStamp): `user`, `course`, `documents` (JSON), `status`
* `Enrollment` (ArchiveMixin): `student`, `subject`, `section (nullable)`, `term`, `units`, `status`

**Grades & INC**

* `GradeRecord` (ArchiveMixin): `enrollment`, `grade` (choices: 1.0..3.0, INC), `encoded_by`, `encoded_at`
* `INCRecord` (ArchiveMixin): `enrollment`, `deadline`, `resolved_at`, `resolution_note`

---

## 5) Permissions & Policies

| Feature           | Dean                   | Registrar          | Admission  | Professor         | Student |
| ----------------- | ---------------------- | ------------------ | ---------- | ----------------- | ------- |
| Courses/Subjects  | CRUD + archive/restore | R                  | R          | R                 | R       |
| Sections          | CRUD + archive/restore | R                  | R          | R                 | R       |
| Assigned Subjects | CRUD                   | R                  | R          | R                 | R       |
| Enrollment Intake | R                      | R                  | **Create** | R                 | R       |
| Grade Encoding    | R                      | Approve INC        | R          | **Create/Update** | R       |
| Archive Toggle    | **Full**               | Partial (students) | –          | –                 | –       |

**INC Time Limits**

* Minor: 6 months
* Major: 12 months
  Automated via scheduled job (management command + cron/Task queue).

**Unit Cap**

* Enforce 30 units on enrollment service; reject above-cap with 422.

---

## 6) API (DRF) — Key Endpoints

```
/auth/
  POST login/ (JWT)
  POST refresh/
/users/
  GET me/

/terms/
  GET list, POST create (Dean)

/courses/, /subjects/
  GET list/ (active by default, ?archived=true for archive view)
  POST create, PATCH update, POST archive/, POST restore/ (Dean)

/sections/
  GET list (Admission read-only)
  POST create (Dean)
  POST assign-professor/

/enrollments/
  POST create (Admission)
  GET my/ (Student)

/grades/
  POST encode/ (Professor)
  POST inc/resolve (Professor → Registrar confirmation)

/archive/
  POST restore/<model>/<id>/ (Dean)

/audit/
  GET logs/ (Dean/Registrar)
```

**Filters**: default `archived=false`; toggle with `?archived=true` for privileged roles.

---

## 7) Frontend — Atomic Structure example

```
frontend/
├─ atoms/
│  ├─ Button.tsx
│  ├─ Input.tsx
│  ├─ Badge.tsx
│  ├─ Tooltip.tsx
│  └─ Pill.tsx
├─ molecules/
│  ├─ LoginForm.tsx
│  ├─ SearchBar.tsx
│  ├─ ConfirmModal.tsx
│  ├─ StatsTiles.tsx
│  └─ GradeLegend.tsx
├─ organisms/
│  ├─ Navbar.tsx
│  ├─ Sidebar.tsx
│  ├─ EnrollmentPanel.tsx
│  ├─ SectionTable.tsx
│  └─ GradeTable.tsx
├─ templates/
│  ├─ DashboardLayout.tsx
│  ├─ AuthLayout.tsx
│  └─ ArchiveLayout.tsx
└─ pages/
   ├─ dean/index.tsx
   ├─ registrar/index.tsx
   ├─ admission/kiosk.tsx
   ├─ professor/index.tsx
   └─ student/index.tsx
```

**Theme Tokens (Tailwind)**

```css
:root {
  --color-primary: #6B4EFF;
  --color-accent: #FFD740;
  --color-bg: #FFFFFF;
  --color-surface: #F7F7FB;
  --color-text: #1F2233;
}
```

---

## 8) CDN, Static & Media use option b

**Option A — Cloudinary**

* Use `django-storages` + `cloudinary_storage`
* Media uploads: versioned URLs, on-the-fly transforms

**Option B — S3 + CloudFront/Cloudflare**

* `AWS_S3_OBJECT_PARAMETERS` for cache-control
* `collectstatic` → bucket → CDN

**Static Strategy**

* Hash filenames (`ManifestStaticFilesStorage`)
* Far-future caching headers (CDN edge)

---

## 9) Environment & Settings

`.env` essentials:

```
SECRET_KEY=
DB_URL=
ALLOWED_HOSTS=richwell.local,portal.richwell.edu
CORS_ALLOWED_ORIGINS=https://portal.richwell.edu
JWT_SECRET=
CLOUDINARY_URL=  # or AWS creds
CDN_URL=https://cdn.richwell.edu
```

Django settings highlights:

* `REST_FRAMEWORK` pagination, throttling
* `CORS_ALLOW_CREDENTIALS=True`
* `SECURE_PROXY_SSL_HEADER`, `CSRF_TRUSTED_ORIGINS`

---

## 10) Non-Functional Requirements

* Performance: p95 < 300ms for list endpoints
* Observability: request logging + error tracking (Sentry)
* Backups: nightly DB dump, 7/30 retention
* Security: JWT rotation, strong password validators, 2FA optional
* Capacity: 5k concurrent students per term (scale via DB + caching)

---

## 11) Development Phases & Deliverables

### Phase 1 — Bootstrap & Foundations (W1)

* Django project + core apps
* Mixins (Archive/TimeStamp) + Audit model
* Settings for CDN/static/media
  **Deliverables:** repo, base models, settings, healthcheck endpoint

### Phase 2 — Auth & Roles (W1–W2)

* JWT login/refresh, role model, permissions
* Users CRUD (Dean only), profile endpoints
  **Deliverables:** `/auth/login`, `/users/me`, role guards

### Phase 3 — Academics Skeleton (W2–W3)

* Terms, Courses, Subjects, Prereqs
* Sections + slot capacity, Professor assignment
  **Deliverables:** `/terms`, `/courses`, `/subjects`, `/sections`

### Phase 4 — Enrollment & Grades (W3–W4)

* Admission enrollment flow (+30-unit cap)
* Grade encoding, INC creation
  **Deliverables:** `/enrollments`, `/grades/encode`, `/grades/inc`

### Phase 5 — Registrar Ops & Archive (W4)

* INC resolution confirmation, student archive
* Archive toggles + restore API
  **Deliverables:** `/grades/inc/resolve`, `/archive/restore`

### Phase 6 — UI Integration (W5)

* Atomic components library
* Dashboards per role, analytics widgets
  **Deliverables:** UI kit + role pages + charts

---

## 12) UX Flows (Key Screens)

**Admission Kiosk**

1. Pick type: New / Current / Transferee
2. Auto-subjects or fetch eligible
3. Confirm (modal) → Create enrollment + account
4. Section slot decrements on confirm

**Professor Grading**

* View assigned subjects → open section → grade table
* Encode grade (choices only) → audit trail
* Create/resolve INC (deadline enforced)

**Dean Archive View**

* Toggle `Archived` switch
* Restore Section/Subject
* Analytics: pass rates, faculty loads, INC trends

---

## 13) Styling System (Light Mode — Purple/Yellow)

* Buttons: primary (purple), secondary (yellow outline), danger (rose)
* Surface: cards on `#F7F7FB`, soft shadows, rounded-2xl
* Focus rings: yellow
* Charts: neutral palette with purple emphasis

---

## 14) Testing & QA

* Unit tests for services (enrollment/grade policies)
* API tests (pytest + DRF)
* Snapshot tests for atomic components
* Fake data factory (factory_boy) + seed command

---

## 15) Deployment Notes

* Gunicorn + Nginx (or ASGI with Uvicorn)
* `collectstatic` to CDN on build
* DB migrations gate + healthcheck
* Rollback strategy (previous image + DB backup)

---

## 16) Next Actions

1. Initialize repo skeleton (backend + frontend folders)
2. Add `ArchiveMixin`, `AuditTrail`, `User.role`
3. Ship Phase 1 deliverables
4. Start Phase 2 (JWT + permissions)
