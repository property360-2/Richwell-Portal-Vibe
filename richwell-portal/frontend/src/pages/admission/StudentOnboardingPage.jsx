// frontend/src/pages/admission/StudentOnboardingPage.jsx
import React, { useEffect, useState } from 'react';
import { Download, Copy, RefreshCw, Send } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/common/Alert';
import { apiService } from '../../utils/api';

const defaultForm = {
  email: '',
  programId: '',
  yearLevel: '1',
  sendEmail: true
};

const StudentOnboardingPage = () => {
  const [formData, setFormData] = useState(defaultForm);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await apiService.get('/programs');
      setPrograms(response.data.data || []);
    } catch (err) {
      console.error('Failed to load programs', err);
      setError('Unable to load programs. Please refresh the page.');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const payload = {
        email: formData.email,
        programId: formData.programId ? Number(formData.programId) : undefined,
        yearLevel: formData.yearLevel ? Number(formData.yearLevel) : undefined,
        sendEmail: formData.sendEmail
      };

      const response = await apiService.onboardStudent(payload);
      setCredentials(response.data.data);
      setSuccessMessage('Temporary credentials generated successfully.');
      setFormData(defaultForm);
    } catch (err) {
      console.error('Onboarding failed', err);
      const message = err.response?.data?.message || 'Failed to onboard student. Please try again.';
      setError(message);
      setCredentials(null);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCredentials = () => {
    if (!credentials) return;
    const content = `Richwell Portal Temporary Credentials\n\nStudent Number: ${credentials.studentNo}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `richwell-credentials-${credentials.studentNo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCredentials = async () => {
    if (!credentials || !navigator.clipboard) return;
    const content = `Student Number: ${credentials.studentNo}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}`;
    try {
      await navigator.clipboard.writeText(content);
      setSuccessMessage('Credentials copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy credentials', err);
      setError('Unable to copy credentials to clipboard.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Onboarding</h1>
            <p className="text-gray-600 mt-1">
              Generate student numbers and temporary credentials for newly admitted students.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPrograms}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <RefreshCw size={16} />
            Refresh Programs
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Onboarding Details</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student.email@richwell.edu"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  id="programId"
                  name="programId"
                  required
                  value={formData.programId}
                  onChange={handleChange}
                  disabled={loadingPrograms}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{loadingPrograms ? 'Loading programs...' : 'Select a program'}</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <select
                  id="yearLevel"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>{`Year ${level}`}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="sendEmail"
                  name="sendEmail"
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700 flex items-center gap-2">
                  <Send size={16} />
                  Email credentials to the student after queuing
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                <span>{submitting ? 'Generating...' : 'Generate Credentials'}</span>
              </button>
              <p className="text-sm text-gray-500">
                Student numbers are generated sequentially per academic year.
              </p>
            </div>
          </form>
        </div>

        {credentials && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Temporary Credentials</h2>
            <p className="text-sm text-gray-600 mb-4">
              Share these credentials securely with the student. They will be prompted to change the password on first login.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500">Student Number</p>
                <p className="text-lg font-semibold text-blue-700 font-mono">{credentials.studentNo}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500">Email</p>
                <p className="text-lg font-semibold text-gray-900 break-all">{credentials.email}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500">Temporary Password</p>
                <p className="text-lg font-semibold text-emerald-600 font-mono">{credentials.temporaryPassword}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500">Notification</p>
                <p className="text-sm text-gray-700">
                  {credentials.notificationQueued
                    ? 'Email delivery has been queued.'
                    : 'Email delivery was skipped for this student.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadCredentials}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={18} />
                Download Credentials
              </button>
              <button
                type="button"
                onClick={copyCredentials}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Copy size={18} />
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentOnboardingPage;
