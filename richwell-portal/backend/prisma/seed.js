// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Roles
  console.log('Creating roles...');
  const roles = [
    { name: 'student' },
    { name: 'professor' },
    { name: 'registrar' },
    { name: 'admission' },
    { name: 'dean' }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    });
  }
  console.log('✓ Roles created');

  // 2. Create a test program
  console.log('Creating test program...');
  const program = await prisma.program.upsert({
    where: { code: 'BSCS' },
    update: {},
    create: {
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
      description: 'Computer Science Program'
    }
  });
  console.log('✓ Program created');

  // 3. Get role IDs
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  const professorRole = await prisma.role.findUnique({ where: { name: 'professor' } });
  const registrarRole = await prisma.role.findUnique({ where: { name: 'registrar' } });
  const admissionRole = await prisma.role.findUnique({ where: { name: 'admission' } });
  const deanRole = await prisma.role.findUnique({ where: { name: 'dean' } });

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 4. Create test users
  console.log('Creating test users...');

  // Registrar
  const registrarUser = await prisma.user.upsert({
    where: { email: 'registrar@richwell.edu' },
    update: {},
    create: {
      email: 'registrar@richwell.edu',
      password: hashedPassword,
      roleId: registrarRole.id,
      status: 'active'
    }
  });
  console.log('✓ Registrar created: registrar@richwell.edu / password123');

  // Admission
  const admissionUser = await prisma.user.upsert({
    where: { email: 'admission@richwell.edu' },
    update: {},
    create: {
      email: 'admission@richwell.edu',
      password: hashedPassword,
      roleId: admissionRole.id,
      status: 'active'
    }
  });
  console.log('✓ Admission created: admission@richwell.edu / password123');

  // Dean
  const deanUser = await prisma.user.upsert({
    where: { email: 'dean@richwell.edu' },
    update: {},
    create: {
      email: 'dean@richwell.edu',
      password: hashedPassword,
      roleId: deanRole.id,
      status: 'active'
    }
  });
  console.log('✓ Dean created: dean@richwell.edu / password123');

  // Professor
  const professorUser = await prisma.user.upsert({
    where: { email: 'professor@richwell.edu' },
    update: {},
    create: {
      email: 'professor@richwell.edu',
      password: hashedPassword,
      roleId: professorRole.id,
      status: 'active'
    }
  });

  await prisma.professor.upsert({
    where: { userId: professorUser.id },
    update: {},
    create: {
      userId: professorUser.id,
      department: 'Computer Science',
      employmentStatus: 'full_time'
    }
  });
  console.log('✓ Professor created: professor@richwell.edu / password123');

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@richwell.edu' },
    update: {},
    create: {
      email: 'student@richwell.edu',
      password: hashedPassword,
      roleId: studentRole.id,
      status: 'active'
    }
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      studentNo: '2024-0001',
      programId: program.id,
      yearLevel: 1,
      status: 'regular'
    }
  });
  console.log('✓ Student created: student@richwell.edu / password123 (Student No: 2024-0001)');

  // 5. Create Academic Term
  console.log('Creating academic term...');
  await prisma.academicTerm.upsert({
    where: {
      schoolYear_semester: {
        schoolYear: '2024-2025',
        semester: 'first'
      }
    },
    update: {},
    create: {
      schoolYear: '2024-2025',
      semester: 'first',
      isActive: true
    }
  });
  console.log('✓ Academic term created: 2024-2025 First Semester');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('='.repeat(50));
  console.log('TEST ACCOUNTS:');
  console.log('='.repeat(50));
  console.log('Registrar  : registrar@richwell.edu  / password123');
  console.log('Admission  : admission@richwell.edu  / password123');
  console.log('Dean       : dean@richwell.edu       / password123');
  console.log('Professor  : professor@richwell.edu  / password123');
  console.log('Student    : student@richwell.edu    / password123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });