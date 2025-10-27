// frontend/src/pages/dashboards/AdmissionDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  FileCheck2,
  Percent
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Chart from '../../components/common/Chart';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import KpiCard from '../../components/common/KpiCard';
import { apiService } from '../../utils/api';

const AdmissionDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/analytics/admission');
      setAnalytics(response.data.data);
    } catch {
      setError('Failed to load admission analytics');
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'New Applicants',
      value: analytics?.metrics?.pending ?? 0,
      icon: <UserPlus size={26} />,
      subtitle: 'Pending enrollments awaiting review',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Confirmed Today',
      value: analytics?.metrics?.confirmedToday ?? 0,
      icon: <CheckCircle2 size={26} />,
      subtitle: 'Successfully enrolled today',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Total Applications',
      value: analytics?.metrics?.total ?? 0,
      icon: <FileCheck2 size={26} />,
      subtitle: 'All enrollment submissions',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Confirmation Rate',
      value: `${(analytics?.metrics?.confirmationRate ?? 0).toFixed(1)}%`,
      icon: <Percent size={26} />,
      subtitle: 'Confirmed vs total applications',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const dailyTrendData = {
    labels: analytics?.trend?.map(point => point.label) ?? [],
    datasets: [
      {
        label: 'Confirmed Enrollments',
        data: analytics?.trend?.map(point => point.count) ?? [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const programDistributionData = {
    labels: analytics?.programs?.map(program => program.name) ?? [],
    datasets: [
      {
        label: 'Confirmed Enrollments',
        data: analytics?.programs?.map(program => program.count) ?? [],
        backgroundColor: [
          '#22C55E',
          '#F97316',
          '#0EA5E9',
          '#8B5CF6',
          '#EC4899',
          '#FACC15'
        ]
      }
    ]
  };

  const recentColumns = [
    {
      header: 'Student No.',
      field: 'studentNo',
      width: '140px',
      render: value => <span className="font-mono text-sm text-blue-700">{value || 'N/A'}</span>
    },
    {
      header: 'Email',
      field: 'studentEmail',
      render: value => value || 'N/A'
    },
    {
      header: 'Program',
      field: 'program',
      render: value => value || 'Unassigned'
    },
    {
      header: 'Subjects',
      field: 'subjects',
      width: '100px'
    },
    {
      header: 'Units',
      field: 'totalUnits',
      width: '80px'
    },
    {
      header: 'Term',
      field: 'term',
      render: value => value || '—'
    },
    {
      header: 'Enrolled On',
      field: 'dateEnrolled',
      render: value => (value ? new Date(value).toLocaleString() : '—')
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Admission Dashboard 🎓</h1>
          <p className="text-gray-600 mt-1">
            Monitor applicant intake and enrollment confirmations
          </p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metricCards.map(card => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Chart
            title="7-Day Enrollment Trend"
            type="line"
            data={dailyTrendData}
            className="xl:col-span-2"
            height={320}
          />

          <Chart
            title="Top Programs by Confirmed Enrollments"
            type="doughnut"
            data={programDistributionData}
            height={320}
          />
        </div>

        {/* Recent Enrollments */}
        <Card title="Recent Enrollment Activity">
          <Table
            columns={recentColumns}
            data={analytics?.recent ?? []}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdmissionDashboard;
