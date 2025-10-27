// backend/src/controllers/enrollmentController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STAFF_ROLES = ['admission', 'registrar'];

const resolveStudentIdFromRequest = (req) => {
  const roleName = req.user && req.user.role ? req.user.role.name : null;

  if (roleName === 'student' && req.user.studentId) {
    return req.user.studentId;
  }

  if (STAFF_ROLES.includes(roleName)) {
    const studentIdSource =
      (req.params && req.params.studentId) ||
      (req.query && req.query.studentId) ||
      (req.body && req.body.studentId);

    if (!studentIdSource) {
      return null;
    }

    const parsedId = parseInt(studentIdSource, 10);
    return Number.isNaN(parsedId) ? null : parsedId;
  }

  return null;
};

/**
 * @desc    Get available subjects for enrollment
 * @route   GET /api/enrollments/available-subjects
 * @access  Private (Student)
 */
export const getAvailableSubjects = async (req, res) => {
  try {
    const studentId = resolveStudentIdFromRequest(req);
    const isStaffView = req.user && req.user.role && STAFF_ROLES.includes(req.user.role.name);

    if (!studentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID is required to get available subjects'
      });
    }
    const { termId } = req.query;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { program: true }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Get current term
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true }
    });

    if (!currentTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    // Get subjects for student's program
    const subjects = await prisma.subject.findMany({
      where: {
        programId: student.programId,
        OR: [
          { yearStanding: null }, // No year restriction
          { yearStanding: student.yearLevel } // Matches student's year level
        ]
      },
      include: {
        sections: {
          where: {
            semester: currentTerm.semester,
            schoolYear: currentTerm.schoolYear,
            status: 'open',
            availableSlots: { gt: 0 }
          },
          include: {
            professor: {
              include: { user: true }
            }
          }
        },
        prerequisite: true
      }
    });

    // Filter subjects based on prerequisites, INC status, and repeat eligibility
    const availableSubjects = [];

    for (const subject of subjects) {
      // Check prerequisites
      if (subject.prerequisiteId) {
        const prerequisiteGrade = await prisma.grade.findFirst({
          where: {
            enrollmentSubject: {
              enrollment: {
                studentId: studentId,
                term: {
                  schoolYear: { not: currentTerm.schoolYear }
                }
              },
              subjectId: subject.prerequisiteId
            },
            gradeValue: { not: 'INC' }
          }
        });

        if (!prerequisiteGrade || prerequisiteGrade.gradeValue === 'DRP') {
          continue; // Skip if prerequisite not met
        }
      }

      // Check for INC blocking
      if (student.hasInc) {
        const incSubjects = await prisma.grade.findMany({
          where: {
            enrollmentSubject: {
              enrollment: {
                studentId: studentId,
                term: {
                  schoolYear: { not: currentTerm.schoolYear }
                }
              },
              gradeValue: 'INC'
            }
          },
          include: {
            enrollmentSubject: {
              include: { subject: true }
            }
          }
        });

        // Check if current subject is related to any INC
        const hasRelatedInc = incSubjects.some(inc => 
          inc.enrollmentSubject.subject.code === subject.code ||
          subject.prerequisiteId === inc.enrollmentSubject.subjectId
        );

        if (hasRelatedInc) {
          continue; // Skip if related to INC
        }
      }

      // Check repeat eligibility for failed subjects
      const failedGrade = await prisma.grade.findFirst({
        where: {
          gradeValue: 'grade_5_0',
          enrollmentSubject: {
            enrollment: { studentId: studentId },
            subjectId: subject.id
          }
        }
      });

      if (failedGrade && failedGrade.repeatEligibleDate) {
        const now = new Date();
        const eligibleDate = new Date(failedGrade.repeatEligibleDate);
        
        if (now < eligibleDate) {
          continue; // Skip if not yet eligible for repeat
        }
      }

      availableSubjects.push(subject);
    }

    const responsePayload = {
      subjects: availableSubjects,
      currentTerm,
      student: {
        id: student.id,
        yearLevel: student.yearLevel,
        program: student.program.name,
        hasInc: student.hasInc
      }
    };

    if (isStaffView) {
      responsePayload.requestedBy = req.user.role.name;
    }

    res.status(200).json({
      status: 'success',
      data: responsePayload
    });
  } catch (error) {
    console.error('Get available subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get available subjects'
    });
  }
};

/**
 * @desc    Get recommended subjects for student
 * @route   GET /api/enrollments/recommended-subjects
 * @access  Private (Student)
 */
export const getRecommendedSubjects = async (req, res) => {
  try {
    const studentId = resolveStudentIdFromRequest(req);

    if (!studentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID is required to get recommended subjects'
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { program: true }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true }
    });

    if (!currentTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    // Get recommended subjects based on year level and semester
    const recommendedSubjects = await prisma.subject.findMany({
      where: {
        programId: student.programId,
        recommendedYear: student.yearLevel,
        recommendedSemester: currentTerm.semester
      },
      include: {
        sections: {
          where: {
            semester: currentTerm.semester,
            schoolYear: currentTerm.schoolYear,
            status: 'open',
            availableSlots: { gt: 0 }
          },
          include: {
            professor: {
              include: { user: true }
            }
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: recommendedSubjects
    });
  } catch (error) {
    console.error('Get recommended subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recommended subjects'
    });
  }
};

/**
 * @desc    Enroll student in subjects
 * @route   POST /api/enrollments/enroll
 * @access  Private (Student)
 */
export const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { sectionIds, totalUnits } = req.body;

    // Validation
    if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select at least one subject'
      });
    }

    if (totalUnits > 30) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 30 units allowed per semester'
      });
    }

    // Get current term
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true }
    });

    if (!currentTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    // Check if student already enrolled in current term
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        termId: currentTerm.id,
        status: { not: 'cancelled' }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Student already enrolled in current term'
      });
    }

    // Validate sections and check availability
    const sections = await prisma.section.findMany({
      where: {
        id: { in: sectionIds },
        status: 'open',
        availableSlots: { gt: 0 }
      },
      include: {
        subject: true
      }
    });

    if (sections.length !== sectionIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Some sections are no longer available'
      });
    }

    // Create enrollment transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create enrollment record
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: studentId,
          termId: currentTerm.id,
          totalUnits: totalUnits,
          status: 'pending'
        }
      });

      // Create enrollment subjects
      const enrollmentSubjects = [];
      for (const section of sections) {
        const enrollmentSubject = await tx.enrollmentSubject.create({
          data: {
            enrollmentId: enrollment.id,
            sectionId: section.id,
            subjectId: section.subjectId,
            units: section.subject.units
          }
        });
        enrollmentSubjects.push(enrollmentSubject);

        // Update section available slots
        await tx.section.update({
          where: { id: section.id },
          data: {
            availableSlots: { decrement: 1 }
          }
        });
      }

      return { enrollment, enrollmentSubjects };
    });

    res.status(201).json({
      status: 'success',
      message: 'Enrollment submitted successfully',
      data: {
        enrollmentId: result.enrollment.id,
        totalUnits: result.enrollment.totalUnits,
        subjects: result.enrollmentSubjects.length
      }
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enroll student'
    });
  }
};

/**
 * @desc    Get student's enrollment history
 * @route   GET /api/enrollments/history
 * @access  Private (Student)
 */
export const getEnrollmentHistory = async (req, res) => {
  try {
    const studentId = resolveStudentIdFromRequest(req);

    if (!studentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID is required to get enrollment history'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: studentId },
      include: {
        term: true,
        enrollmentSubjects: {
          include: {
            subject: true,
            section: {
              include: {
                professor: {
                  include: { user: true }
                }
              }
            },
            grade: true
          }
        }
      },
      orderBy: { dateEnrolled: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollment history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get enrollment history'
    });
  }
};

/**
 * @desc    Cancel enrollment
 * @route   PUT /api/enrollments/:enrollmentId/cancel
 * @access  Private (Student)
 */
export const cancelEnrollment = async (req, res) => {
  try {
    const { studentId } = req.user;
    const { enrollmentId } = req.params;

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: parseInt(enrollmentId),
        studentId: studentId,
        status: 'pending'
      },
      include: {
        enrollmentSubjects: {
          include: { section: true }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found or cannot be cancelled'
      });
    }

    // Update enrollment status and restore section slots
    await prisma.$transaction(async (tx) => {
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'cancelled' }
      });

      // Restore section slots
      for (const enrollmentSubject of enrollment.enrollmentSubjects) {
        await tx.section.update({
          where: { id: enrollmentSubject.sectionId },
          data: {
            availableSlots: { increment: 1 }
          }
        });
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Enrollment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel enrollment'
    });
  }
};
