// frontend/src/pages/dashboards/ProfessorDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, FileText, BarChart3, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
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
      } catch (err) {
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

  const gradeDistribution = useMemo(() =>
    Object.entries(summary.gradeDistribution).map(([grade, count]) => ({
      grade,
      count
    })), [summary]);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricCards.map(card => (
            <Card
              key={card.title}
              className={`bg-gradient-to-br ${card.gradient} text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white text-opacity-80">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-xs text-white text-opacity-80 mt-2">{card.subtitle}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  {card.icon}
                </div>
              </div>
            </Card>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Section Overview">
            <Table
              columns={sectionColumns}
              data={summary.sections}
            />
          </Card>

          <Card title="Grade Distribution">
            <div className="space-y-3">
              {gradeDistribution.length === 0 ? (
                <p className="text-sm text-gray-500">No grades recorded yet.</p>
              ) : (
                gradeDistribution.map(item => (
                  <div key={item.grade} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{item.grade}</span>
                    <span className="text-gray-600">{formatNumber(item.count)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
