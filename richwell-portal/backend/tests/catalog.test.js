// backend/tests/catalog.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const HASHED_PASSWORD = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

describe('Catalog API', () => {
  let authToken;
  let program;
  let primarySubject;
  let prerequisiteSubject;
  let section;
  let activeTerm;
  let inactiveTerm;

  const cleanupDatabase = async () => {
    await prisma.grade.deleteMany();
    await prisma.enrollmentSubject.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.program.deleteMany();
  };

  beforeEach(async () => {
    await cleanupDatabase();

    const registrarRole = await prisma.role.create({
      data: { name: 'registrar' }
    });

    const professorRole = await prisma.role.create({
      data: { name: 'professor' }
    });

    await prisma.role.create({
      data: { name: 'student' }
    });

    const registrarUser = await prisma.user.create({
      data: {
        email: 'registrar@example.com',
        password: HASHED_PASSWORD,
        roleId: registrarRole.id,
        status: 'active'
      }
    });

    const professorUser = await prisma.user.create({
      data: {
        email: 'professor@example.com',
        password: HASHED_PASSWORD,
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

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'registrar@example.com',
        password: 'password'
      });

    authToken = loginResponse.body.token;

    program = await prisma.program.create({
      data: {
        name: 'Bachelor of Science in Information Technology',
        code: 'BSIT',
        description: 'IT program overview'
      }
    });

    prerequisiteSubject = await prisma.subject.create({
      data: {
        code: 'IT100',
        name: 'Foundations of Computing',
        units: 3,
        subjectType: 'major',
        programId: program.id
      }
    });

    primarySubject = await prisma.subject.create({
      data: {
        code: 'IT101',
        name: 'Programming Fundamentals',
        units: 3,
        subjectType: 'major',
        programId: program.id,
        prerequisiteId: prerequisiteSubject.id
      }
    });

    section = await prisma.section.create({
      data: {
        name: 'IT101-A',
        subjectId: primarySubject.id,
        professorId: professor.id,
        maxSlots: 40,
        availableSlots: 40,
        semester: 'first',
        schoolYear: '2024-2025',
        status: 'open'
      }
    });

    activeTerm = await prisma.academicTerm.create({
      data: {
        schoolYear: '2024-2025',
        semester: 'first',
        isActive: true
      }
    });

    inactiveTerm = await prisma.academicTerm.create({
      data: {
        schoolYear: '2023-2024',
        semester: 'second',
        isActive: false
      }
    });
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Programs endpoints', () => {
    it('should list all programs', async () => {
      const response = await request(app)
        .get('/api/programs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].code).toBe(program.code);
    });

    it('should get a program by id', async () => {
      const response = await request(app)
        .get(`/api/programs/${program.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(program.id);
    });

    it('should return 404 for non-existent program', async () => {
      const response = await request(app)
        .get('/api/programs/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/programs');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Subjects endpoints', () => {
    it('should list all subjects', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(2);
      expect(response.body.data.map((item) => item.code)).toEqual(
        expect.arrayContaining([prerequisiteSubject.code, primarySubject.code])
      );
    });

    it('should get a subject by id', async () => {
      const response = await request(app)
        .get(`/api/subjects/${primarySubject.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(primarySubject.id);
      expect(response.body.data.prerequisite.id).toBe(prerequisiteSubject.id);
    });

    it('should return 404 for missing subject', async () => {
      const response = await request(app)
        .get('/api/subjects/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Sections endpoints', () => {
    it('should list all sections', async () => {
      const response = await request(app)
        .get('/api/sections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe(section.name);
    });

    it('should get a section by id', async () => {
      const response = await request(app)
        .get(`/api/sections/${section.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(section.id);
      expect(response.body.data.subject.id).toBe(primarySubject.id);
    });

    it('should return 404 for missing section', async () => {
      const response = await request(app)
        .get('/api/sections/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Academic term endpoints', () => {
    it('should list all academic terms', async () => {
      const response = await request(app)
        .get('/api/academic-terms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.count).toBe(2);
      expect(response.body.data.some((term) => term.id === activeTerm.id)).toBe(true);
    });

    it('should get academic term by id', async () => {
      const response = await request(app)
        .get(`/api/academic-terms/${inactiveTerm.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(inactiveTerm.id);
    });

    it('should return the active academic term', async () => {
      const response = await request(app)
        .get('/api/academic-terms/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(activeTerm.id);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return 404 when active term is not set', async () => {
      await prisma.academicTerm.update({
        where: { id: activeTerm.id },
        data: { isActive: false }
      });

      const response = await request(app)
        .get('/api/academic-terms/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should return 404 for missing academic term', async () => {
      const response = await request(app)
        .get('/api/academic-terms/9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});
