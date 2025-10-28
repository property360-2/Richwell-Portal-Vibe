// backend/tests/gradeRoutes.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const HASHED_PASSWORD = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

describe('Grade Routes Authorization Matrix', () => {
  let tokens;
  let context;

  const cleanupDatabase = async () => {
    await prisma.grade.deleteMany();
    await prisma.enrollmentSubject.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.analyticsLog.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.program.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  };

  beforeEach(async () => {
    await cleanupDatabase();

    tokens = {};
    context = {};

    const studentRole = await prisma.role.create({ data: { name: 'student' } });
    const professorRole = await prisma.role.create({ data: { name: 'professor' } });
    const registrarRole = await prisma.role.create({ data: { name: 'registrar' } });
    const deanRole = await prisma.role.create({ data: { name: 'dean' } });

    const createUser = (email, roleId) =>
      prisma.user.create({
        data: {
          email,
          password: HASHED_PASSWORD,
          roleId,
          status: 'active'
        }
      });

    const loginAndStore = async (key, email) => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password' });

      tokens[key] = response.body.token;
    };

    const program = await prisma.program.create({
      data: {
        name: 'Bachelor of Science in Computer Science',
        code: 'BSCS',
        description: 'Test program'
      }
    });

    const subject = await prisma.subject.create({
      data: {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        units: 3,
        subjectType: 'major',
        programId: program.id
      }
    });

    const academicTerm = await prisma.academicTerm.create({
      data: {
        schoolYear: '2024-2025',
        semester: 'first',
        isActive: true
      }
    });

    const professorUser = await createUser('professor@example.com', professorRole.id);
    const professorProfile = await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });
    await loginAndStore('professor', 'professor@example.com');

    const section = await prisma.section.create({
      data: {
        name: 'CS101-A',
        subjectId: subject.id,
        professorId: professorProfile.id,
        maxSlots: 30,
        availableSlots: 30,
        semester: 'first',
        schoolYear: '2024-2025',
        status: 'open'
      }
    });

    const studentUser = await createUser('student@example.com', studentRole.id);
    const studentProfile = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentNo: 'S-1001',
        programId: program.id,
        yearLevel: 1
      }
    });
    await loginAndStore('student', 'student@example.com');

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studentProfile.id,
        termId: academicTerm.id,
        totalUnits: 3,
        status: 'enrolled',
        dateEnrolled: new Date()
      }
    });

    const enrollmentSubject = await prisma.enrollmentSubject.create({
      data: {
        enrollmentId: enrollment.id,
        subjectId: subject.id,
        sectionId: section.id,
        units: 3
      }
    });

    const gradeRecord = await prisma.grade.create({
      data: {
        enrollmentSubjectId: enrollmentSubject.id,
        gradeValue: 'grade_3_0',
        remarks: 'Initial grade',
        encodedBy: professorProfile.id,
        approved: false
      }
    });

    const registrarUser = await createUser('registrar@example.com', registrarRole.id);
    await loginAndStore('registrar', 'registrar@example.com');

    const deanUser = await createUser('dean@example.com', deanRole.id);
    await loginAndStore('dean', 'dean@example.com');

    context = {
      enrollmentSubjectId: enrollmentSubject.id,
      gradeId: gradeRecord.id
    };
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Professor routes', () => {
    it('allows professors to view their sections', async () => {
      const response = await request(app)
        .get('/api/grades/sections')
        .set('Authorization', `Bearer ${tokens.professor}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    ['student', 'registrar', 'dean'].forEach((role) => {
      it(`denies ${role} users when listing sections`, async () => {
        const response = await request(app)
          .get('/api/grades/sections')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    it('allows professors to update grades', async () => {
      const response = await request(app)
        .put(`/api/grades/${context.enrollmentSubjectId}`)
        .set('Authorization', `Bearer ${tokens.professor}`)
        .send({
          gradeValue: 'grade_1_0',
          remarks: 'Updated grade'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Grade updated successfully');
    });

    ['student', 'registrar', 'dean'].forEach((role) => {
      it(`denies ${role} users from updating grades`, async () => {
        const response = await request(app)
          .put(`/api/grades/${context.enrollmentSubjectId}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            gradeValue: 'grade_1_0',
            remarks: 'Attempted update'
          });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });

  describe('Registrar routes', () => {
    it('allows registrars to view pending approvals', async () => {
      const response = await request(app)
        .get('/api/grades/pending-approval')
        .set('Authorization', `Bearer ${tokens.registrar}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    ['student', 'professor', 'dean'].forEach((role) => {
      it(`denies ${role} users from viewing pending approvals`, async () => {
        const response = await request(app)
          .get('/api/grades/pending-approval')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    it('allows registrars to approve a grade', async () => {
      const response = await request(app)
        .put(`/api/grades/${context.gradeId}/approve`)
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ approved: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Grade approved successfully');
      expect(response.body.data.approved).toBe(true);
    });

    ['student', 'professor', 'dean'].forEach((role) => {
      it(`denies ${role} users from approving a grade`, async () => {
        const response = await request(app)
          .put(`/api/grades/${context.gradeId}/approve`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({ approved: true });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    it('allows registrars to bulk approve grades', async () => {
      const response = await request(app)
        .put('/api/grades/bulk-approve')
        .set('Authorization', `Bearer ${tokens.registrar}`)
        .send({ gradeIds: [context.gradeId] });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('grades approved successfully');
    });

    ['student', 'professor', 'dean'].forEach((role) => {
      it(`denies ${role} users from bulk approving grades`, async () => {
        const response = await request(app)
          .put('/api/grades/bulk-approve')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({ gradeIds: [context.gradeId] });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });
});
