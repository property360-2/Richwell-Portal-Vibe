// frontend/src/pages/student/IncResolutionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { AlertCircle, Clock, CheckCircle, User, BookOpen } from 'lucide-react';
import { apiService } from '../../utils/api';

const IncResolutionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incSubjects, setIncSubjects] = useState([]);
  const [existingResolutions, setExistingResolutions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIncSubjects();
  }, []);

  const loadIncSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/inc-resolutions/student');
      setIncSubjects(response.data.data.incSubjects);
      setExistingResolutions(response.data.data.existingResolutions);
    } catch (error) {
      setError('Failed to load INC subjects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (hasResolution) => {
    return hasResolution 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (hasResolution) => {
    return hasResolution ? 'Resolution Submitted' : 'Pending Resolution';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INC Resolution</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your incomplete (INC) grades
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total INC Subjects</p>
                <p className="text-3xl font-bold mt-1">{incSubjects.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <AlertCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Resolutions Submitted</p>
                <p className="text-3xl font-bold mt-1">
                  {existingResolutions.length}
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
                <p className="text-blue-100 text-sm">Pending Actions</p>
                <p className="text-3xl font-bold mt-1">
                  {incSubjects.filter(inc => !inc.hasResolution).length}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* INC Subjects List */}
        {incSubjects.length > 0 ? (
          <div className="space-y-4">
            {incSubjects.map((inc) => (
              <Card key={inc.id} className="border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <BookOpen className="text-yellow-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {inc.subject.code} - {inc.subject.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inc.hasResolution)}`}>
                        {getStatusText(inc.hasResolution)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Section:</span> {inc.section.name}
                      </div>
                      <div>
                        <span className="font-medium">Professor:</span> {inc.section.professor.user.email}
                      </div>
                      <div>
                        <span className="font-medium">Term:</span> {inc.term.schoolYear} {inc.term.semester}
                      </div>
                      <div>
                        <span className="font-medium">Date Encoded:</span> {formatDate(inc.dateEncoded)}
                      </div>
                    </div>

                    {inc.remarks && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Remarks:</span>
                        <p className="text-gray-600 mt-1">{inc.remarks}</p>
                      </div>
                    )}

                    {inc.hasResolution && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="text-sm font-medium text-green-800">
                            Resolution submitted. Waiting for registrar approval.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-400" size={48} />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No INC Subjects</h3>
              <p className="mt-1 text-gray-500">
                You don't have any incomplete grades at the moment.
              </p>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card title="INC Resolution Process">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contact Your Professor</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Reach out to your professor to discuss the incomplete grade and requirements for completion.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Complete Requirements</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Fulfill all the requirements specified by your professor to resolve the incomplete grade.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Professor Encodes Grade</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your professor will encode the resolved grade in the system for registrar approval.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Registrar Approval</h4>
                <p className="text-sm text-gray-600 mt-1">
                  The registrar will review and approve the grade change, updating your official record.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default IncResolutionPage;
