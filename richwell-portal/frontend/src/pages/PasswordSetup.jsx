// frontend/src/pages/PasswordSetup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';

const PasswordSetup = () => {
  const navigate = useNavigate();
  const { setupPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    studentNo: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    if (!formData.studentNo || !formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await setupPassword(
      formData.studentNo,
      formData.email,
      formData.newPassword
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Setup Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              Your password has been set successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
            <span className="text-5xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Password
          </h1>
          <p className="text-gray-600">
            First time login? Create your password here
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            <Alert
              type="info"
              message="Use your Student Number and registered email address to set up your password."
            />

            <InputField
              label="Student Number"
              type="text"
              name="studentNo"
              value={formData.studentNo}
              onChange={handleChange}
              placeholder="e.g., 2024-0001"
              required
              disabled={loading}
            />

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
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              disabled={loading}
            />

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              disabled={loading}
            />

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Set Password'}
              </Button>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Contact{' '}
            <a 
              href="mailto:support@richwell.edu" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              support@richwell.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetup;