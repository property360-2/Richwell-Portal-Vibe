import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
// frontend/src/pages/dashboards/AdmissionDashboard.jsx
const AdmissionDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admission Dashboard 🎓</h1>
          <p className="text-gray-600 mt-1">Manage applicants and enrollment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div>
              <p className="text-indigo-100 text-sm">New Applicants</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm">Enrolled Today</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div>
              <p className="text-purple-100 text-sm">Total Enrollments</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdmissionDashboard;