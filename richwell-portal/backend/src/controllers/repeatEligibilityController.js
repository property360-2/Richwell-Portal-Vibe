// backend/src/controllers/repeatEligibilityController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Check repeat eligibility for student
 * @route   GET /api/repeat-eligibility/:studentId
 * @access  Private (Student, Registrar)
 */
export const checkRepeatEligibility = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId } = req.query;

    // Get student's failed subjects with repeat eligibility dates
    const failedSubjects = await prisma.grade.findMany({
      where: {
        gradeValue: 'grade_5_0',
        enrollmentSubject: {
          enrollment: {
            studentId: parseInt(studentId)
          }
        },
        repeatEligibleDate: { not: null }
      },
      include: {
        enrollmentSubject: {
          include: {
            subject: true,
            enrollment: {
              include: { term: true }
            }
          }
        }
      },
      orderBy: { dateEncoded: 'desc' }
    });

    // Filter by subject if specified
    let eligibleSubjects = failedSubjects;
    if (subjectId) {
      eligibleSubjects = failedSubjects.filter(grade => 
        grade.enrollmentSubject.subjectId === parseInt(subjectId)
      );
    }

    // Check eligibility for each subject
    const eligibilityResults = eligibleSubjects.map(grade => {
      const now = new Date();
      const eligibleDate = new Date(grade.repeatEligibleDate);
      const isEligible = now >= eligibleDate;
      
      const daysUntilEligible = isEligible 
        ? 0 
        : Math.ceil((eligibleDate - now) / (1000 * 60 * 60 * 24));

      return {
        subject: {
          id: grade.enrollmentSubject.subject.id,
          code: grade.enrollmentSubject.subject.code,
          name: grade.enrollmentSubject.subject.name,
          units: grade.enrollmentSubject.subject.units,
          subjectType: grade.enrollmentSubject.subject.subjectType
        },
        failedTerm: {
          schoolYear: grade.enrollmentSubject.enrollment.term.schoolYear,
          semester: grade.enrollmentSubject.enrollment.term.semester
        },
        dateFailed: grade.dateEncoded,
        repeatEligibleDate: grade.repeatEligibleDate,
        isEligible,
        daysUntilEligible,
        canEnroll: isEligible
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        studentId: parseInt(studentId),
        eligibleSubjects: eligibilityResults,
        totalEligible: eligibilityResults.filter(s => s.isEligible).length,
        totalPending: eligibilityResults.filter(s => !s.isEligible).length
      }
    });
  } catch (error) {
    console.error('Check repeat eligibility error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check repeat eligibility'
    });
  }
};

/**
 * @desc    Get all students with repeat eligibility issues
 * @route   GET /api/repeat-eligibility/students
 * @access  Private (Registrar, Dean)
 */
export const getAllStudentsRepeatEligibility = async (req, res) => {
  try {
    const { programId, yearLevel } = req.query;

    // Build where clause
    const whereClause = {};
    if (programId) {
      whereClause.programId = parseInt(programId);
    }
    if (yearLevel) {
      whereClause.yearLevel = parseInt(yearLevel);
    }

    // Get students with failed subjects
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: true,
        program: true,
        enrollments: {
          include: {
            enrollmentSubjects: {
              include: {
                grade: {
                  where: {
                    gradeValue: 'grade_5_0',
                    repeatEligibleDate: { not: null }
                  }
                },
                subject: true
              }
            }
          }
        }
      }
    });

    // Process students with repeat eligibility data
    const studentsWithRepeatData = students.map(student => {
      const failedSubjects = student.enrollments.flatMap(enrollment =>
        enrollment.enrollmentSubjects
          .filter(es => es.grade && es.grade.length > 0)
          .map(es => ({
            subject: es.subject,
            grade: es.grade[0],
            term: enrollment
          }))
      );

      const now = new Date();
      const eligibleSubjects = failedSubjects.filter(fs => {
        const eligibleDate = new Date(fs.grade.repeatEligibleDate);
        return now >= eligibleDate;
      });

      const pendingSubjects = failedSubjects.filter(fs => {
        const eligibleDate = new Date(fs.grade.repeatEligibleDate);
        return now < eligibleDate;
      });

      return {
        student: {
          id: student.id,
          studentNo: student.studentNo,
          user: student.user,
          program: student.program,
          yearLevel: student.yearLevel
        },
        failedSubjects: failedSubjects.length,
        eligibleSubjects: eligibleSubjects.length,
        pendingSubjects: pendingSubjects.length,
        subjects: failedSubjects.map(fs => ({
          subject: fs.subject,
          grade: fs.grade,
          term: fs.term,
          isEligible: new Date(fs.grade.repeatEligibleDate) <= now
        }))
      };
    }).filter(student => student.failedSubjects > 0);

    res.status(200).json({
      status: 'success',
      data: {
        students: studentsWithRepeatData,
        totalStudents: studentsWithRepeatData.length,
        totalEligible: studentsWithRepeatData.reduce((sum, s) => sum + s.eligibleSubjects, 0),
        totalPending: studentsWithRepeatData.reduce((sum, s) => sum + s.pendingSubjects, 0)
      }
    });
  } catch (error) {
    console.error('Get all students repeat eligibility error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get students repeat eligibility'
    });
  }
};

/**
 * @desc    Update repeat eligibility date
 * @route   PUT /api/repeat-eligibility/:gradeId
 * @access  Private (Registrar, Dean)
 */
export const updateRepeatEligibilityDate = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide new eligibility date'
      });
    }

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(gradeId) },
      include: {
        enrollmentSubject: {
          include: { subject: true }
        }
      }
    });

    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade not found'
      });
    }

    if (grade.gradeValue !== 'grade_5_0') {
      return res.status(400).json({
        status: 'error',
        message: 'Only failed grades can have repeat eligibility dates'
      });
    }

    // Update repeat eligibility date
    const updatedGrade = await prisma.grade.update({
      where: { id: parseInt(gradeId) },
      data: {
        repeatEligibleDate: new Date(newDate)
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Repeat eligibility date updated successfully',
      data: updatedGrade
    });
  } catch (error) {
    console.error('Update repeat eligibility date error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update repeat eligibility date'
    });
  }
};
