// backend/src/controllers/admissionController.js
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  generateStudentNumber,
  generateTemporaryPassword,
  getRoleId,
  ROLES
} from '../utils/auth.js';
import { queueEmailNotification } from '../utils/notifications.js';

const prisma = new PrismaClient();

/**
 * @desc    Onboard a new student and generate temporary credentials
 * @route   POST /api/admissions/students
 * @access  Private (Admission, Registrar)
 */
export const onboardStudent = async (req, res) => {
  try {
    const { email, programId, yearLevel, sendEmail = false } = req.body;

    if (!email || !programId || !yearLevel) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, program, and year level are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const parsedProgramId = Number(programId);
    const parsedYearLevel = Number(yearLevel);

    if (Number.isNaN(parsedProgramId) || Number.isNaN(parsedYearLevel)) {
      return res.status(400).json({
        status: 'error',
        message: 'Program and year level must be valid numbers'
      });
    }

    if (parsedYearLevel < 1 || parsedYearLevel > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Year level must be between 1 and 5'
      });
    }

    const program = await prisma.program.findUnique({
      where: { id: parsedProgramId },
      select: { id: true, name: true }
    });

    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Selected program was not found'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'A user with this email already exists'
      });
    }

    const studentRoleId = await getRoleId(prisma, ROLES.STUDENT);

    if (!studentRoleId) {
      return res.status(500).json({
        status: 'error',
        message: 'Student role is not configured'
      });
    }

    const studentNo = await generateStudentNumber(prisma);
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          roleId: studentRoleId,
          status: 'active'
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentNo,
          programId: parsedProgramId,
          yearLevel: parsedYearLevel
        },
        include: {
          program: true
        }
      });

      return { user, student };
    });

    let notificationQueued = false;
    if (sendEmail) {
      try {
        await queueEmailNotification(prisma, {
          userId: result.user.id,
          recipient: normalizedEmail,
          subject: 'Richwell Portal Temporary Credentials',
          body: `Welcome to Richwell Portal!\n\nStudent Number: ${studentNo}\nTemporary Password: ${temporaryPassword}\n\nPlease log in and update your password immediately.`
        });
        notificationQueued = true;
      } catch (notificationError) {
        console.error('Queue email notification error:', notificationError);
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Student onboarded successfully',
      data: {
        studentId: result.student.id,
        studentNo,
        email: normalizedEmail,
        program: result.student.program?.name || null,
        yearLevel: result.student.yearLevel,
        temporaryPassword,
        notificationQueued
      }
    });
  } catch (error) {
    console.error('Onboard student error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to onboard student'
    });
  }
};

export default {
  onboardStudent
};
