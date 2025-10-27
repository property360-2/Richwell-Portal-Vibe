import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRegistrarSummary,
  getProfessorSummary,
  getDeanSummary
} from '../dashboardMetrics.js';

describe('dashboardMetrics', () => {
  it('builds registrar summary values from analytics data', () => {
    const summary = getRegistrarSummary({
      enrollment: { total: 1200, pending: 150, confirmed: 1050 },
      grades: { approved: 900, pending: 75 }
    });

    assert.equal(summary.totalEnrollments, 1200);
    assert.equal(summary.pendingApprovals, 150);
    assert.equal(summary.approvedGrades, 900);
    assert.equal(summary.confirmedEnrollments, 1050);
    assert.equal(summary.pendingGrades, 75);
  });

  it('builds professor summary values from analytics data', () => {
    const summary = getProfessorSummary({
      statistics: {
        totalSections: 4,
        totalStudents: 120,
        incCount: 3,
        averageGrade: 1.75
      },
      sections: [{ name: 'CS101' }],
      gradeDistribution: { '1.0': 10 }
    });

    assert.equal(summary.totalSections, 4);
    assert.equal(summary.totalStudents, 120);
    assert.equal(summary.incCount, 3);
    assert.equal(summary.averageGrade, 1.75);
    assert.deepEqual(summary.sections, [{ name: 'CS101' }]);
    assert.deepEqual(summary.gradeDistribution, { '1.0': 10 });
  });

  it('builds dean summary aggregates from analytics data', () => {
    const summary = getDeanSummary({
      professorLoad: [
        { sections: 3, totalStudents: 90 },
        { sections: 2, totalStudents: 60 }
      ],
      subjectPerformance: [{ code: 'CS101' }]
    });

    assert.equal(summary.activeProfessors, 2);
    assert.equal(summary.totalSections, 5);
    assert.equal(summary.totalStudents, 150);
    assert.equal(summary.subjectsTracked, 1);
  });
});
