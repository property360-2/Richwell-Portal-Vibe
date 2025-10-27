// backend/tests/enrollment.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Enrollment API', () => {
  let studentToken;
  let studentId;
  let termId;
  let subjectId;
  let sectionId;
  let admissionToken;

  beforeEach(async () => {
    // Clean up test data
    await prisma.grade.deleteMany();
    await prisma.enrollmentSubject.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.analyticsLog.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.program.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.academicTerm.deleteMany();

    // Create test data
    const role = await prisma.role.create({
      data: { name: 'student' }
    });

    const admissionRole = await prisma.role.create({
      data: { name: 'admission' }
    });

    const user = await prisma.user.create({
      data: {
        email: 'student@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        roleId: role.id,
        status: 'active'
      }
    });

    await prisma.user.create({
      data: {
        email: 'admission@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        roleId: admissionRole.id,
        status: 'active'
      }
    });

    const program = await prisma.program.create({
      data: {
        name: 'Computer Science',
        code: 'BSCS',
        description: 'Bachelor of Science in Computer Science'
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentNo: '2024-00001',
        programId: program.id,
        yearLevel: 1,
        status: 'regular'
      }
    });

    const term = await prisma.academicTerm.create({
      data: {
        schoolYear: '2024-2025',
        semester: 'first',
        isActive: true
      }
    });

    const subject = await prisma.subject.create({
      data: {
        code: 'CS101',
        name: 'Introduction to Programming',
        units: 3,
        subjectType: 'major',
        programId: program.id
      }
    });

    const professorRole = await prisma.role.create({
      data: { name: 'professor' }
    });

    const professorUser = await prisma.user.create({
      data: {
        email: 'prof@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        roleId: professorRole.id,
        status: 'active'
      }
    });

    const professor = await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });

    const section = await prisma.section.create({
      data: {
        name: 'CS101-A',
        subjectId: subject.id,
        professorId: professor.id,
        maxSlots: 30,
        availableSlots: 30,
        semester: 'first',
        schoolYear: '2024-2025',
        status: 'open'
      }
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@example.com',
        password: 'password'
      });

    studentToken = loginResponse.body.token;
    studentId = student.id;
    termId = term.id;
    subjectId = subject.id;
    sectionId = section.id;

    const admissionLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admission@example.com',
        password: 'password'
      });

    admissionToken = admissionLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/enrollments/available-subjects', () => {
    it('should return available subjects for student', async () => {
      const response = await request(app)
        .get('/api/enrollments/available-subjects')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.subjects).toBeDefined();
      expect(response.body.data.subjects.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/enrollments/enroll', () => {
    it('should enroll student in subjects', async () => {
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sectionIds: [sectionId],
          totalUnits: 3
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.enrollmentId).toBeDefined();
    });

    it('should reject enrollment with too many units', async () => {
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sectionIds: [sectionId],
          totalUnits: 35
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject duplicate enrollment', async () => {
      // First enrollment
      await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sectionIds: [sectionId],
          totalUnits: 3
        });

      // Second enrollment should fail
      const response = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sectionIds: [sectionId],
          totalUnits: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/enrollments/history', () => {
    it('should return student enrollment history', async () => {
      const response = await request(app)
        .get('/api/enrollments/history')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/analytics/admission', () => {
    it('should reflect analytics changes after enrollment confirmation', async () => {
      const enrollmentResponse = await request(app)
        .post('/api/enrollments/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sectionIds: [sectionId],
          totalUnits: 3
        });

      const enrollmentId = enrollmentResponse.body.data.enrollmentId;

      const initialAnalytics = await request(app)
        .get('/api/analytics/admission')
        .set('Authorization', `Bearer ${admissionToken}`);

      expect(initialAnalytics.status).toBe(200);
      expect(initialAnalytics.body.data.metrics.total).toBe(1);
      expect(initialAnalytics.body.data.metrics.pending).toBe(1);
      expect(initialAnalytics.body.data.metrics.confirmed).toBe(0);

      const confirmationResponse = await request(app)
        .put(`/api/enrollments/${enrollmentId}/status`)
        .set('Authorization', `Bearer ${admissionToken}`)
        .send({ status: 'confirmed' });

      expect(confirmationResponse.status).toBe(200);

      const postConfirmationAnalytics = await request(app)
        .get('/api/analytics/admission')
        .set('Authorization', `Bearer ${admissionToken}`);

      expect(postConfirmationAnalytics.status).toBe(200);
      expect(postConfirmationAnalytics.body.data.metrics.pending).toBe(0);
      expect(postConfirmationAnalytics.body.data.metrics.confirmed).toBe(1);
      expect(postConfirmationAnalytics.body.data.metrics.total).toBe(1);
      expect(postConfirmationAnalytics.body.data.metrics.confirmationRate).toBeCloseTo(100);
      expect(postConfirmationAnalytics.body.data.metrics.confirmedToday).toBeGreaterThanOrEqual(1);
    });
  });
});
