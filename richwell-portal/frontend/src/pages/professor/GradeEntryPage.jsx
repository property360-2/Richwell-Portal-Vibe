// frontend/src/pages/professor/GradeEntryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../../utils/api';

const GradeEntryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [updating, setUpdating] = useState({});
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
    { value: 'grade_5_0', label: '5.0' },
    { value: 'INC', label: 'INC' },
    { value: 'DRP', label: 'DRP' }
  ];

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/grades/sections');
      setSections(response.data.data.sections);
    } catch (error) {
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setStudents(section.enrollmentSubjects || []);
  };

  const handleGradeChange = async (enrollmentSubjectId, gradeValue, remarks = '') => {
    try {
      setUpdating(prev => ({ ...prev, [enrollmentSubjectId]: true }));
      setError(null);

      await apiService.put(`/grades/${enrollmentSubjectId}`, {
        gradeValue,
        remarks
      });

      setSuccess('Grade updated successfully');
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === enrollmentSubjectId 
          ? { 
              ...student, 
              grade: { 
                ...student.grade, 
                gradeValue, 
                remarks,
                approved: false 
              } 
            }
          : student
      ));

      // Reload sections to get updated data
      loadSections();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update grade');
    } finally {
      setUpdating(prev => ({ ...prev, [enrollmentSubjectId]: false }));
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
          <h1 className="text-3xl font-bold text-gray-900">Grade Entry</h1>
          <p className="text-gray-600 mt-1">
            Enter and manage student grades for your sections
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

        {/* Sections Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedSection?.id === section.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSectionSelect(section)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{section.name}</h3>
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {section.enrollmentSubjects?.length || 0} students
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {section.subject.code} - {section.subject.name}
              </div>
              <div className="text-sm text-gray-500">
                {section.schedule || 'No schedule set'}
              </div>
              {section.enrollmentSubjects?.some(es => es.grade) && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  Grades entered: {section.enrollmentSubjects.filter(es => es.grade).length}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Selected Section Details */}
        {selectedSection && (
          <Card title={`${selectedSection.name} - Grade Entry`}>
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Subject:</span>
                  <div className="text-gray-900">{selectedSection.subject.code} - {selectedSection.subject.name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Units:</span>
                  <div className="text-gray-900">{selectedSection.subject.units}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Students:</span>
                  <div className="text-gray-900">{students.length}</div>
                </div>
              </div>
            </div>

            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.enrollment.student.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.enrollment.student.studentNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getGradeColor(student.grade?.gradeValue)}`}>
                            {formatGrade(student.grade?.gradeValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Dropdown
                            options={gradeOptions}
                            value={student.grade?.gradeValue || ''}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            placeholder="Select Grade"
                            className="w-32"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.grade?.approved 
                              ? 'bg-green-100 text-green-800' 
                              : student.grade?.gradeValue
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.grade?.approved ? 'Approved' : student.grade?.gradeValue ? 'Pending' : 'No Grade'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {updating[student.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : student.grade?.gradeValue ? (
                            <CheckCircle className="text-green-600" size={16} />
                          ) : (
                            <AlertCircle className="text-gray-400" size={16} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-400" size={48} />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Students</h3>
                <p className="mt-1 text-gray-500">
                  No students are enrolled in this section.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* No Sections Message */}
        {sections.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Sections Assigned</h3>
              <p className="mt-1 text-gray-500">
                You don't have any sections assigned for the current term.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradeEntryPage;
