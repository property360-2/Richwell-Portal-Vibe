// frontend/src/pages/dashboards/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Chart from '../../components/common/Chart';
import Alert from '../../components/common/Alert';
import { BookOpen, FileText, AlertCircle, Award, TrendingUp, Users } from 'lucide-react';
import { apiService } from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/analytics/student');
      setAnalytics(response.data.data);
    } catch (error) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Student! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your academic overview
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Student Number</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.student?.studentNo || 'N/A'}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BookOpen size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Current GPA</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.statistics?.gpa?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Award size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Subjects</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.statistics?.totalSubjects || 0}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${
            analytics?.statistics?.incCount > 0
              ? 'from-red-500 to-red-600' 
              : 'from-gray-500 to-gray-600'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-80 text-sm">INC Grades</p>
                <p className="text-2xl font-bold mt-1">
                  {analytics?.statistics?.incCount || 0}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <AlertCircle size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Program Info */}
        <Card title="Program Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Program</p>
              <p className="text-lg font-semibold text-gray-900">
                {analytics?.student?.program || 'Not Assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {analytics?.student?.status || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Academic Performance Chart */}
        {analytics?.enrollments && analytics.enrollments.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart
              title="Academic Performance"
              type="bar"
              data={{
                labels: analytics.enrollments.map(e => `${e.term.schoolYear} ${e.term.semester}`),
                datasets: [{
                  label: 'Units Enrolled',
                  data: analytics.enrollments.map(e => e.totalUnits),
                  backgroundColor: '#3B82F6',
                  borderColor: '#1D4ED8',
                  borderWidth: 1
                }]
              }}
              height={300}
            />
            
            <Chart
              title="Grade Distribution"
              type="doughnut"
              data={{
                labels: ['Passed', 'Failed', 'INC'],
                datasets: [{
                  data: [
                    analytics.statistics.totalSubjects - analytics.statistics.incCount - analytics.statistics.failedCount,
                    analytics.statistics.failedCount,
                    analytics.statistics.incCount
                  ],
                  backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                  borderWidth: 0
                }]
              }}
              height={300}
            />
          </div>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button fullWidth>
              <BookOpen size={18} className="mr-2" />
              View Enrollment
            </Button>
            <Button variant="secondary" fullWidth>
              <FileText size={18} className="mr-2" />
              Check Grades
            </Button>
            <Button variant="outline" fullWidth>
              <Award size={18} className="mr-2" />
              View GPA
            </Button>
          </div>
        </Card>

        {/* Announcements */}
        <Card title="Announcements">
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                Enrollment Period Open
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Enrollment for 2nd Semester 2024-2025 is now open. Please enroll before the deadline.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-900">
                Midterm Exinations Schedule
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Midterm examinations will be held from October 28 to November 1, 2024.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;