// backend/tests/gradeRoutes.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Grade Routes Authorization', () => {
  let studentToken;
  let professorToken;

  beforeEach(async () => {
    // Clean up data used in tests
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

    // Create roles
    const studentRole = await prisma.role.create({ data: { name: 'student' } });
    const professorRole = await prisma.role.create({ data: { name: 'professor' } });
    await prisma.role.create({ data: { name: 'registrar' } });

    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    // Create users
    await prisma.user.create({
      data: {
        email: 'student@example.com',
        password: hashedPassword,
        roleId: studentRole.id,
        status: 'active'
      }
    });

    const professorUser = await prisma.user.create({
      data: {
        email: 'professor@example.com',
        password: hashedPassword,
        roleId: professorRole.id,
        status: 'active'
      }
    });

    await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });

    // Login to get tokens for each role
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@example.com',
        password: 'password'
      });

    studentToken = studentLogin.body.token;

    const professorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'professor@example.com',
        password: 'password'
      });

    professorToken = professorLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Professor routes', () => {
    it('should return 403 for non-professor accessing sections', async () => {
      const response = await request(app)
        .get('/api/grades/sections')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 403 for non-professor updating grades', async () => {
      const response = await request(app)
        .put('/api/grades/1')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          gradeValue: 'grade_1_0',
          remarks: 'Excellent work'
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('Registrar routes', () => {
    it('should return 403 for non-registrar accessing pending approvals', async () => {
      const response = await request(app)
        .get('/api/grades/pending-approval')
        .set('Authorization', `Bearer ${professorToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 403 for non-registrar approving grade', async () => {
      const response = await request(app)
        .put('/api/grades/1/approve')
        .set('Authorization', `Bearer ${professorToken}`)
        .send({ approved: true });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Access denied');
    });
  });
});
