// backend/src/controllers/gradeController.js
import { PrismaClient } from '@prisma/client';
import { invalidateAnalyticsCacheForTerm } from '../utils/cache.js';

const prisma = new PrismaClient();

/**
 * @desc    Get professor's sections with students
 * @route   GET /api/grades/sections
 * @access  Private (Professor)
 */
export const getProfessorSections = async (req, res) => {
  try {
    const { professorId } = req.user;
    const { termId } = req.query;

    // Get current term if not specified
    let currentTerm;
    if (termId) {
      currentTerm = await prisma.academicTerm.findUnique({
        where: { id: parseInt(termId) }
      });
    } else {
      currentTerm = await prisma.academicTerm.findFirst({
        where: { isActive: true }
      });
    }

    if (!currentTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    // Get professor's sections
    const sections = await prisma.section.findMany({
      where: {
        professorId: professorId,
        semester: currentTerm.semester,
        schoolYear: currentTerm.schoolYear
      },
      include: {
        subject: true,
        enrollmentSubjects: {
          include: {
            enrollment: {
              include: {
                student: {
                  include: { user: true }
                }
              }
            },
            grade: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        sections,
        currentTerm
      }
    });
  } catch (error) {
    console.error('Get professor sections error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get professor sections'
    });
  }
};

/**
 * @desc    Update student grade
 * @route   PUT /api/grades/:enrollmentSubjectId
 * @access  Private (Professor)
 */
export const updateGrade = async (req, res) => {
  try {
    const { professorId } = req.user;
    const { enrollmentSubjectId } = req.params;
    const { gradeValue, remarks } = req.body;

    // Validate grade value
    const validGrades = [
      'grade_1_0', 'grade_1_25', 'grade_1_5', 'grade_1_75',
      'grade_2_0', 'grade_2_25', 'grade_2_5', 'grade_2_75',
      'grade_3_0', 'grade_4_0', 'grade_5_0', 'INC', 'DRP'
    ];

    if (!validGrades.includes(gradeValue)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid grade value'
      });
    }

    // Get enrollment subject and verify professor access
    const enrollmentSubject = await prisma.enrollmentSubject.findUnique({
      where: { id: parseInt(enrollmentSubjectId) },
      include: {
        section: true,
        enrollment: {
          include: { student: true }
        }
      }
    });

    if (!enrollmentSubject) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment subject not found'
      });
    }

    if (enrollmentSubject.section.professorId !== professorId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to grade this student'
      });
    }

    // Calculate repeat eligible date for failed grades
    let repeatEligibleDate = null;
    if (gradeValue === 'grade_5_0' || gradeValue === 'INC') {
      const subject = await prisma.subject.findUnique({
        where: { id: enrollmentSubject.subjectId }
      });

      if (subject) {
        const monthsToAdd = subject.subjectType === 'major' ? 6 : 12;
        repeatEligibleDate = new Date();
        repeatEligibleDate.setMonth(repeatEligibleDate.getMonth() + monthsToAdd);
      }
    }

    // Update or create grade
    const grade = await prisma.grade.upsert({
      where: { enrollmentSubjectId: parseInt(enrollmentSubjectId) },
      update: {
        gradeValue,
        remarks,
        dateEncoded: new Date(),
        repeatEligibleDate
      },
      create: {
        enrollmentSubjectId: parseInt(enrollmentSubjectId),
        gradeValue,
        remarks,
        encodedBy: professorId,
        dateEncoded: new Date(),
        repeatEligibleDate
      }
    });

    // Update student's INC status if needed
    if (gradeValue === 'INC') {
      await prisma.student.update({
        where: { id: enrollmentSubject.enrollment.studentId },
        data: { hasInc: true }
      });
    }

    try {
      invalidateAnalyticsCacheForTerm(enrollmentSubject.enrollment.termId);
    } catch (cacheError) {
      console.warn('Failed to invalidate analytics cache after grade update:', cacheError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Grade updated successfully',
      data: grade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update grade'
    });
  }
};

/**
 * @desc    Get grades for approval (Registrar)
 * @route   GET /api/grades/pending-approval
 * @access  Private (Registrar)
 */
export const getPendingGrades = async (req, res) => {
  try {
    const { termId } = req.query;

    let currentTerm;
    if (termId) {
      currentTerm = await prisma.academicTerm.findUnique({
        where: { id: parseInt(termId) }
      });
    } else {
      currentTerm = await prisma.academicTerm.findFirst({
        where: { isActive: true }
      });
    }

    if (!currentTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    // Get grades pending approval
    const pendingGrades = await prisma.grade.findMany({
      where: {
        approved: false,
        enrollmentSubject: {
          enrollment: {
            termId: currentTerm.id
          }
        }
      },
      include: {
        enrollmentSubject: {
          include: {
            enrollment: {
              include: {
                student: {
                  include: { user: true }
                }
              }
            },
            subject: true,
            section: {
              include: {
                professor: {
                  include: { user: true }
                }
              }
            }
          }
        },
        professor: {
          include: { user: true }
        }
      },
      orderBy: { dateEncoded: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: {
        pendingGrades,
        currentTerm
      }
    });
  } catch (error) {
    console.error('Get pending grades error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get pending grades'
    });
  }
};

/**
 * @desc    Approve grade
 * @route   PUT /api/grades/:gradeId/approve
 * @access  Private (Registrar)
 */
export const approveGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(gradeId) },
      include: {
        enrollmentSubject: {
          include: {
            enrollment: {
              include: { student: true }
            }
          }
        }
      }
    });

    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade not found'
      });
    }

    // Update grade as approved
    const updatedGrade = await prisma.grade.update({
      where: { id: parseInt(gradeId) },
      data: { approved: true }
    });

    // Update student GPA if grade is approved
    if (updatedGrade.approved) {
      await updateStudentGPA(grade.enrollmentSubject.enrollment.studentId);
    }

    res.status(200).json({
      status: 'success',
      message: 'Grade approved successfully',
      data: updatedGrade
    });
  } catch (error) {
    console.error('Approve grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve grade'
    });
  }
};

/**
 * @desc    Bulk approve grades
 * @route   PUT /api/grades/bulk-approve
 * @access  Private (Registrar)
 */
export const bulkApproveGrades = async (req, res) => {
  try {
    const { gradeIds } = req.body;

    if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide grade IDs to approve'
      });
    }

    // Update all grades as approved
    const result = await prisma.grade.updateMany({
      where: { id: { in: gradeIds } },
      data: { approved: true }
    });

    // Update student GPAs
    const grades = await prisma.grade.findMany({
      where: { id: { in: gradeIds } },
      include: {
        enrollmentSubject: {
          include: {
            enrollment: {
              include: { student: true }
            }
          }
        }
      }
    });

    const studentIds = [...new Set(grades.map(g => g.enrollmentSubject.enrollment.studentId))];
    
    for (const studentId of studentIds) {
      await updateStudentGPA(studentId);
    }

    res.status(200).json({
      status: 'success',
      message: `${result.count} grades approved successfully`
    });
  } catch (error) {
    console.error('Bulk approve grades error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve grades'
    });
  }
};

/**
 * Helper function to update student GPA
 */
const updateStudentGPA = async (studentId) => {
  try {
    // Get all approved grades for the student
    const grades = await prisma.grade.findMany({
      where: {
        approved: true,
        enrollmentSubject: {
          enrollment: {
            studentId: studentId
          }
        },
        gradeValue: { not: 'DRP' }
      },
      include: {
        enrollmentSubject: true
      }
    });

    let totalPoints = 0;
    let totalUnits = 0;
    let hasInc = false;

    for (const grade of grades) {
      const units = grade.enrollmentSubject.units;
      const gradeValue = grade.gradeValue;

      if (gradeValue === 'INC') {
        hasInc = true;
      } else {
        const numericGrade = getNumericGrade(gradeValue);
        if (numericGrade !== null) {
          totalPoints += numericGrade * units;
          totalUnits += units;
        }
      }
    }

    const gpa = totalUnits > 0 ? (totalPoints / totalUnits) : 0;

    // Update student record
    await prisma.student.update({
      where: { id: studentId },
      data: {
        gpa: gpa,
        hasInc: hasInc
      }
    });
  } catch (error) {
    console.error('Update student GPA error:', error);
  }
};

/**
 * Helper function to get numeric grade
 */
const getNumericGrade = (gradeValue) => {
  const gradeMap = {
    'grade_1_0': 1.0,
    'grade_1_25': 1.25,
    'grade_1_5': 1.5,
    'grade_1_75': 1.75,
    'grade_2_0': 2.0,
    'grade_2_25': 2.25,
    'grade_2_5': 2.5,
    'grade_2_75': 2.75,
    'grade_3_0': 3.0,
    'grade_4_0': 4.0,
    'grade_5_0': 5.0
  };
  return gradeMap[gradeValue] || null;
};
