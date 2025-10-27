// frontend/src/pages/dashboards/ProfessorDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, FileText, BarChart3, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Chart from '../../components/common/Chart';
import KpiCard from '../../components/common/KpiCard';
import { apiService } from '../../utils/api';
import { getProfessorSummary } from './dashboardMetrics';

const formatNumber = value =>
  typeof value === 'number' ? value.toLocaleString('en-US') : '0';

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await apiService.get('/analytics/professor');
        setAnalytics(response.data.data);
      } catch {
        setError('Failed to load professor analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const summary = useMemo(() => getProfessorSummary(analytics), [analytics]);

  const metricCards = useMemo(() => ([
    {
      title: 'My Sections',
      value: formatNumber(summary.totalSections),
      gradient: 'from-purple-500 to-purple-600',
      subtitle: 'Assigned for the current term',
      icon: <Users size={28} />
    },
    {
      title: 'Total Students',
      value: formatNumber(summary.totalStudents),
      gradient: 'from-blue-500 to-blue-600',
      subtitle: 'Across all active sections',
      icon: <FileText size={28} />
    },
    {
      title: 'Incomplete Grades',
      value: formatNumber(summary.incCount),
      gradient: 'from-amber-500 to-amber-600',
      subtitle: 'Students marked as INC',
      icon: <BarChart3 size={28} />
    }
  ]), [summary]);

  const sectionColumns = useMemo(() => ([
    { header: 'Section', field: 'name' },
    { header: 'Subject', field: 'subject' },
    {
      header: 'Students',
      field: 'studentCount',
      width: '140px',
      render: value => formatNumber(value)
    },
    {
      header: 'Graded',
      field: 'gradedCount',
      width: '120px',
      render: value => formatNumber(value)
    }
  ]), []);

  const gradeDistributionData = useMemo(() => {
    const entries = Object.entries(summary.gradeDistribution ?? {});

    if (entries.length === 0) {
      return {
        labels: ['No data'],
        datasets: [
          {
            data: [0],
            backgroundColor: ['#E5E7EB'],
            borderWidth: 0
          }
        ]
      };
    }

    const palette = ['#6366F1', '#22C55E', '#F97316', '#F43F5E', '#0EA5E9'];

    return {
      labels: entries.map(([grade]) => grade),
      datasets: [
        {
          data: entries.map(([, value]) => value),
          backgroundColor: entries.map((_, index) => palette[index % palette.length]),
          borderWidth: 0
        }
      ]
    };
  }, [summary]);

  const sectionEnrollmentData = useMemo(() => {
    const sections = summary.sections ?? [];

    if (sections.length === 0) {
      return {
        labels: ['No sections'],
        datasets: [
          {
            label: 'Students',
            data: [0],
            backgroundColor: '#BFDBFE'
          }
        ]
      };
    }

    return {
      labels: sections.map(section => section.name ?? 'Unnamed'),
      datasets: [
        {
          label: 'Students',
          data: sections.map(section => section.studentCount ?? 0),
          backgroundColor: '#6366F1'
        }
      ]
    };
  }, [summary]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard 👨‍🏫</h1>
          <p className="text-gray-600 mt-1">Manage your classes and grades</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metricCards.map(card => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        <Card title="My Department">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Department</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.professor?.department || 'Not Assigned'}
              </p>
            </div>
            <div className="flex items-center text-gray-600">
              <GraduationCap className="mr-2" size={20} />
              <span>
                Average Grade: {summary.averageGrade?.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Chart
            title="Grade Distribution"
            type="doughnut"
            data={gradeDistributionData}
            height={320}
          />
          <Chart
            title="Section Enrollment"
            type="bar"
            data={sectionEnrollmentData}
            height={320}
          />
        </div>

        <Card title="Section Overview">
          <Table
            columns={sectionColumns}
            data={summary.sections}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
