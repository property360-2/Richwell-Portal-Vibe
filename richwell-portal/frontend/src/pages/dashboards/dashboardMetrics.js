export const getRegistrarSummary = (analytics = {}) => {
  const enrollment = analytics.enrollment ?? {};
  const grades = analytics.grades ?? {};

  return {
    totalEnrollments: enrollment.total ?? 0,
    pendingApprovals: enrollment.pending ?? 0,
    approvedGrades: grades.approved ?? 0,
    confirmedEnrollments: enrollment.confirmed ?? 0,
    pendingGrades: grades.pending ?? 0
  };
};

export const getProfessorSummary = (analytics = {}) => {
  const statistics = analytics.statistics ?? {};
  const gradeDistribution = analytics.gradeDistribution ?? {};

  return {
    totalSections: statistics.totalSections ?? 0,
    totalStudents: statistics.totalStudents ?? 0,
    incCount: statistics.incCount ?? 0,
    averageGrade: statistics.averageGrade ?? 0,
    sections: analytics.sections ?? [],
    gradeDistribution
  };
};

export const getDeanSummary = (analytics = {}) => {
  const professorLoad = analytics.professorLoad ?? [];
  const subjectPerformance = analytics.subjectPerformance ?? [];

  const totalSections = professorLoad.reduce(
    (sum, professor) => sum + (professor.sections ?? 0),
    0
  );

  const totalStudents = professorLoad.reduce(
    (sum, professor) => sum + (professor.totalStudents ?? 0),
    0
  );

  return {
    activeProfessors: professorLoad.length,
    totalSections,
    totalStudents,
    subjectsTracked: subjectPerformance.length
  };
};
