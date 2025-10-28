// frontend/src/pages/admission/AdmissionAnalyticsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Users, Target, Clock3, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Chart from '../../components/common/Chart';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { apiService } from '../../utils/api';

const AdmissionAnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [overviewRes, pipelineRes, demographicsRes, engagementRes] = await Promise.all([
        apiService.getAdmissionAnalyticsOverview(),
        apiService.getAdmissionPipelineAnalytics(),
        apiService.getAdmissionDemographicsAnalytics(),
        apiService.getAdmissionEngagementAnalytics()
      ]);

      setOverview(overviewRes.data?.data || null);
      setPipeline(pipelineRes.data?.data || null);
      setDemographics(demographicsRes.data?.data || null);
      setEngagement(engagementRes.data?.data || null);
    } catch (err) {
      console.error('Failed to load admission analytics', err);
      const message = err.response?.data?.message || 'Unable to load analytics at the moment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const conversionRateValue = overview?.totals?.conversionRate;
  const formattedConversionRate = useMemo(() => {
    if (typeof conversionRateValue === 'number') {
      return conversionRateValue.toFixed(1);
    }

    if (conversionRateValue === undefined || conversionRateValue === null) {
      return '0.0';
    }

    return String(conversionRateValue);
  }, [conversionRateValue]);

  const statusSummary = useMemo(() => {
    const statuses = overview?.statuses || {};
    return [
      { label: 'Pending Review', value: statuses.pending ?? 0, icon: <Clock3 size={22} className="text-amber-500" /> },
      { label: 'For Interview', value: statuses.for_interview ?? 0, icon: <Calendar size={22} className="text-sky-500" /> },
      { label: 'Accepted', value: statuses.accepted ?? 0, icon: <Target size={22} className="text-emerald-500" /> },
      { label: 'Enrolled', value: statuses.enrolled ?? 0, icon: <TrendingUp size={22} className="text-blue-500" /> },
      { label: 'Waitlisted', value: statuses.waitlisted ?? 0, icon: <BarChart3 size={22} className="text-violet-500" /> },
      { label: 'Rejected', value: statuses.rejected ?? 0, icon: <Users size={22} className="text-rose-500" /> }
    ];
  }, [overview]);

  const pipelineChartData = useMemo(() => ({
    labels: pipeline?.stages?.map((stage) => stage.label) ?? [],
    datasets: [
      {
        label: 'Applicants',
        data: pipeline?.stages?.map((stage) => stage.count) ?? [],
        backgroundColor: '#2563EB',
        borderRadius: 6
      }
    ]
  }), [pipeline]);

  const conversionChartData = useMemo(() => ({
    labels: engagement?.conversionFunnel?.map((step) => step.stage) ?? [],
    datasets: [
      {
        label: 'Conversion Rate',
        data: engagement?.conversionFunnel?.map((step) => step.rate) ?? [],
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        tension: 0.4,
        fill: true
      }
    ]
  }), [engagement]);

  const genderDistributionData = useMemo(() => ({
    labels: Object.keys(demographics?.gender ?? {}),
    datasets: [
      {
        label: 'Applicants',
        data: Object.values(demographics?.gender ?? {}),
        backgroundColor: ['#38BDF8', '#F472B6', '#FACC15', '#22C55E']
      }
    ]
  }), [demographics]);

  const ageDistributionData = useMemo(() => ({
    labels: demographics?.ageGroups?.map((group) => group.range) ?? [],
    datasets: [
      {
        label: 'Applicants',
        data: demographics?.ageGroups?.map((group) => group.applicants) ?? [],
        backgroundColor: '#9333EA'
      }
    ]
  }), [demographics]);

  const engagementTableColumns = [
    {
      header: 'Week',
      field: 'label',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      header: 'Interactions',
      field: 'interactions'
    },
    {
      header: 'Scheduled Interviews',
      field: 'interviews'
    },
    {
      header: 'Follow-ups Sent',
      field: 'followUps'
    }
  ];

  const dropOffColumns = [
    {
      header: 'Reason',
      field: 'label',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      header: 'Applicants',
      field: 'count'
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admission Analytics</h1>
            <p className="text-gray-600 mt-1">
              Visualize applicant performance, demographic trends, and conversion health for the current intake.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Refresh Analytics
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Applicants</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{overview?.totals?.applicants ?? 0}</p>
            <p className="text-xs text-gray-500 mt-2">Across all active intake forms</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-600">{formattedConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Confirmed over total applications</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Average Processing Time</p>
            <p className="mt-1 text-3xl font-semibold text-blue-600">{overview?.totals?.processingDays ?? 0} days</p>
            <p className="text-xs text-gray-500 mt-2">From submission to decision</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Current Term</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{overview?.currentTerm?.name || overview?.currentTerm?.label || 'Not set'}</p>
            <p className="text-xs text-gray-500 mt-2">Synced from registrar settings</p>
          </Card>
        </div>

        <Card title="Status Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statusSummary.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Chart
            title="Applicant Pipeline"
            type="bar"
            data={pipelineChartData}
            height={340}
          />
          <Chart
            title="Conversion Funnel"
            type="line"
            data={conversionChartData}
            height={340}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            title="Gender Distribution"
            type="doughnut"
            data={genderDistributionData}
            height={320}
          />
          <Chart
            title="Age Distribution"
            type="bar"
            data={ageDistributionData}
            height={320}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Weekly Engagement">
            <Table columns={engagementTableColumns} data={engagement?.weekly ?? []} />
          </Card>
          <Card title="Drop-off Reasons">
            <Table columns={dropOffColumns} data={engagement?.dropOffReasons ?? []} />
          </Card>
        </div>

        <Card title="Top Programs">
          <Table
            columns={[
              { header: 'Program', field: 'name', render: (value) => <span className="font-medium text-gray-900">{value}</span> },
              { header: 'Applicants', field: 'applicants' },
              { header: 'Accepted', field: 'accepted' },
              {
                header: 'Conversion Rate',
                field: 'conversionRate',
                render: (value) => {
                  if (value === undefined || value === null) {
                    return '0.0%';
                  }

                  const numericValue = Number(value);
                  if (Number.isFinite(numericValue)) {
                    return `${numericValue.toFixed(1)}%`;
                  }

                  return `${value}%`;
                }
              }
            ]}
            data={overview?.topPrograms ?? []}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdmissionAnalyticsPage;
