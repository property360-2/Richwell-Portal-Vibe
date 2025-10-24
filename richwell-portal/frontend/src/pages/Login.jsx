// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      switch (role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'professor':
          navigate('/professor/dashboard');
          break;
        case 'registrar':
          navigate('/registrar/dashboard');
          break;
        case 'admission':
          navigate('/admission/dashboard');
          break;
        case 'dean':
          navigate('/dean/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
            <span className="text-5xl">🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Richwell College Portal
          </h1>
          <p className="text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <Alert
                type="error"
                message={error || authError}
                onClose={() => setError(null)}
              />
            )}

            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@richwell.edu"
              required
              disabled={loading}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/setup-password')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                First time login?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact{' '}
            <a 
              href="mailto:support@richwell.edu" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              support@richwell.edu
            </a>
          </p>
        </div>

        {/* Test Accounts Info (Remove in production) */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="text-sm">
            <p className="font-semibold text-blue-900 mb-2">Test Accounts:</p>
            <div className="space-y-1 text-blue-800">
              <p>Student: student@richwell.edu</p>
              <p>Professor: professor@richwell.edu</p>
              <p>Registrar: registrar@richwell.edu</p>
              <p>Admission: admission@richwell.edu</p>
              <p>Dean: dean@richwell.edu</p>
              <p className="mt-2 font-semibold">Password: password123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;