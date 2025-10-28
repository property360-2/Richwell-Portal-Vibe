# Richwell Portal Backend - Complete Documentation

## Overview
This is a comprehensive student enrollment management system backend built with **Node.js, Express, Prisma ORM, and MySQL**. It handles authentication, enrollment, grading, and academic management for a university portal.

---

## Architecture Overview

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js               # Initial data seeding
├── src/
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth & validation middleware
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper functions
│   └── server.js             # Main application entry
└── tests/                    # API tests
```

---

## Database Schema

### Core Entities

**1. User Management**
- `roles` - User roles (student, professor, registrar, admission, dean)
- `users` - User accounts with authentication
- `students` - Student-specific data
- `professors` - Professor-specific data

**2. Academic Structure**
- `programs` - Degree programs (BSCS, BSIT, etc.)
- `subjects` - Course subjects with prerequisites
- `sections` - Class sections with professor assignment
- `academic_terms` - School year and semester management

**3. Enrollment & Grading**
- `enrollments` - Student enrollment records per term
- `enrollment_subjects` - Subject enrollment details
- `grades` - Student grades with approval workflow
- `inc_resolutions` - INC grade resolution tracking

**4. System**
- `analytics_logs` - User activity logging

---

## API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Login with email/password |
| POST | `/setup-password` | Public | First-time password setup for students |
| GET | `/me` | Private | Get current user data |
| POST | `/logout` | Private | Logout (client-side token removal) |
| PUT | `/change-password` | Private | Change user password |

**Login Example:**
```javascript
POST /api/auth/login
Body: {
  "email": "student@richwell.edu",
  "password": "password123"
}

Response: {
  "status": "success",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "student@richwell.edu",
    "role": "student",
    "student": {
      "id": 1,
      "studentNo": "2024-0001",
      "program": "Bachelor of Science in Computer Science",
      "yearLevel": 1
    }
  }
}
```

---

### 📚 Programs (`/api/programs`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All authenticated | Get all programs |
| GET | `/:id` | All authenticated | Get single program |
| POST | `/` | Registrar, Dean | Create new program |
| PUT | `/:id` | Registrar, Dean | Update program |
| DELETE | `/:id` | Dean | Delete program |

**Create Program Example:**
```javascript
POST /api/programs
Headers: { Authorization: "Bearer <token>" }
Body: {
  "name": "Bachelor of Science in Computer Science",
  "code": "BSCS",
  "description": "4-year degree program"
}
```

---

### 📖 Subjects (`/api/subjects`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All authenticated | Get all subjects (filterable by program, year, semester) |
| GET | `/:id` | All authenticated | Get single subject with sections |
| POST | `/` | Registrar, Dean | Create new subject |
| PUT | `/:id` | Registrar, Dean | Update subject |
| DELETE | `/:id` | Dean | Delete subject |

**Query Parameters:**
- `programId` - Filter by program
- `yearStanding` - Filter by year level (first, second, third, fourth)
- `semester` - Filter by semester (first, second, summer)

---

### 🏫 Sections (`/api/sections`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All authenticated | Get all sections (filterable) |
| GET | `/:id` | All authenticated | Get single section with enrollments |
| POST | `/` | Registrar, Dean | Create new section |
| PUT | `/:id` | Registrar, Dean | Update section |
| DELETE | `/:id` | Dean | Delete section |

**Create Section Example:**
```javascript
POST /api/sections
Body: {
  "name": "CS101-A",
  "subjectId": 1,
  "professorId": 1,
  "maxSlots": 30,
  "semester": "first",
  "schoolYear": "2024-2025",
  "schedule": "MWF 8:00-9:00 AM"
}
```

---

### 📅 Academic Terms (`/api/academic-terms`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All authenticated | Get all terms |
| GET | `/active` | All authenticated | Get currently active term |
| GET | `/:id` | All authenticated | Get single term |
| POST | `/` | Registrar, Dean | Create new term |
| PUT | `/:id` | Registrar, Dean | Update term |
| PUT | `/:id/activate` | Registrar, Dean | Set term as active |
| DELETE | `/:id` | Dean | Delete term |

---

### 📝 Enrollment (`/api/enrollments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/available-subjects` | Student | Get subjects available for enrollment |
| GET | `/recommended-subjects` | Student | Get recommended subjects based on curriculum |
| POST | `/enroll` | Student | Enroll in subjects |
| GET | `/history` | Student | Get enrollment history |
| PUT | `/:enrollmentId/cancel` | Student | Cancel pending enrollment |

**Enrollment Business Rules:**
- ✅ Prerequisites must be passed
- ✅ INC grades block related subjects
- ✅ Failed subjects have repeat eligibility dates
- ✅ Maximum 30 units per semester
- ✅ Sections must have available slots

**Enroll Example:**
```javascript
POST /api/enrollments/enroll
Body: {
  "sectionIds": [1, 2, 3],
  "totalUnits": 9
}

Response: {
  "status": "success",
  "message": "Enrollment submitted successfully",
  "data": {
    "enrollmentId": 5,
    "totalUnits": 9,
    "subjects": 3
  }
}
```

---

### 📊 Grades (`/api/grades`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/sections` | Professor | Get professor's sections with students |
| PUT | `/:enrollmentSubjectId` | Professor | Update/submit grade |
| GET | `/pending-approval` | Registrar | Get grades pending approval |
| PUT | `/:gradeId/approve` | Registrar | Approve single grade |
| PUT | `/bulk-approve` | Registrar | Approve multiple grades |

**Grade Values:**
- `grade_1_0` to `grade_5_0` (1.0, 1.25, 1.5... 5.0)
- `INC` - Incomplete
- `DRP` - Dropped

**Submit Grade Example:**
```javascript
PUT /api/grades/123
Body: {
  "gradeValue": "grade_1_75",
  "remarks": "Excellent performance"
}
```

**Auto-calculations:**
- Failed grades (5.0) set repeat eligibility dates
- Major subjects: 6 months wait
- Minor subjects: 12 months wait
- INC grades update student status
- Approved grades recalculate GPA

---

### 📋 INC Resolutions (`/api/inc-resolutions`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/student` | Student | Get student's INC subjects |
| GET | `/professor` | Professor | Get professor's INC resolutions |
| POST | `/` | Professor | Submit INC resolution |
| GET | `/pending` | Registrar | Get pending resolutions |
| PUT | `/:resolutionId/approve` | Registrar | Approve resolution |
| PUT | `/bulk-approve` | Registrar | Bulk approve resolutions |

**INC Resolution Workflow:**
1. Student receives INC grade
2. Professor submits resolution with new grade
3. Registrar approves resolution
4. Original grade updated, GPA recalculated
5. Student `hasInc` flag updated

---

### 🔄 Repeat Eligibility (`/api/repeat-eligibility`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:studentId` | Student, Registrar | Check student's repeat eligibility |
| GET | `/` | Registrar, Dean | Get all students with repeat issues |
| PUT | `/:gradeId` | Registrar, Dean | Update eligibility date |

**Eligibility Rules:**
- Major subjects: 6 months after failure
- Minor subjects: 12 months after failure
- Calculates days until eligible
- Shows which subjects can be retaken

---

### 👨‍🏫 Professors (`/api/professors`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Registrar, Dean | Get all professors |
| GET | `/:id` | Registrar, Dean, Professor | Get single professor |
| POST | `/` | Registrar, Dean | Create professor |
| PUT | `/:id` | Registrar, Dean, Professor | Update professor |
| DELETE | `/:id` | Dean | Delete professor |
| GET | `/:id/sections` | Registrar, Dean, Professor | Get professor's sections |

---

### 📈 Analytics (`/api/analytics`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/student` | Student | Get student analytics (GPA, subjects, INC count) |
| GET | `/professor` | Professor | Get professor analytics (sections, grade distribution) |
| GET | `/registrar` | Registrar | Get registrar dashboard (enrollments, grades) |
| GET | `/dean` | Dean | Get dean analytics (professor load, subject performance) |

**Student Analytics Response:**
```javascript
{
  "status": "success",
  "data": {
    "student": {
      "id": 1,
      "studentNo": "2024-0001",
      "program": "BSCS",
      "yearLevel": 1,
      "gpa": 1.75,
      "hasInc": false,
      "status": "active"
    },
    "statistics": {
      "totalSubjects": 15,
      "totalUnits": 45,
      "incCount": 0,
      "failedCount": 1,
      "gpa": 1.75
    },
    "enrollments": [
      /* latest 5 enrollments with term + subjects */
    ]
  }
}
```

**Professor Analytics Response:**
```javascript
{
  "status": "success",
  "data": {
    "professor": {
      "id": 12,
      "sections": 4,
      "students": 120
    },
    "statistics": {
      "totalSections": 4,
      "totalStudents": 120,
      "averageGrade": 2.1,
      "incCount": 3,
      "gradedStudents": 95
    },
    "gradeDistribution": {
      "1.0": 2,
      "1.25": 5,
      "1.5": 10,
      /* ... */
      "INC": 3,
      "DRP": 0
    },
    "sections": [
      {
        "id": 98,
        "name": "CS101-A",
        "subject": "Data Structures",
        "studentCount": 30,
        "gradedCount": 24
      }
    ]
  }
}
```

**Registrar Analytics Response:**
```javascript
{
  "status": "success",
  "data": {
    "currentTerm": {
      "schoolYear": "2024-2025",
      "semester": "first"
    },
    "enrollment": {
      "total": 420,
      "confirmed": 380,
      "pending": 40
    },
    "grades": {
      "total": 820,
      "approved": 600,
      "pending": 220
    },
    "programs": [
      {
        "name": "BSCS",
        "code": "BSCS",
        "enrolledStudents": 210,
        "totalStudents": 240
      }
    ]
  }
}
```

**Dean Analytics Response:**
```javascript
{
  "status": "success",
  "data": {
    "currentTerm": {
      "schoolYear": "2024-2025",
      "semester": "first"
    },
    "professorLoad": [
      {
        "id": 12,
        "name": "professor.analytics@richwell.edu",
        "department": "Computer Science",
        "sections": 4,
        "totalStudents": 120
      }
    ],
    "subjectPerformance": [
      {
        "code": "CS101",
        "name": "Data Structures",
        "sections": 3,
        "totalStudents": 90,
        "averageGrade": 2.1,
        "passRate": 96.5
      }
    ]
  }
}
```

**Admission Analytics Response:**
```javascript
{
  "status": "success",
  "data": {
    "currentTerm": {
      "schoolYear": "2024-2025",
      "semester": "first"
    },
    "metrics": {
      "pending": 8,
      "confirmedToday": 12,
      "total": 420,
      "confirmed": 390,
      "confirmationRate": 92.86
    },
    "trend": [
      { "date": "2024-09-01", "label": "Sep 1", "count": 5 }
    ],
    "programs": [
      { "name": "BSCS", "count": 150 }
    ],
    "recent": [
      {
        "id": 501,
        "studentNo": "2024-0401",
        "studentEmail": "student.analytics@richwell.edu",
        "program": "BSCS",
        "status": "confirmed",
        "totalUnits": 23,
        "subjects": 7,
        "term": "2024-2025 first",
        "dateEnrolled": "2024-08-12T04:00:00.000Z",
        "lastStatusAt": "2024-08-12T08:45:00.000Z"
      }
    ]
  }
}
```

---

## Middleware

### 🔒 Authentication Middleware (`authMiddleware.js`)

**1. `protect`**
- Verifies JWT token from Authorization header
- Fetches user data from database
- Attaches user object to `req.user`
- Checks account status

```javascript
// Usage
router.get('/protected', protect, controller);
```

**2. `authorize(...roles)`**
- Role-based access control
- Checks if user role matches allowed roles
- Returns 403 if unauthorized

```javascript
// Usage
router.post('/admin', protect, authorize('registrar', 'dean'), controller);
```

**3. `checkOwnership(resourceType)`**
- Verifies user owns the resource
- Falls back to admin role check
- Useful for self-service endpoints

```javascript
// Usage
router.put('/students/:id', protect, checkOwnership('student'), controller);
```

---

## Utilities

### 🔧 Auth Utils (`auth.js`)

**Functions:**

1. **`generateToken(userId, roleId)`**
   - Creates JWT token
   - Expires in 7 days (configurable)
   - Returns signed token string

2. **`verifyToken(token)`**
   - Validates JWT token
   - Returns decoded payload or null

3. **`hashPassword(password)`**
   - Bcrypt hashing with salt rounds
   - Used for password storage

4. **`comparePassword(password, hashedPassword)`**
   - Compares plain password with hash
   - Returns boolean

5. **`generateStudentNumber(prisma)`**
   - Generates format: YYYY-XXXX (e.g., 2024-0001)
   - Auto-increments within year
   - Returns unique student number

6. **`getRoleId(prisma, roleName)`**
   - Fetches role ID by name
   - Helper for role management

---

## Controllers

### Controller Pattern
All controllers follow this structure:
```javascript
export const controllerName = async (req, res) => {
  try {
    // 1. Extract parameters
    const { id } = req.params;
    const { data } = req.body;
    const { userId } = req.user;
    
    // 2. Validation
    if (!data) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error message'
      });
    }
    
    // 3. Database operations
    const result = await prisma.model.operation({...});
    
    // 4. Business logic
    // Calculate, transform, validate...
    
    // 5. Success response
    res.status(200).json({
      status: 'success',
      message: 'Success message',
      data: result
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error message'
    });
  }
};
```

### Key Business Logic

**Enrollment Controller:**
- ✅ Validates prerequisites
- ✅ Checks INC blocking
- ✅ Verifies repeat eligibility
- ✅ Manages section slots atomically
- ✅ Creates enrollment + subjects in transaction

**Grade Controller:**
- ✅ Calculates repeat eligibility dates
- ✅ Updates student INC status
- ✅ Recalculates GPA on approval
- ✅ Handles bulk operations efficiently

**Analytics Controller:**
- ✅ Aggregates enrollment data
- ✅ Calculates GPAs and averages
- ✅ Generates grade distributions
- ✅ Role-specific dashboards

---

## Server Configuration

### Main Server (`server.js`)

**Middleware Stack:**
1. CORS - Cross-origin requests
2. JSON body parser
3. URL-encoded body parser
4. Custom error handler

**Features:**
- Health check endpoint (`/api/health`)
- 404 handler for unknown routes
- Global error handler
- Environment-based configuration

**Environment Variables:**
```env
PORT=5000
DATABASE_URL="mysql://user:pass@localhost:3306/db"
JWT_SECRET="your-secret-key"
JWT_EXPIRE="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

---

## Database Seeding

### Seed Data (`seed.js`)

Creates initial data:
- **5 Roles:** student, professor, registrar, admission, dean
- **Test Accounts:** One for each role
- **Sample Program:** BSCS
- **Active Term:** 2024-2025 First Semester

**Test Credentials:**
```
registrar@richwell.edu / password123
admission@richwell.edu / password123
dean@richwell.edu / password123
professor@richwell.edu / password123
student@richwell.edu / password123
```

**Run Seeding:**
```bash
npm run seed
# or
node prisma/seed.js
```

---

## Testing

### Test Structure

**Auth Tests:**
- ✅ Login with valid credentials
- ✅ Reject invalid credentials
- ✅ Reject inactive accounts
- ✅ Return user data with valid token
- ✅ Reject requests without token

**Enrollment Tests:**
- ✅ Return available subjects
- ✅ Enroll in subjects
- ✅ Reject excessive units
- ✅ Reject duplicate enrollment
- ✅ Return enrollment history

### Role-based Authorization Coverage

| Role | Allowed coverage | Forbidden coverage |
|------|------------------|--------------------|
| **Student** | `/api/analytics/student` with profile checks; read-only catalog access (`/api/programs`, `/api/sections`). | Analytics dashboards for other roles; catalog mutations (program/section create, update, delete); grade workflows. |
| **Professor** | `/api/analytics/professor`; grade entry routes (`/api/grades/sections`, `/api/grades/:id`); read-only catalog access. | Student/registrar/dean analytics; registrar grade approvals; program/section mutations reserved for registrar/dean. |
| **Registrar** | `/api/analytics/registrar` and `/api/analytics/admission`; program/section create & update; grade approval suite (`/api/grades/pending-approval`, `/api/grades/:id/approve`, `/api/grades/bulk-approve`). | Student/professor analytics; catalog deletions reserved for dean. |
| **Dean** | `/api/analytics/dean` and `/api/analytics/admission`; full program/section management including deletions. | Professor grade entry endpoints; student/registrar analytics routes not assigned to dean. |
| **Admission** | `/api/analytics/admission` shared analytics dashboard. | Student/professor/registrar/dean analytics routes. |

**Run Tests:**
```bash
npm test
```

---

## Common Workflows

### 1. Student Enrollment Flow

```
1. Login → GET /api/auth/login
2. View available subjects → GET /api/enrollments/available-subjects
3. Check recommendations → GET /api/enrollments/recommended-subjects
4. Enroll → POST /api/enrollments/enroll
5. View history → GET /api/enrollments/history
```

### 2. Professor Grading Flow

```
1. Login → POST /api/auth/login
2. View sections → GET /api/grades/sections
3. Submit grades → PUT /api/grades/:enrollmentSubjectId
4. View analytics → GET /api/analytics/professor
```

### 3. Registrar Approval Flow

```
1. Login → POST /api/auth/login
2. View pending grades → GET /api/grades/pending-approval
3. Approve grades → PUT /api/grades/bulk-approve
4. View pending INCs → GET /api/inc-resolutions/pending
5. Approve INCs → PUT /api/inc-resolutions/bulk-approve
```

---

## Error Handling

### Standard Error Response
```javascript
{
  "status": "error",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - Bcrypt with salt rounds
3. **Role-Based Access Control** - Granular permissions
4. **Input Validation** - Request data validation
5. **SQL Injection Protection** - Prisma parameterized queries
6. **CORS Configuration** - Controlled cross-origin access

---
