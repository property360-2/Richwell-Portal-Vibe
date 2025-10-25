// frontend/src/pages/student/GradesPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import { BookOpen, Award, AlertCircle, TrendingUp } from 'lucide-react';
import { apiService } from '../../utils/api';

const GradesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [incSubjects, setIncSubjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGradesData();
  }, []);

  const loadGradesData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/enrollments/history');
      setEnrollments(response.data.data);
      
      // Calculate GPA and INC subjects
      calculateGPA(response.data.data);
    } catch (error) {
      setError('Failed to load grades data');
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = (enrollments) => {
    let totalPoints = 0;
    let totalUnits = 0;
    const incList = [];

    enrollments.forEach(enrollment => {
      enrollment.enrollmentSubjects.forEach(enrollmentSubject => {
        if (enrollmentSubject.grade) {
          const units = enrollmentSubject.units;
          const gradeValue = enrollmentSubject.grade.gradeValue;
          
          if (gradeValue === 'INC') {
            incList.push({
              subject: enrollmentSubject.subject.name,
              code: enrollmentSubject.subject.code,
              term: `${enrollment.term.schoolYear} ${enrollment.term.semester}`
            });
          } else if (gradeValue !== 'DRP') {
            const numericGrade = getNumericGrade(gradeValue);
            if (numericGrade !== null) {
              totalPoints += numericGrade * units;
              totalUnits += units;
            }
          }
        }
      });
    });

    const calculatedGPA = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : 0;
    setGpa(calculatedGPA);
    setIncSubjects(incList);
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
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-1">
            View your academic performance and grades
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* GPA and INC Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Current GPA</p>
                <p className="text-3xl font-bold mt-1">{gpa}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Award size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Subjects</p>
                <p className="text-3xl font-bold mt-1">
                  {enrollments.reduce((total, enrollment) => 
                    total + enrollment.enrollmentSubjects.length, 0
                  )}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BookOpen size={24} />
              </div>
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${
            incSubjects.length > 0 
              ? 'from-yellow-500 to-yellow-600' 
              : 'from-gray-500 to-gray-600'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-80 text-sm">INC Subjects</p>
                <p className="text-3xl font-bold mt-1">{incSubjects.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <AlertCircle size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* INC Subjects Alert */}
        {incSubjects.length > 0 && (
          <Card title="Incomplete (INC) Subjects" className="border-yellow-200 bg-yellow-50">
            <div className="space-y-2">
              {incSubjects.map((inc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                  <div>
                    <div className="font-medium text-yellow-900">
                      {inc.code} - {inc.subject}
                    </div>
                    <div className="text-sm text-yellow-700">{inc.term}</div>
                  </div>
                  <div className="text-yellow-600 font-semibold">INC</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Please coordinate with your professors to resolve 
                incomplete grades. INC subjects may block enrollment in related courses.
              </p>
            </div>
          </Card>
        )}

        {/* Grades by Term */}
        <div className="space-y-6">
          {enrollments.map((enrollment) => (
            <Card 
              key={enrollment.id} 
              title={`${enrollment.term.schoolYear} - ${enrollment.term.semester} Semester`}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Professor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollment.enrollmentSubjects.map((enrollmentSubject) => (
                      <tr key={enrollmentSubject.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollmentSubject.subject.code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollmentSubject.subject.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollmentSubject.section.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollmentSubject.section.professor.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enrollmentSubject.units}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getGradeColor(enrollmentSubject.grade?.gradeValue)}`}>
                            {formatGrade(enrollmentSubject.grade?.gradeValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            enrollmentSubject.grade?.approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {enrollmentSubject.grade?.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Term Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total Units: {enrollment.totalUnits}
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: <span className="capitalize font-medium">{enrollment.status}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Data Message */}
        {enrollments.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <BookOpen className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Grades Yet</h3>
              <p className="mt-1 text-gray-500">
                You haven't enrolled in any subjects yet.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradesPage;
