// backend/src/controllers/analyticsController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get student analytics
 * @route   GET /api/analytics/student
 * @access  Private (Student)
 */
export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.user;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { program: true }
    });

    // Get enrollment history
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: studentId },
      include: {
        term: true,
        enrollmentSubjects: {
          include: {
            subject: true,
            grade: true
          }
        }
      },
      orderBy: { dateEnrolled: 'desc' }
    });

    // Calculate statistics
    const totalSubjects = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.enrollmentSubjects.length, 0
    );

    const totalUnits = enrollments.reduce((sum, enrollment) => 
      sum + enrollment.totalUnits, 0
    );

    const incSubjects = enrollments.flatMap(enrollment =>
      enrollment.enrollmentSubjects.filter(es => es.grade?.gradeValue === 'INC')
    );

    const failedSubjects = enrollments.flatMap(enrollment =>
      enrollment.enrollmentSubjects.filter(es => es.grade?.gradeValue === 'grade_5_0')
    );

    // GPA calculation
    let totalPoints = 0;
    let gradedUnits = 0;

    enrollments.forEach(enrollment => {
      enrollment.enrollmentSubjects.forEach(enrollmentSubject => {
        if (enrollmentSubject.grade && enrollmentSubject.grade.approved) {
          const units = enrollmentSubject.units;
          const gradeValue = enrollmentSubject.grade.gradeValue;
          const numericGrade = getNumericGrade(gradeValue);
          
          if (numericGrade !== null) {
            totalPoints += numericGrade * units;
            gradedUnits += units;
          }
        }
      });
    });

    const gpa = gradedUnits > 0 ? (totalPoints / gradedUnits) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        student: {
          id: student.id,
          studentNo: student.studentNo,
          program: student.program.name,
          yearLevel: student.yearLevel,
          gpa: gpa,
          hasInc: student.hasInc,
          status: student.status
        },
        statistics: {
          totalSubjects,
          totalUnits,
          incCount: incSubjects.length,
          failedCount: failedSubjects.length,
          gpa: gpa
        },
        enrollments: enrollments.slice(0, 5) // Last 5 enrollments
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get student analytics'
    });
  }
};

/**
 * @desc    Get professor analytics
 * @route   GET /api/analytics/professor
 * @access  Private (Professor)
 */
export const getProfessorAnalytics = async (req, res) => {
  try {
    const { professorId } = req.user;

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
            grade: true,
            enrollment: {
              include: { student: true }
            }
          }
        }
      }
    });

    // Calculate statistics
    const totalStudents = sections.reduce((sum, section) => 
      sum + section.enrollmentSubjects.length, 0
    );

    const totalSubjects = sections.length;

    // Grade distribution
    const gradeDistribution = {
      '1.0': 0, '1.25': 0, '1.5': 0, '1.75': 0,
      '2.0': 0, '2.25': 0, '2.5': 0, '2.75': 0,
      '3.0': 0, '4.0': 0, '5.0': 0, 'INC': 0, 'DRP': 0
    };

    let totalGraded = 0;
    let totalPoints = 0;
    let incCount = 0;

    sections.forEach(section => {
      section.enrollmentSubjects.forEach(enrollmentSubject => {
        if (enrollmentSubject.grade) {
          const gradeValue = enrollmentSubject.grade.gradeValue;
          const formattedGrade = formatGrade(gradeValue);
          
          if (gradeDistribution.hasOwnProperty(formattedGrade)) {
            gradeDistribution[formattedGrade]++;
          }

          if (gradeValue === 'INC') {
            incCount++;
          } else {
            const numericGrade = getNumericGrade(gradeValue);
            if (numericGrade !== null) {
              totalPoints += numericGrade;
              totalGraded++;
            }
          }
        }
      });
    });

    const averageGrade = totalGraded > 0 ? (totalPoints / totalGraded) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        professor: {
          id: professorId,
          sections: totalSubjects,
          students: totalStudents
        },
        statistics: {
          totalSections: totalSubjects,
          totalStudents,
          averageGrade: averageGrade,
          incCount,
          gradedStudents: totalGraded
        },
        gradeDistribution,
        sections: sections.map(section => ({
          id: section.id,
          name: section.name,
          subject: section.subject.name,
          studentCount: section.enrollmentSubjects.length,
          gradedCount: section.enrollmentSubjects.filter(es => es.grade).length
        }))
      }
    });
  } catch (error) {
    console.error('Get professor analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get professor analytics'
    });
  }
};

/**
 * @desc    Get registrar analytics
 * @route   GET /api/analytics/registrar
 * @access  Private (Registrar)
 */
export const getRegistrarAnalytics = async (req, res) => {
  try {
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

    // Get enrollment statistics
    const totalEnrollments = await prisma.enrollment.count({
      where: { termId: currentTerm.id }
    });

    const confirmedEnrollments = await prisma.enrollment.count({
      where: { 
        termId: currentTerm.id,
        status: 'confirmed'
      }
    });

    const pendingEnrollments = await prisma.enrollment.count({
      where: { 
        termId: currentTerm.id,
        status: 'pending'
      }
    });

    // Get grade statistics
    const totalGrades = await prisma.grade.count({
      where: {
        enrollmentSubject: {
          enrollment: {
            termId: currentTerm.id
          }
        }
      }
    });

    const approvedGrades = await prisma.grade.count({
      where: {
        approved: true,
        enrollmentSubject: {
          enrollment: {
            termId: currentTerm.id
          }
        }
      }
    });

    const pendingGrades = await prisma.grade.count({
      where: {
        approved: false,
        enrollmentSubject: {
          enrollment: {
            termId: currentTerm.id
          }
        }
      }
    });

    // Get program statistics
    const programStats = await prisma.program.findMany({
      include: {
        students: {
          include: {
            enrollments: {
              where: { termId: currentTerm.id }
            }
          }
        }
      }
    });

    const programEnrollments = programStats.map(program => ({
      name: program.name,
      code: program.code,
      enrolledStudents: program.students.filter(student => 
        student.enrollments.length > 0
      ).length,
      totalStudents: program.students.length
    }));

    res.status(200).json({
      status: 'success',
      data: {
        currentTerm: {
          schoolYear: currentTerm.schoolYear,
          semester: currentTerm.semester
        },
        enrollment: {
          total: totalEnrollments,
          confirmed: confirmedEnrollments,
          pending: pendingEnrollments
        },
        grades: {
          total: totalGrades,
          approved: approvedGrades,
          pending: pendingGrades
        },
        programs: programEnrollments
      }
    });
  } catch (error) {
    console.error('Get registrar analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get registrar analytics'
    });
  }
};

/**
 * @desc    Get dean analytics
 * @route   GET /api/analytics/dean
 * @access  Private (Dean)
 */
export const getDeanAnalytics = async (req, res) => {
  try {
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

    // Get professor load statistics
    const professors = await prisma.professor.findMany({
      include: {
        user: true,
        sections: {
          where: {
            semester: currentTerm.semester,
            schoolYear: currentTerm.schoolYear
          },
          include: {
            enrollmentSubjects: true
          }
        }
      }
    });

    const professorLoad = professors.map(professor => ({
      id: professor.id,
      name: professor.user.email,
      department: professor.department,
      sections: professor.sections.length,
      totalStudents: professor.sections.reduce((sum, section) => 
        sum + section.enrollmentSubjects.length, 0
      )
    }));

    // Get subject performance
    const subjects = await prisma.subject.findMany({
      include: {
        sections: {
          where: {
            semester: currentTerm.semester,
            schoolYear: currentTerm.schoolYear
          },
          include: {
            enrollmentSubjects: {
              include: { grade: true }
            }
          }
        }
      }
    });

    const subjectPerformance = subjects.map(subject => {
      const allGrades = subject.sections.flatMap(section =>
        section.enrollmentSubjects
          .filter(es => es.grade && es.grade.approved)
          .map(es => getNumericGrade(es.grade.gradeValue))
          .filter(grade => grade !== null)
      );

      const averageGrade = allGrades.length > 0 
        ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length 
        : 0;

      return {
        code: subject.code,
        name: subject.name,
        sections: subject.sections.length,
        totalStudents: subject.sections.reduce((sum, section) => 
          sum + section.enrollmentSubjects.length, 0
        ),
        averageGrade: averageGrade,
        passRate: allGrades.length > 0 
          ? (allGrades.filter(grade => grade <= 3.0).length / allGrades.length) * 100 
          : 0
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        currentTerm: {
          schoolYear: currentTerm.schoolYear,
          semester: currentTerm.semester
        },
        professorLoad,
        subjectPerformance: subjectPerformance.filter(sp => sp.totalStudents > 0)
      }
    });
  } catch (error) {
    console.error('Get dean analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get dean analytics'
    });
  }
};

/**
 * @desc    Get admission analytics
 * @route   GET /api/analytics/admission
 * @access  Private (Admission, Registrar, Dean)
 */
export const getAdmissionAnalytics = async (req, res) => {
  try {
    const roleName = req.user?.role?.name;

    if (!['admission', 'registrar', 'dean'].includes(roleName)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admission role required.'
      });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWindow = new Date(startOfDay);
    startOfWindow.setDate(startOfWindow.getDate() - 6);

    const enrollmentLogs = await prisma.analyticsLog.findMany({
      where: { action: 'enrollment_status' },
      orderBy: { timestamp: 'desc' }
    });

    const parsedLogs = enrollmentLogs
      .map((log) => {
        try {
          const payload = log.description ? JSON.parse(log.description) : {};
          const enrollmentId = Number(payload.enrollmentId);

          if (!enrollmentId || !payload.status) {
            return null;
          }

          return {
            enrollmentId,
            status: payload.status,
            termId: payload.termId ?? null,
            studentId: payload.studentId ?? null,
            source: payload.source ?? 'unknown',
            metadata: payload.metadata ?? {},
            timestamp: log.timestamp
          };
        } catch (parseError) {
          console.warn('Skipping malformed enrollment analytics log:', parseError);
          return null;
        }
      })
      .filter(Boolean);

    const latestStatusByEnrollment = new Map();
    parsedLogs.forEach((log) => {
      const existing = latestStatusByEnrollment.get(log.enrollmentId);
      if (!existing || existing.timestamp < log.timestamp) {
        latestStatusByEnrollment.set(log.enrollmentId, log);
      }
    });

    const totalEnrollments = latestStatusByEnrollment.size;
    const pendingEnrollments = Array.from(latestStatusByEnrollment.values())
      .filter((log) => log.status === 'pending').length;
    const confirmedEnrollments = Array.from(latestStatusByEnrollment.values())
      .filter((log) => log.status === 'confirmed').length;

    const confirmedToday = parsedLogs.filter((log) =>
      log.status === 'confirmed' &&
      log.timestamp >= startOfDay &&
      log.timestamp <= endOfDay
    ).length;

    const confirmedLogsLast7Days = parsedLogs.filter((log) =>
      log.status === 'confirmed' &&
      log.timestamp >= startOfWindow &&
      log.timestamp <= endOfDay
    );

    const dailyMap = confirmedLogsLast7Days.reduce((acc, log) => {
      const key = log.timestamp.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const dailyTrend = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(startOfWindow);
      day.setDate(startOfWindow.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      return {
        date: key,
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dailyMap[key] || 0
      };
    });

    const confirmedEnrollmentIds = Array.from(latestStatusByEnrollment.entries())
      .filter(([, log]) => log.status === 'confirmed')
      .map(([enrollmentId]) => enrollmentId);

    const recentEnrollmentIds = [];
    const seenRecent = new Set();
    for (const log of parsedLogs) {
      if (!seenRecent.has(log.enrollmentId)) {
        seenRecent.add(log.enrollmentId);
        recentEnrollmentIds.push(log.enrollmentId);
      }
      if (recentEnrollmentIds.length >= 5) {
        break;
      }
    }

    const [programEnrollments, recentEnrollments] = await Promise.all([
      confirmedEnrollmentIds.length
        ? prisma.enrollment.findMany({
            where: { id: { in: confirmedEnrollmentIds } },
            include: {
              student: {
                select: {
                  program: { select: { id: true, name: true } }
                }
              }
            }
          })
        : Promise.resolve([]),
      recentEnrollmentIds.length
        ? prisma.enrollment.findMany({
            where: { id: { in: recentEnrollmentIds } },
            include: {
              student: {
                select: {
                  studentNo: true,
                  program: { select: { name: true } },
                  user: { select: { email: true } }
                }
              },
              term: true,
              enrollmentSubjects: true
            }
          })
        : Promise.resolve([])
    ]);

    const programDistributionMap = programEnrollments.reduce((acc, enrollment) => {
      const program = enrollment.student?.program;
      if (!program) return acc;
      acc[program.name] = (acc[program.name] || 0) + 1;
      return acc;
    }, {});

    const programDistribution = Object.entries(programDistributionMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const recentEnrollmentMap = recentEnrollments.reduce((acc, enrollment) => {
      acc.set(enrollment.id, enrollment);
      return acc;
    }, new Map());

    const recent = recentEnrollmentIds
      .map((enrollmentId) => {
        const enrollment = recentEnrollmentMap.get(enrollmentId);
        const statusLog = latestStatusByEnrollment.get(enrollmentId);

        if (!enrollment || !statusLog) {
          return null;
        }

        return {
          id: enrollment.id,
          studentNo: enrollment.student?.studentNo,
          studentEmail: enrollment.student?.user?.email,
          program: enrollment.student?.program?.name,
          status: statusLog.status,
          totalUnits: enrollment.totalUnits,
          subjects: enrollment.enrollmentSubjects.length,
          term: `${enrollment.term.schoolYear} ${enrollment.term.semester}`,
          dateEnrolled: enrollment.dateEnrolled,
          lastStatusAt: statusLog.timestamp
        };
      })
      .filter(Boolean);

    const confirmationRate = totalEnrollments > 0
      ? (confirmedEnrollments / totalEnrollments) * 100
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          pending: pendingEnrollments,
          confirmedToday,
          total: totalEnrollments,
          confirmed: confirmedEnrollments,
          confirmationRate
        },
        trend: dailyTrend,
        programs: programDistribution,
        recent
      }
    });
  } catch (error) {
    console.error('Get admission analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get admission analytics'
    });
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

/**
 * Helper function to format grade
 */
const formatGrade = (gradeValue) => {
  const gradeMap = {
    'grade_1_0': '1.0',
    'grade_1_25': '1.25',
    'grade_1_5': '1.5',
    'grade_1_75': '1.75',
    'grade_2_0': '2.0',
    'grade_2_25': '2.25',
    'grade_2_5': '2.5',
    'grade_2_75': '2.75',
    'grade_3_0': '3.0',
    'grade_4_0': '4.0',
    'grade_5_0': '5.0',
    'INC': 'INC',
    'DRP': 'DRP'
  };
  return gradeMap[gradeValue] || gradeValue;
};
