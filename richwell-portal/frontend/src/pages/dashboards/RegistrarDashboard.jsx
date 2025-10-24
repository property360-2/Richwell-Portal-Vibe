import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
// frontend/src/pages/dashboards/RegistrarDashboard.jsx
 const RegistrarDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard 📋</h1>
          <p className="text-gray-600 mt-1">Manage student records and approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div>
              <p className="text-yellow-100 text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm">Active Sections</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegistrarDashboard;
