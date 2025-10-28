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
  let tokens;
  let uniqueCounter = 0;

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

    tokens = {};

    const registrarRole = await prisma.role.create({
      data: { name: 'registrar' }
    });

    const professorRole = await prisma.role.create({
      data: { name: 'professor' }
    });

    const studentRole = await prisma.role.create({
      data: { name: 'student' }
    });

    const deanRole = await prisma.role.create({
      data: { name: 'dean' }
    });

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
        .send({
          email,
          password: 'password'
        });

      tokens[key] = response.body.token;
    };

    const registrarUser = await createUser('registrar@example.com', registrarRole.id);
    const professorUser = await createUser('professor@example.com', professorRole.id);
    const studentUser = await createUser('student@example.com', studentRole.id);
    await createUser('dean@example.com', deanRole.id);

    const professor = await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });

    program = await prisma.program.create({
      data: {
        name: 'Bachelor of Science in Information Technology',
        code: 'BSIT',
        description: 'IT program overview'
      }
    });

    await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentNo: 'S-2001',
        programId: program.id,
        yearLevel: 1
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

    await loginAndStore('registrar', 'registrar@example.com');
    await loginAndStore('professor', 'professor@example.com');
    await loginAndStore('student', 'student@example.com');
    await loginAndStore('dean', 'dean@example.com');

    authToken = tokens.registrar;
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

  describe('Program authorization matrix', () => {
    const authenticatedRoles = ['registrar', 'professor', 'student', 'dean'];

    it('allows all authenticated roles to list programs', async () => {
      for (const role of authenticatedRoles) {
        const response = await request(app)
          .get('/api/programs')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      }
    });

    ['registrar', 'dean'].forEach((role) => {
      it(`allows ${role} users to create programs`, async () => {
        const uniqueCode = `NP${++uniqueCounter}`;
        const response = await request(app)
          .post('/api/programs')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: `New Program ${role}`,
            code: uniqueCode,
            description: 'Created in authorization matrix test'
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.code).toBe(uniqueCode);
      });
    });

    ['student', 'professor'].forEach((role) => {
      it(`denies ${role} users from creating programs`, async () => {
        const response = await request(app)
          .post('/api/programs')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: 'Unauthorized Program',
            code: `UP${++uniqueCounter}`,
            description: 'Should not be created'
          });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    ['registrar', 'dean'].forEach((role) => {
      it(`allows ${role} users to update programs`, async () => {
        const response = await request(app)
          .put(`/api/programs/${program.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: `Updated Program ${role}`,
            description: 'Updated in authorization matrix test'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe(`Updated Program ${role}`);
      });
    });

    ['student', 'professor'].forEach((role) => {
      it(`denies ${role} users from updating programs`, async () => {
        const response = await request(app)
          .put(`/api/programs/${program.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: 'Unauthorized Update'
          });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    it('allows dean users to delete programs without dependents', async () => {
      const deletableProgram = await prisma.program.create({
        data: {
          name: 'Temporary Program',
          code: `TMP${++uniqueCounter}`,
          description: 'Safe to delete'
        }
      });

      const response = await request(app)
        .delete(`/api/programs/${deletableProgram.id}`)
        .set('Authorization', `Bearer ${tokens.dean}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Program deleted successfully');
    });

    ['student', 'professor', 'registrar'].forEach((role) => {
      it(`denies ${role} users from deleting programs`, async () => {
        const deletableProgram = await prisma.program.create({
          data: {
            name: 'Protected Program',
            code: `PR${++uniqueCounter}`,
            description: 'Should not be removed'
          }
        });

        const response = await request(app)
          .delete(`/api/programs/${deletableProgram.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
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

  describe('Section authorization matrix', () => {
    const authenticatedRoles = ['registrar', 'professor', 'student', 'dean'];

    it('allows all authenticated roles to list sections', async () => {
      for (const role of authenticatedRoles) {
        const response = await request(app)
          .get('/api/sections')
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
      }
    });

    ['registrar', 'dean'].forEach((role) => {
      it(`allows ${role} users to create sections`, async () => {
        const response = await request(app)
          .post('/api/sections')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: `IT101-${role.slice(0, 1).toUpperCase()}${++uniqueCounter}`,
            subjectId: primarySubject.id,
            professorId: section.professorId,
            maxSlots: 35,
            semester: 'first',
            schoolYear: '2024-2025',
            schedule: 'TTh 9:00-10:30'
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toContain('IT101-');
      });
    });

    ['student', 'professor'].forEach((role) => {
      it(`denies ${role} users from creating sections`, async () => {
        const response = await request(app)
          .post('/api/sections')
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            name: 'Unauthorized Section',
            subjectId: primarySubject.id,
            professorId: section.professorId,
            maxSlots: 30,
            semester: 'first',
            schoolYear: '2024-2025'
          });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    ['registrar', 'dean'].forEach((role) => {
      it(`allows ${role} users to update sections`, async () => {
        const response = await request(app)
          .put(`/api/sections/${section.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({
            maxSlots: 45,
            schedule: 'MWF 8:00-9:00'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.maxSlots).toBe(45);
      });
    });

    ['student', 'professor'].forEach((role) => {
      it(`denies ${role} users from updating sections`, async () => {
        const response = await request(app)
          .put(`/api/sections/${section.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`)
          .send({ maxSlots: 50 });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
    });

    it('allows dean users to delete sections', async () => {
      const response = await request(app)
        .delete(`/api/sections/${section.id}`)
        .set('Authorization', `Bearer ${tokens.dean}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Section deleted successfully');
    });

    ['student', 'professor', 'registrar'].forEach((role) => {
      it(`denies ${role} users from deleting sections`, async () => {
        const freshSection = await prisma.section.create({
          data: {
            name: `IT101-Z${++uniqueCounter}`,
            subjectId: primarySubject.id,
            professorId: section.professorId,
            maxSlots: 30,
            availableSlots: 30,
            semester: 'first',
            schoolYear: '2024-2025',
            status: 'open'
          }
        });

        const response = await request(app)
          .delete(`/api/sections/${freshSection.id}`)
          .set('Authorization', `Bearer ${tokens[role]}`);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Access denied');
      });
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
