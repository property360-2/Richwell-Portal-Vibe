// backend/src/controllers/incResolutionController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get student's INC subjects
 * @route   GET /api/inc-resolutions/student
 * @access  Private (Student)
 */
export const getStudentIncSubjects = async (req, res) => {
  try {
    const { studentId } = req.user;

    // Get student's INC subjects
    const incSubjects = await prisma.grade.findMany({
      where: {
        gradeValue: 'INC',
        enrollmentSubject: {
          enrollment: {
            studentId: studentId
          }
        }
      },
      include: {
        enrollmentSubject: {
          include: {
            subject: true,
            section: {
              include: {
                professor: {
                  include: { user: true }
                }
              }
            },
            enrollment: {
              include: { term: true }
            }
          }
        }
      },
      orderBy: { dateEncoded: 'desc' }
    });

    // Get existing resolutions
    const existingResolutions = await prisma.incResolution.findMany({
      where: { studentId: studentId },
      include: {
        subject: true,
        professor: {
          include: { user: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        incSubjects: incSubjects.map(inc => ({
          id: inc.id,
          subject: inc.enrollmentSubject.subject,
          section: inc.enrollmentSubject.section,
          term: inc.enrollmentSubject.enrollment.term,
          dateEncoded: inc.dateEncoded,
          remarks: inc.remarks,
          hasResolution: existingResolutions.some(res => 
            res.subjectId === inc.enrollmentSubject.subjectId
          )
        })),
        existingResolutions
      }
    });
  } catch (error) {
    console.error('Get student INC subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get INC subjects'
    });
  }
};

/**
 * @desc    Get professor's INC resolutions
 * @route   GET /api/inc-resolutions/professor
 * @access  Private (Professor)
 */
export const getProfessorIncResolutions = async (req, res) => {
  try {
    const { professorId } = req.user;

    // Get INC resolutions for professor's subjects
    const resolutions = await prisma.incResolution.findMany({
      where: { professorId: professorId },
      include: {
        student: {
          include: { user: true }
        },
        subject: true,
        professor: {
          include: { user: true }
        }
      },
      orderBy: { dateSubmitted: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: resolutions
    });
  } catch (error) {
    console.error('Get professor INC resolutions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get INC resolutions'
    });
  }
};

/**
 * @desc    Create INC resolution
 * @route   POST /api/inc-resolutions
 * @access  Private (Professor)
 */
export const createIncResolution = async (req, res) => {
  try {
    const { professorId } = req.user;
    const { studentId, subjectId, newGrade, remarks } = req.body;

    // Validation
    if (!studentId || !subjectId || !newGrade) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide student ID, subject ID, and new grade'
      });
    }

    // Validate grade value
    const validGrades = [
      'grade_1_0', 'grade_1_25', 'grade_1_5', 'grade_1_75',
      'grade_2_0', 'grade_2_25', 'grade_2_5', 'grade_2_75',
      'grade_3_0', 'grade_4_0', 'grade_5_0'
    ];

    if (!validGrades.includes(newGrade)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid grade value for INC resolution'
      });
    }

    // Check if student has INC in this subject
    const incGrade = await prisma.grade.findFirst({
      where: {
        gradeValue: 'INC',
        enrollmentSubject: {
          enrollment: { studentId: studentId },
          subjectId: subjectId
        }
      }
    });

    if (!incGrade) {
      return res.status(400).json({
        status: 'error',
        message: 'Student does not have INC in this subject'
      });
    }

    // Check if resolution already exists
    const existingResolution = await prisma.incResolution.findFirst({
      where: {
        studentId: studentId,
        subjectId: subjectId,
        professorId: professorId
      }
    });

    if (existingResolution) {
      return res.status(400).json({
        status: 'error',
        message: 'INC resolution already exists for this subject'
      });
    }

    // Create resolution
    const resolution = await prisma.incResolution.create({
      data: {
        studentId: studentId,
        subjectId: subjectId,
        oldGrade: 'INC',
        newGrade: newGrade,
        professorId: professorId,
        approvedByRegistrar: false
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'INC resolution created successfully',
      data: resolution
    });
  } catch (error) {
    console.error('Create INC resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create INC resolution'
    });
  }
};

/**
 * @desc    Get pending INC resolutions (Registrar)
 * @route   GET /api/inc-resolutions/pending
 * @access  Private (Registrar)
 */
export const getPendingIncResolutions = async (req, res) => {
  try {
    const resolutions = await prisma.incResolution.findMany({
      where: { approvedByRegistrar: false },
      include: {
        student: {
          include: { user: true }
        },
        subject: true,
        professor: {
          include: { user: true }
        }
      },
      orderBy: { dateSubmitted: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: resolutions
    });
  } catch (error) {
    console.error('Get pending INC resolutions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get pending INC resolutions'
    });
  }
};

/**
 * @desc    Approve INC resolution
 * @route   PUT /api/inc-resolutions/:resolutionId/approve
 * @access  Private (Registrar)
 */
export const approveIncResolution = async (req, res) => {
  try {
    const { resolutionId } = req.params;

    const resolution = await prisma.incResolution.findUnique({
      where: { id: parseInt(resolutionId) },
      include: {
        student: true,
        subject: true
      }
    });

    if (!resolution) {
      return res.status(404).json({
        status: 'error',
        message: 'INC resolution not found'
      });
    }

    if (resolution.approvedByRegistrar) {
      return res.status(400).json({
        status: 'error',
        message: 'INC resolution already approved'
      });
    }

    // Update resolution as approved
    const updatedResolution = await prisma.incResolution.update({
      where: { id: parseInt(resolutionId) },
      data: { approvedByRegistrar: true }
    });

    // Update the original grade
    const grade = await prisma.grade.findFirst({
      where: {
        gradeValue: 'INC',
        enrollmentSubject: {
          enrollment: { studentId: resolution.studentId },
          subjectId: resolution.subjectId
        }
      }
    });

    if (grade) {
      await prisma.grade.update({
        where: { id: grade.id },
        data: {
          gradeValue: resolution.newGrade,
          approved: true
        }
      });
    }

    // Update student's INC status
    const studentIncCount = await prisma.grade.count({
      where: {
        gradeValue: 'INC',
        enrollmentSubject: {
          enrollment: { studentId: resolution.studentId }
        }
      }
    });

    await prisma.student.update({
      where: { id: resolution.studentId },
      data: { hasInc: studentIncCount > 0 }
    });

    res.status(200).json({
      status: 'success',
      message: 'INC resolution approved successfully',
      data: updatedResolution
    });
  } catch (error) {
    console.error('Approve INC resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve INC resolution'
    });
  }
};

/**
 * @desc    Bulk approve INC resolutions
 * @route   PUT /api/inc-resolutions/bulk-approve
 * @access  Private (Registrar)
 */
export const bulkApproveIncResolutions = async (req, res) => {
  try {
    const { resolutionIds } = req.body;

    if (!resolutionIds || !Array.isArray(resolutionIds) || resolutionIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide resolution IDs to approve'
      });
    }

    // Get resolutions
    const resolutions = await prisma.incResolution.findMany({
      where: { 
        id: { in: resolutionIds },
        approvedByRegistrar: false
      },
      include: {
        student: true,
        subject: true
      }
    });

    // Update all resolutions as approved
    await prisma.incResolution.updateMany({
      where: { id: { in: resolutionIds } },
      data: { approvedByRegistrar: true }
    });

    // Update original grades
    for (const resolution of resolutions) {
      const grade = await prisma.grade.findFirst({
        where: {
          gradeValue: 'INC',
          enrollmentSubject: {
            enrollment: { studentId: resolution.studentId },
            subjectId: resolution.subjectId
          }
        }
      });

      if (grade) {
        await prisma.grade.update({
          where: { id: grade.id },
          data: {
            gradeValue: resolution.newGrade,
            approved: true
          }
        });
      }
    }

    // Update student INC statuses
    const studentIds = [...new Set(resolutions.map(r => r.studentId))];
    
    for (const studentId of studentIds) {
      const studentIncCount = await prisma.grade.count({
        where: {
          gradeValue: 'INC',
          enrollmentSubject: {
            enrollment: { studentId: studentId }
          }
        }
      });

      await prisma.student.update({
        where: { id: studentId },
        data: { hasInc: studentIncCount > 0 }
      });
    }

    res.status(200).json({
      status: 'success',
      message: `${resolutions.length} INC resolution(s) approved successfully`
    });
  } catch (error) {
    console.error('Bulk approve INC resolutions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve INC resolutions'
    });
  }
};
