# Data Seeding Reference

This guide lists the minimum fields that must be populated before exercising the academic catalog features and shows example rows you can load during local testing.

## Quick start: Prisma seed script

Run the Prisma seed script from the backend folder to create core roles, accounts, a baseline program, and an active academic term:

```bash
cd richwell-portal/backend
npm run seed
# or
node prisma/seed.js
```

The script lives at [`richwell-portal/backend/prisma/seed.js`](../richwell-portal/backend/prisma/seed.js) and can be extended if you want Prisma to manage more fixture data.

---

## Programs

| Field | Notes |
| --- | --- |
| `name` | Human readable title, e.g., "Bachelor of Science in Computer Science". |
| `code` | Short unique identifier used throughout the portal (max 20 chars). |
| `description` | Optional catalog summary shown to staff. |

**Sample row (SQL):**
```sql
INSERT INTO programs (name, code, description)
VALUES ('Bachelor of Science in Computer Science', 'BSCS', 'Computer Science Program');
```

---

## Subjects

| Field | Notes |
| --- | --- |
| `code` | Unique course code (e.g., `CS101`). |
| `name` | Descriptive title. |
| `units` | Integer credit value used for max-unit validation. |
| `subjectType` | Enum: `major` or `minor`. |
| `yearStanding` | Optional enum (`first`, `second`, `third`, `fourth`) that restricts enrollment. |
| `recommendedYear` | Optional enum for advising views. |
| `recommendedSemester` | Optional enum: `first`, `second`, `summer`. |
| `programId` | Foreign key to the owning program. |
| `prerequisiteId` | Optional self-reference to another subject. |

**Sample row (SQL):**
```sql
INSERT INTO subjects
  (code, name, units, subjectType, yearStanding, recommendedYear, recommendedSemester, programId)
VALUES
  ('CS101', 'Introduction to Programming', 3, 'major', 'first', 'first', 'first', 1);
```
*Use the `id` of your `programs` entry for `programId` and link prerequisites later once both subjects exist.*

---

## Sections

| Field | Notes |
| --- | --- |
| `name` | Section label students will see (e.g., `CS101-A`). |
| `subjectId` | Foreign key to the subject offering. |
| `professorId` | Foreign key to the assigned professor record. |
| `maxSlots` | Hard capacity limit. |
| `availableSlots` | Start this equal to `maxSlots`; decrement as students enroll. |
| `semester` | Enum: `first`, `second`, `summer` (should match the active term). |
| `schoolYear` | Text year span, e.g., `2024-2025`. |
| `schedule` | Optional meeting pattern description. |
| `status` | Enum: defaults to `open`; set to `closed` when enrollment ends. |

**Sample row (SQL):**
```sql
INSERT INTO sections
  (name, subjectId, professorId, maxSlots, availableSlots, semester, schoolYear, schedule, status)
VALUES
  ('CS101-A', 1, 1, 35, 35, 'first', '2024-2025', 'Mon/Wed 09:00-10:30', 'open');
```
*Replace `subjectId` and `professorId` with the IDs created in your seed or manual inserts.*

---

## Academic terms

| Field | Notes |
| --- | --- |
| `schoolYear` | Display value such as `2024-2025`. |
| `semester` | Enum: `first`, `second`, or `summer`. |
| `isActive` | Boolean flag indicating the enrollment term students should target. |

**Sample row (SQL):**
```sql
INSERT INTO academic_terms (schoolYear, semester, isActive)
VALUES ('2024-2025', 'first', true);
```

The Prisma seed already creates an active `2024-2025` first semester entry. If you need multiple terms, insert additional rows and ensure only one has `isActive = true`.

---

## Manual SQL vs. Prisma seeding

- Use the Prisma script when you want a repeatable baseline for roles, accounts, and core catalog records.
- For ad-hoc fixtures (extra subjects, sections, or alternate programs), manual SQL snippets like the ones above can be run directly against your local MySQL/MariaDB instance using a client such as TablePlus, DBeaver, or the MySQL CLI.
- After making manual inserts, re-run `npm run seed` only if you updated the script; otherwise, it will upsert existing rows and leave your manual data intact.

