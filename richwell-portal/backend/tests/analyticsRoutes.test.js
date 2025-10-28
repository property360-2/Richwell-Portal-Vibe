// backend/tests/analyticsRoutes.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

describe('Analytics Routes Authorization', () => {
  let tokens;

  beforeEach(async () => {
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

    tokens = {};

    const studentRole = await prisma.role.create({ data: { name: 'student' } });
    const professorRole = await prisma.role.create({ data: { name: 'professor' } });
    const registrarRole = await prisma.role.create({ data: { name: 'registrar' } });
    const deanRole = await prisma.role.create({ data: { name: 'dean' } });
    const admissionRole = await prisma.role.create({ data: { name: 'admission' } });

    const program = await prisma.program.create({
      data: {
        name: 'Bachelor of Science in Computer Science',
        code: 'BSCS',
        description: 'Test program'
      }
    });

    await prisma.academicTerm.create({
      data: {
        schoolYear: '2024-2025',
        semester: 'first',
        isActive: true
      }
    });

    const createUser = (email, roleId) =>
      prisma.user.create({
        data: {
          email,
          password: hashedPassword,
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

    const studentUser = await createUser('student@example.com', studentRole.id);
    await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentNo: 'S-1001',
        programId: program.id,
        yearLevel: 1
      }
    });
    await loginAndStore('student', 'student@example.com');

    await createUser('student-noprofile@example.com', studentRole.id);
    await loginAndStore('studentNoProfile', 'student-noprofile@example.com');

    const professorUser = await createUser('professor@example.com', professorRole.id);
    await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });
    await loginAndStore('professor', 'professor@example.com');

    await createUser('professor-noprofile@example.com', professorRole.id);
    await loginAndStore('professorNoProfile', 'professor-noprofile@example.com');

    await createUser('registrar@example.com', registrarRole.id);
    await loginAndStore('registrar', 'registrar@example.com');

    await createUser('dean@example.com', deanRole.id);
    await loginAndStore('dean', 'dean@example.com');

    await createUser('admission@example.com', admissionRole.id);
    await loginAndStore('admission', 'admission@example.com');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Student analytics', () => {
    it('allows students with a profile to access analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/student')
        .set('Authorization', `Bearer ${tokens.student}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('denies students without a profile', async () => {
      const response = await request(app)
        .get('/api/analytics/student')
        .set('Authorization', `Bearer ${tokens.studentNoProfile}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Student profile required.');
    });

    ['professor', 'registrar', 'dean', 'admission'].forEach((role) => {
      it(`denies ${role} users`, async () => {
        const response = await request(app)
          .get('/api/analytics/student')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });

  describe('Professor analytics', () => {
    it('allows professors with a profile to access analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/professor')
        .set('Authorization', `Bearer ${tokens.professor}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('denies professors without a profile', async () => {
      const response = await request(app)
        .get('/api/analytics/professor')
        .set('Authorization', `Bearer ${tokens.professorNoProfile}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Access denied. Professor profile required.');
    });

    ['student', 'registrar', 'dean', 'admission'].forEach((role) => {
      it(`denies ${role} users`, async () => {
        const response = await request(app)
          .get('/api/analytics/professor')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });

  describe('Registrar analytics', () => {
    it('allows registrars to access analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/registrar')
        .set('Authorization', `Bearer ${tokens.registrar}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    ['student', 'professor', 'dean', 'admission'].forEach((role) => {
      it(`denies ${role} users`, async () => {
        const response = await request(app)
          .get('/api/analytics/registrar')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });

  describe('Dean analytics', () => {
    it('allows deans to access analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dean')
        .set('Authorization', `Bearer ${tokens.dean}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    ['student', 'professor', 'registrar', 'admission'].forEach((role) => {
      it(`denies ${role} users`, async () => {
        const response = await request(app)
          .get('/api/analytics/dean')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });

  describe('Admission analytics', () => {
    ['admission', 'registrar', 'dean'].forEach((role) => {
      it(`allows ${role} users to access admission analytics`, async () => {
        const response = await request(app)
          .get('/api/analytics/admission')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      });
    });

    ['student', 'professor'].forEach((role) => {
      it(`denies ${role} users`, async () => {
        const response = await request(app)
          .get('/api/analytics/admission')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });
  });
});
