// backend/tests/grade.test.js
import request from 'supertest';
import app from '../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Grade submission and approval workflow', () => {
  const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  let professorToken;
  let registrarToken;
  let professorId;
  let studentId;
  let enrollmentSubjectIds;

  beforeEach(async () => {
    // Clean tables to maintain isolation across tests
    await prisma.grade.deleteMany();
    await prisma.enrollmentSubject.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.analyticsLog.deleteMany();
    await prisma.section.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.student.deleteMany();
    await prisma.professor.deleteMany();
    await prisma.program.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Create base roles
    const studentRole = await prisma.role.create({ data: { name: 'student' } });
    const professorRole = await prisma.role.create({ data: { name: 'professor' } });
    const registrarRole = await prisma.role.create({ data: { name: 'registrar' } });

    // Create academic structures
    const program = await prisma.program.create({
      data: {
        name: 'Computer Science',
        code: 'BSCS',
        description: 'Bachelor of Science in Computer Science'
      }
    });

    const subjectOne = await prisma.subject.create({
      data: {
        code: 'CS101',
        name: 'Introduction to Programming',
        units: 3,
        subjectType: 'major',
        programId: program.id
      }
    });

    const subjectTwo = await prisma.subject.create({
      data: {
        code: 'CS102',
        name: 'Data Structures',
        units: 3,
        subjectType: 'major',
        programId: program.id
      }
    });

    const term = await prisma.academicTerm.create({
      data: {
        schoolYear: '2024-2025',
        semester: 'first',
        isActive: true
      }
    });

    // Create users
    const studentUser = await prisma.user.create({
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

    const registrarUser = await prisma.user.create({
      data: {
        email: 'registrar@example.com',
        password: hashedPassword,
        roleId: registrarRole.id,
        status: 'active'
      }
    });

    // Create person records
    const professor = await prisma.professor.create({
      data: {
        userId: professorUser.id,
        department: 'Computer Science'
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentNo: '2024-00001',
        programId: program.id,
        yearLevel: 1,
        status: 'regular'
      }
    });

    const sectionOne = await prisma.section.create({
      data: {
        name: 'CS101-A',
        subjectId: subjectOne.id,
        professorId: professor.id,
        maxSlots: 30,
        availableSlots: 30,
        semester: 'first',
        schoolYear: '2024-2025',
        status: 'open'
      }
    });

    const sectionTwo = await prisma.section.create({
      data: {
        name: 'CS102-A',
        subjectId: subjectTwo.id,
        professorId: professor.id,
        maxSlots: 30,
        availableSlots: 30,
        semester: 'first',
        schoolYear: '2024-2025',
        status: 'open'
      }
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        termId: term.id,
        totalUnits: 6,
        status: 'pending'
      }
    });

    const enrollmentSubjectOne = await prisma.enrollmentSubject.create({
      data: {
        enrollmentId: enrollment.id,
        sectionId: sectionOne.id,
        subjectId: subjectOne.id,
        units: 3
      }
    });

    const enrollmentSubjectTwo = await prisma.enrollmentSubject.create({
      data: {
        enrollmentId: enrollment.id,
        sectionId: sectionTwo.id,
        subjectId: subjectTwo.id,
        units: 3
      }
    });

    // Authenticate professor and registrar
    const professorLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'professor@example.com', password: 'password' });

    professorToken = professorLogin.body.token;

    const registrarLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'registrar@example.com', password: 'password' });

    registrarToken = registrarLogin.body.token;

    professorId = professor.id;
    studentId = student.id;
    enrollmentSubjectIds = [enrollmentSubjectOne.id, enrollmentSubjectTwo.id];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows professors to submit grades that remain pending approval', async () => {
    const response = await request(app)
      .put(`/api/grades/${enrollmentSubjectIds[0]}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        gradeValue: 'grade_1_5',
        remarks: 'Great progress'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.gradeValue).toBe('grade_1_5');
    expect(response.body.data.approved).toBe(false);

    const storedGrade = await prisma.grade.findUnique({
      where: { enrollmentSubjectId: enrollmentSubjectIds[0] }
    });

    expect(storedGrade).not.toBeNull();
    expect(storedGrade.gradeValue).toBe('grade_1_5');
    expect(storedGrade.approved).toBe(false);
    expect(storedGrade.encodedBy).toBe(professorId);
  });

  it('rejects invalid grade values', async () => {
    const response = await request(app)
      .put(`/api/grades/${enrollmentSubjectIds[0]}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        gradeValue: 'invalid_grade',
        remarks: 'This should fail'
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid grade value');

    const gradeCount = await prisma.grade.count();
    expect(gradeCount).toBe(0);
  });

  it('approves a single grade and updates the student GPA', async () => {
    const gradeResponse = await request(app)
      .put(`/api/grades/${enrollmentSubjectIds[0]}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        gradeValue: 'grade_1_5',
        remarks: 'Solid performance'
      });

    const gradeId = gradeResponse.body.data.id;

    const approvalResponse = await request(app)
      .put(`/api/grades/${gradeId}/approve`)
      .set('Authorization', `Bearer ${registrarToken}`)
      .send();

    expect(approvalResponse.status).toBe(200);
    expect(approvalResponse.body.status).toBe('success');

    const approvedGrade = await prisma.grade.findUnique({ where: { id: gradeId } });
    expect(approvedGrade.approved).toBe(true);

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const gpa = student.gpa ? parseFloat(student.gpa.toString()) : null;
    expect(gpa).toBeCloseTo(1.5, 5);
  });

  it('approves multiple grades in bulk and recalculates the GPA', async () => {
    const firstGrade = await request(app)
      .put(`/api/grades/${enrollmentSubjectIds[0]}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        gradeValue: 'grade_1_5',
        remarks: 'First subject'
      });

    const secondGrade = await request(app)
      .put(`/api/grades/${enrollmentSubjectIds[1]}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        gradeValue: 'grade_2_5',
        remarks: 'Second subject'
      });

    const gradeIds = [firstGrade.body.data.id, secondGrade.body.data.id];

    const bulkResponse = await request(app)
      .put('/api/grades/bulk-approve')
      .set('Authorization', `Bearer ${registrarToken}`)
      .send({ gradeIds });

    expect(bulkResponse.status).toBe(200);
    expect(bulkResponse.body.status).toBe('success');
    expect(bulkResponse.body.message).toContain('grades approved successfully');

    const grades = await prisma.grade.findMany({ where: { id: { in: gradeIds } } });
    expect(grades.every(grade => grade.approved)).toBe(true);

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const gpa = student.gpa ? parseFloat(student.gpa.toString()) : null;
    expect(gpa).toBeCloseTo(2.0, 5);
  });
});
