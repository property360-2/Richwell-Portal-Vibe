'use strict'

const crypto = require('crypto')
const {
  PrismaClient,
  UserRole,
  SubjectType,
  StudentStatus,
  AssignedBy,
  EnrollmentStatus,
  IncStatus
} = require('@prisma/client')

const prisma = new PrismaClient()

const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex')

async function resetDatabase () {
  await prisma.$transaction([
    prisma.auditTrail.deleteMany(),
    prisma.incRecord.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.assignedSubject.deleteMany(),
    prisma.section.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.student.deleteMany(),
    prisma.course.deleteMany(),
    prisma.schoolTerm.deleteMany(),
    prisma.user.deleteMany()
  ])
}

async function seedUsers () {
  const [dean, registrar, admission, professor] = await Promise.all([
    prisma.user.create({
      data: {
        username: 'dean.richwell',
        password: hashPassword('password123'),
        role: UserRole.dean
      }
    }),
    prisma.user.create({
      data: {
        username: 'registrar.richwell',
        password: hashPassword('password123'),
        role: UserRole.registrar
      }
    }),
    prisma.user.create({
      data: {
        username: 'admission.richwell',
        password: hashPassword('password123'),
        role: UserRole.admission
      }
    }),
    prisma.user.create({
      data: {
        username: 'prof.richwell',
        password: hashPassword('password123'),
        role: UserRole.professor
      }
    })
  ])

  return { dean, registrar, admission, professor }
}

async function seedCatalog ({ dean, professor }) {
  const course = await prisma.course.create({
    data: {
      code: 'BSCS',
      name: 'BS Computer Science',
      deanId: dean.id
    }
  })

  const [progIntro, dataStruct] = await Promise.all([
    prisma.subject.create({
      data: {
        code: 'CS101',
        title: 'Intro to Programming',
        units: 3,
        courseId: course.id,
        yearLevel: 1,
        semester: 1,
        subjectType: SubjectType.major
      }
    }),
    prisma.subject.create({
      data: {
        code: 'CS201',
        title: 'Data Structures',
        units: 3,
        courseId: course.id,
        yearLevel: 2,
        semester: 1,
        subjectType: SubjectType.major
      }
    })
  ])

  const section = await prisma.section.create({
    data: {
      name: 'BSCS-1A',
      courseId: course.id,
      yearLevel: 1,
      semester: 1,
      professorId: professor.id,
      createdById: dean.id,
      slots: 30
    }
  })

  const assignment = await prisma.assignedSubject.create({
    data: {
      professorId: professor.id,
      sectionId: section.id,
      subjectId: progIntro.id,
      term: '1st Semester',
      year: '2025-2026'
    }
  })

  return { course, progIntro, dataStruct, section, assignment }
}

async function seedStudents ({ course, progIntro, section, registrar }) {
  const student = await prisma.student.create({
    data: {
      studentNumber: '2025-0001',
      name: 'Alex Rivera',
      sex: 'Female',
      courseId: course.id,
      yearLevel: 1,
      status: StudentStatus.new,
      documents: {
        birthCertificate: {
          filename: 'birthcert_2025-0001.pdf',
          verified: true
        }
      }
    }
  })

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      subjectId: progIntro.id,
      sectionId: section.id,
      assignedBy: AssignedBy.registrar,
      term: '1st Semester',
      year: '2025-2026',
      status: EnrollmentStatus.enrolled
    }
  })

  await prisma.auditTrail.create({
    data: {
      actorId: registrar.id,
      action: 'assign_subject',
      tableName: 'enrollments',
      recordId: enrollment.id,
      newValue: JSON.stringify({
        studentId: student.studentNumber,
        subjectCode: 'CS101',
        term: enrollment.term
      })
    }
  })

  return { student, enrollment }
}

async function seedIncRecord ({ professor, registrar, enrollment }) {
  await prisma.incRecord.create({
    data: {
      enrollmentId: enrollment.id,
      issuedById: professor.id,
      issuedAt: new Date('2025-10-01T00:00:00Z'),
      deadline: new Date('2026-04-01T00:00:00Z'),
      resolvedById: registrar.id,
      resolvedAt: new Date('2026-01-15T00:00:00Z'),
      status: IncStatus.resolved
    }
  })
}

async function seedTerms () {
  await prisma.schoolTerm.create({
    data: {
      schoolYear: '2025-2026',
      semester: 1,
      active: true
    }
  })
}

async function main () {
  await resetDatabase()
  const actors = await seedUsers()
  const catalog = await seedCatalog(actors)
  const { enrollment } = await seedStudents({
    ...catalog,
    registrar: actors.registrar
  })
  await seedIncRecord({
    professor: actors.professor,
    registrar: actors.registrar,
    enrollment
  })
  await seedTerms()
}

main()
  .then(async () => {
    await prisma.$disconnect()
    // eslint-disable-next-line no-console
    console.log('Seed data loaded successfully')
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to seed database', error)
    await prisma.$disconnect()
    process.exit(1)
  })
