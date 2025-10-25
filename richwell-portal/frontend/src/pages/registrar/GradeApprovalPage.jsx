// frontend/src/pages/registrar/GradeApprovalPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CheckCircle, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import { apiService } from '../../utils/api';

const GradeApprovalPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    loadPendingGrades();
  }, []);

  const loadPendingGrades = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/grades/pending-approval');
      setPendingGrades(response.data.data.pendingGrades);
    } catch (error) {
      setError('Failed to load pending grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrade = (gradeId) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGrades.length === pendingGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(pendingGrades.map(grade => grade.id));
    }
  };

  const handleApproveSelected = () => {
    if (selectedGrades.length === 0) {
      setError('Please select grades to approve');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmApproval = async () => {
    try {
      setApproving(true);
      setError(null);

      if (selectedGrades.length === 1) {
        await apiService.put(`/grades/${selectedGrades[0]}/approve`);
      } else {
        await apiService.put('/grades/bulk-approve', {
          gradeIds: selectedGrades
        });
      }

      setSuccess(`${selectedGrades.length} grade(s) approved successfully`);
      setSelectedGrades([]);
      setShowConfirmDialog(false);
      loadPendingGrades();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve grades');
    } finally {
      setApproving(false);
    }
  };

  const getGradeColor = (gradeValue) => {
    if (!gradeValue) return 'text-gray-500';
    
    const numericGrade = getNumericGrade(gradeValue);
    if (numericGrade === null) {
      if (gradeValue === 'INC') return 'text-yellow-600';
      if (gradeValue === 'DRP') return 'text-red-600';
      return 'text-gray-500';
    }
    
    if (numericGrade <= 1.5) return 'text-green-600 font-semibold';
    if (numericGrade <= 2.5) return 'text-blue-600';
    if (numericGrade <= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getNumericGrade = (gradeValue) => {
    const gradeMap = {
      'grade_1_0': 1.0,
      'grade_1_25': 1.25,
      'grade_1_5': 1.5,
      'grade_1_75': 1.75,
      'grade_2_0': 2.0,
      'grade_2_25': 2.25,
      'grade_2_5': 2.5,
      'grade_2_75': 2.75,
      'grade_3_0': 3.0,
      'grade_4_0': 4.0,
      'grade_5_0': 5.0
    };
    return gradeMap[gradeValue] || null;
  };

  const formatGrade = (gradeValue) => {
    if (!gradeValue) return 'No Grade';
    
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
      'grade_5_0': '5.0',
      'INC': 'INC',
      'DRP': 'DRP'
    };
    return gradeMap[gradeValue] || gradeValue;
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
          <h1 className="text-3xl font-bold text-gray-900">Grade Approval</h1>
          <p className="text-gray-600 mt-1">
            Review and approve grades submitted by professors
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Grades</p>
                <p className="text-3xl font-bold mt-1">{pendingGrades.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Selected</p>
                <p className="text-3xl font-bold mt-1">{selectedGrades.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">INC Grades</p>
                <p className="text-3xl font-bold mt-1">
                  {pendingGrades.filter(g => g.gradeValue === 'INC').length}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <AlertCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Professors</p>
                <p className="text-3xl font-bold mt-1">
                  {new Set(pendingGrades.map(g => g.professor.id)).size}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {pendingGrades.length > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedGrades.length === pendingGrades.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedGrades.length} of {pendingGrades.length} selected
                </span>
              </div>
              <Button
                onClick={handleApproveSelected}
                disabled={selectedGrades.length === 0 || approving}
                className="bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle size={16} className="mr-2" />
                )}
                Approve Selected ({selectedGrades.length})
              </Button>
            </div>
          </Card>
        )}

        {/* Pending Grades Table */}
        {pendingGrades.length > 0 ? (
          <Card title="Pending Grade Approvals">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedGrades.length === pendingGrades.length && pendingGrades.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Encoded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingGrades.map((grade) => (
                    <tr 
                      key={grade.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedGrades.includes(grade.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectGrade(grade.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.id)}
                          onChange={() => handleSelectGrade(grade.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {grade.enrollmentSubject.enrollment.student.user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.enrollmentSubject.enrollment.student.studentNo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {grade.enrollmentSubject.subject.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.enrollmentSubject.subject.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.professor.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getGradeColor(grade.gradeValue)}`}>
                          {formatGrade(grade.gradeValue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(grade.dateEncoded)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-400" size={48} />
              <h3 className="mt-2 text-lg font-medium text-gray-900">All Caught Up!</h3>
              <p className="mt-1 text-gray-500">
                No pending grade approvals at the moment.
              </p>
            </div>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmApproval}
          title="Approve Grades"
          message={`Are you sure you want to approve ${selectedGrades.length} grade(s)? This action cannot be undone.`}
          confirmText="Approve"
          cancelText="Cancel"
          variant="success"
        />
      </div>
    </DashboardLayout>
  );
};

export default GradeApprovalPage;
