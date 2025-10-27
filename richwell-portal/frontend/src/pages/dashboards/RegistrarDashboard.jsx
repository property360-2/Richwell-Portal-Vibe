// frontend/src/pages/dashboards/RegistrarDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users2, Clock4, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import { apiService } from '../../utils/api';
import { getRegistrarSummary } from './dashboardMetrics';

const formatNumber = value =>
  typeof value === 'number' ? value.toLocaleString('en-US') : '0';

const RegistrarDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await apiService.get('/analytics/registrar');
        setAnalytics(response.data.data);
      } catch (err) {
        setError('Failed to load registrar analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const programColumns = useMemo(() => ([
    {
      header: 'Program',
      field: 'name'
    },
    {
      header: 'Code',
      field: 'code',
      width: '120px',
      render: value => (
        <span className="font-mono text-sm text-blue-700">{value}</span>
      )
    },
    {
      header: 'Enrolled Students',
      field: 'enrolledStudents',
      width: '180px',
      render: value => formatNumber(value)
    },
    {
      header: 'Total Students',
      field: 'totalStudents',
      width: '160px',
      render: value => formatNumber(value)
    }
  ]), []);

  const summary = useMemo(() => getRegistrarSummary(analytics), [analytics]);

  const metricCards = useMemo(() => ([
    {
      title: 'Total Enrollments',
      value: formatNumber(summary.totalEnrollments),
      subtitle: 'All enrollments in the active term',
      gradient: 'from-blue-500 to-blue-600',
      icon: <Users2 size={28} />
    },
    {
      title: 'Pending Approvals',
      value: formatNumber(summary.pendingApprovals),
      subtitle: 'Awaiting registrar confirmation',
      gradient: 'from-amber-500 to-amber-600',
      icon: <Clock4 size={28} />
    },
    {
      title: 'Approved Grades',
      value: formatNumber(summary.approvedGrades),
      subtitle: 'Grades finalized for the term',
      gradient: 'from-emerald-500 to-emerald-600',
      icon: <CheckCircle2 size={28} />
    }
  ]), [summary]);

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
          <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard 📋</h1>
          <p className="text-gray-600 mt-1">Manage student records and approvals</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {analytics?.currentTerm && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Current Term</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {analytics.currentTerm.semester} • {analytics.currentTerm.schoolYear}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 text-sm text-gray-600">
                <p>Confirmed Enrollments: {formatNumber(summary.confirmedEnrollments)}</p>
                <p>Pending Grades: {formatNumber(summary.pendingGrades)}</p>
              </div>
            </div>
          </Card>
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

        <Card title="Program Enrollment Overview">
          <Table
            columns={programColumns}
            data={analytics?.programs ?? []}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
