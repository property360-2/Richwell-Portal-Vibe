// frontend/src/pages/dashboards/DeanDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, BookOpenCheck, GraduationCap, Layers3 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Chart from '../../components/common/Chart';
import KpiCard from '../../components/common/KpiCard';
import { apiService } from '../../utils/api';
import { getDeanSummary } from './dashboardMetrics';

const formatNumber = value =>
  typeof value === 'number' ? value.toLocaleString('en-US') : '0';

const DeanDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await apiService.get('/analytics/dean');
        setAnalytics(response.data.data);
      } catch {
        setError('Failed to load dean analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const professorLoadColumns = useMemo(() => ([
    { header: 'Professor', field: 'name' },
    { header: 'Department', field: 'department' },
    {
      header: 'Sections',
      field: 'sections',
      width: '120px',
      render: value => formatNumber(value)
    },
    {
      header: 'Students',
      field: 'totalStudents',
      width: '140px',
      render: value => formatNumber(value)
    }
  ]), []);

  const subjectPerformanceColumns = useMemo(() => ([
    { header: 'Subject', field: 'name' },
    {
      header: 'Code',
      field: 'code',
      width: '120px',
      render: value => (
        <span className="font-mono text-sm text-indigo-600">{value}</span>
      )
    },
    {
      header: 'Sections',
      field: 'sections',
      width: '120px',
      render: value => formatNumber(value)
    },
    {
      header: 'Students',
      field: 'totalStudents',
      width: '140px',
      render: value => formatNumber(value)
    },
    {
      header: 'Pass Rate',
      field: 'passRate',
      width: '140px',
      render: value => `${(value ?? 0).toFixed(1)}%`
    }
  ]), []);

  const summary = useMemo(() => getDeanSummary(analytics), [analytics]);

  const metricCards = useMemo(() => ([
    {
      title: 'Active Professors',
      value: formatNumber(summary.activeProfessors),
      subtitle: 'Handling classes this term',
      gradient: 'from-blue-500 to-blue-600',
      icon: <Users size={28} />
    },
    {
      title: 'Active Sections',
      value: formatNumber(summary.totalSections),
      subtitle: 'Across all departments',
      gradient: 'from-purple-500 to-purple-600',
      icon: <Layers3 size={28} />
    },
    {
      title: 'Students Covered',
      value: formatNumber(summary.totalStudents),
      subtitle: 'Enrolled in monitored sections',
      gradient: 'from-emerald-500 to-emerald-600',
      icon: <GraduationCap size={28} />
    },
    {
      title: 'Subjects Tracked',
      value: formatNumber(summary.subjectsTracked),
      subtitle: 'With recorded grades this term',
      gradient: 'from-rose-500 to-rose-600',
      icon: <BookOpenCheck size={28} />
    }
  ]), [summary]);

  const professorLoadData = useMemo(() => {
    const dataset = analytics?.professorLoad ?? [];

    if (dataset.length === 0) {
      return {
        labels: ['No data'],
        datasets: [
          {
            label: 'Sections',
            data: [0],
            backgroundColor: '#DDD6FE'
          }
        ]
      };
    }

    return {
      labels: dataset.map(item => item.name ?? 'Professor'),
      datasets: [
        {
          label: 'Sections',
          data: dataset.map(item => item.sections ?? 0),
          backgroundColor: '#8B5CF6'
        }
      ]
    };
  }, [analytics]);

  const subjectPassRateData = useMemo(() => {
    const dataset = analytics?.subjectPerformance ?? [];

    if (dataset.length === 0) {
      return {
        labels: ['No data'],
        datasets: [
          {
            label: 'Pass Rate',
            data: [0],
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    }

    return {
      labels: dataset.map(item => item.code ?? item.name ?? 'Subject'),
      datasets: [
        {
          label: 'Pass Rate',
          data: dataset.map(item => item.passRate ?? 0),
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [analytics]);

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
          <h1 className="text-3xl font-bold text-gray-900">Dean Dashboard 🎯</h1>
          <p className="text-gray-600 mt-1">Academic oversight and management</p>
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
                <p>Subjects Monitored: {formatNumber(summary.subjectsTracked)}</p>
                <p>Professors Reporting: {formatNumber(summary.activeProfessors)}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metricCards.map(card => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Chart
            title="Professor Section Load"
            type="bar"
            data={professorLoadData}
            height={320}
          />
          <Chart
            title="Subject Pass Rates"
            type="line"
            data={subjectPassRateData}
            height={320}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Professor Load">
            <Table
              columns={professorLoadColumns}
              data={analytics?.professorLoad ?? []}
            />
          </Card>

          <Card title="Subject Performance">
            <Table
              columns={subjectPerformanceColumns}
              data={analytics?.subjectPerformance ?? []}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeanDashboard;
