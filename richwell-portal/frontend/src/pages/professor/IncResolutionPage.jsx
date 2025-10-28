// frontend/src/pages/professor/IncResolutionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import Alert from '../../components/common/Alert';
import { AlertCircle, User, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../utils/api';

const IncResolutionPage = () => {
  const [loading, setLoading] = useState(true);
  const [resolutions, setResolutions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const gradeOptions = [
    { value: 'grade_1_0', label: '1.0' },
    { value: 'grade_1_25', label: '1.25' },
    { value: 'grade_1_5', label: '1.5' },
    { value: 'grade_1_75', label: '1.75' },
    { value: 'grade_2_0', label: '2.0' },
    { value: 'grade_2_25', label: '2.25' },
    { value: 'grade_2_5', label: '2.5' },
    { value: 'grade_2_75', label: '2.75' },
    { value: 'grade_3_0', label: '3.0' },
    { value: 'grade_4_0', label: '4.0' },
    { value: 'grade_5_0', label: '5.0' }
  ];

  const loadResolutions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/inc-resolutions/professor');
      setResolutions(response.data.data);
    } catch (error) {
      console.error('Failed to load INC resolutions', error);
      setError('Failed to load INC resolutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResolutions();
  }, [loadResolutions]);

  const handleCreateResolution = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await apiService.post('/inc-resolutions', {
        studentId: selectedStudent.id,
        subjectId: selectedSubject.id,
        newGrade: newGrade
      });

      setSuccess('INC resolution created successfully');
      setShowCreateModal(false);
      setSelectedStudent(null);
      setSelectedSubject(null);
      setNewGrade('');
      loadResolutions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create INC resolution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGrade = (gradeValue) => {
    const gradeMap = {
      'grade_1_0': '1.0',
      'grade_1_25': '1.25',
      'grade_1_5': '1.5',
      'grade_1_75': '1.75',
      'grade_2_0': '2.0',
      'grade_2_25': '2.25',
      'grade_2_5': '2.5',
      'grade_2_75': '2.75',
      'grade_3_0': '3.0',
      'grade_4_0': '4.0',
      'grade_5_0': '5.0'
    };
    return gradeMap[gradeValue] || gradeValue;
  };

  const getStatusColor = (approved) => {
    return approved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (approved) => {
    return approved ? 'Approved' : 'Pending Approval';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INC Resolution</h1>
            <p className="text-gray-600 mt-1">
              Manage incomplete grade resolutions for your students
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <AlertCircle size={16} className="mr-2" />
            Create Resolution
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert type="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Resolutions</p>
                <p className="text-3xl font-bold mt-1">{resolutions.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <AlertCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved</p>
                <p className="text-3xl font-bold mt-1">
                  {resolutions.filter(r => r.approvedByRegistrar).length}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-1">
                  {resolutions.filter(r => !r.approvedByRegistrar).length}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Resolutions List */}
        {resolutions.length > 0 ? (
          <Card title="INC Resolutions">
            <div className="space-y-4">
              {resolutions.map((resolution) => (
                <div key={resolution.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <BookOpen className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {resolution.subject.code} - {resolution.subject.name}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resolution.approvedByRegistrar)}`}>
                          {getStatusText(resolution.approvedByRegistrar)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Student:</span> {resolution.student.user.email}
                        </div>
                        <div>
                          <span className="font-medium">Student No:</span> {resolution.student.studentNo}
                        </div>
                        <div>
                          <span className="font-medium">Old Grade:</span> INC
                        </div>
                        <div>
                          <span className="font-medium">New Grade:</span> {formatGrade(resolution.newGrade)}
                        </div>
                        <div>
                          <span className="font-medium">Date Submitted:</span> {formatDate(resolution.dateSubmitted)}
                        </div>
                        <div>
                          <span className="font-medium">Professor:</span> {resolution.professor.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No INC Resolutions</h3>
              <p className="mt-1 text-gray-500">
                You don't have any INC resolutions at the moment.
              </p>
            </div>
          </Card>
        )}

        {/* Create Resolution Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create INC Resolution"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <input
                type="text"
                placeholder="Search for student..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStudent?.user?.email || ''}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Select subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubject?.code || ''}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Grade
              </label>
              <Dropdown
                options={gradeOptions}
                value={newGrade}
                onChange={setNewGrade}
                placeholder="Select new grade"
                className="w-full"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateResolution}
                disabled={!selectedStudent || !selectedSubject || !newGrade || submitting}
                className="flex-1"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                Create Resolution
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default IncResolutionPage;
