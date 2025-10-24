
// frontend/src/pages/dashboards/DeanDashboard.jsx
export const DeanDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dean Dashboard 🎯</h1>
          <p className="text-gray-600 mt-1">Academic oversight and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div>
              <p className="text-red-100 text-sm">Programs</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div>
              <p className="text-blue-100 text-sm">Professors</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm">Subjects</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div>
              <p className="text-purple-100 text-sm">Sections</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default DeanDashboard;