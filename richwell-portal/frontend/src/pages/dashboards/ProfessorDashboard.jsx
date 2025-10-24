// frontend/src/pages/dashboards/ProfessorDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { Users, FileText, BarChart3 } from 'lucide-react';

const ProfessorDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard 👨‍🏫</h1>
          <p className="text-gray-600 mt-1">Manage your classes and grades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">My Sections</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Users size={32} />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <FileText size={32} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pending Grades</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <BarChart3 size={32} />
            </div>
          </Card>
        </div>

        <Card title="Department">
          <p className="text-lg">{user?.professor?.department || 'Not Assigned'}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;