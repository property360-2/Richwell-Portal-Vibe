// frontend/src/App.jsx
import React, { useState } from 'react';
import { apiService } from './utils/api';
import Button from './components/common/Button';
import Card from './components/common/Card';
import Alert from './components/common/Alert';

function App() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const checkServerStatus = async () => {
    setLoading(true);
    try {
      const response = await apiService.healthCheck();
      setStatus(response.data);
      setAlert({
        type: 'success',
        message: 'Server is connected and running!'
      });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to connect to server. Make sure the backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏫 Richwell College Portal
          </h1>
          <p className="text-gray-600">Phase 1 - Development Setup Complete!</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            className="mb-6"
          />
        )}

        <Card title="Server Status Check">
          <div className="space-y-4">
            <p className="text-gray-700">
              Click the button below to test the connection between frontend and backend.
            </p>
            
            <Button
              onClick={checkServerStatus}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Checking...' : 'Check Server Status'}
            </Button>

            {status && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✓ Server Response:</h3>
                <pre className="text-sm text-green-700 overflow-x-auto">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>

        <Card title="✅ Phase 1 Completed" className="mt-6">
          <div className="space-y-3">
            <CheckItem text="Node.js + Express backend initialized" />
            <CheckItem text="React + Vite frontend initialized" />
            <CheckItem text="Tailwind CSS configured" />
            <CheckItem text="Reusable components created" />
            <CheckItem text="API utility configured" />
            <CheckItem text="Database connection ready (Prisma)" />
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Ready for Phase 2: Authentication & Role Management</p>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-green-600">✓</span>
      <span>{text}</span>
    </div>
  );
}

export default App;