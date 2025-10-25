// frontend/src/pages/student/EnrollmentPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { BookOpen, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { apiService } from '../../utils/api';

const EnrollmentPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [recommendedSubjects, setRecommendedSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showOathModal, setShowOathModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadEnrollmentData();
  }, []);

  const loadEnrollmentData = async () => {
    try {
      setLoading(true);
      const [availableRes, recommendedRes] = await Promise.all([
        apiService.get('/enrollments/available-subjects'),
        apiService.get('/enrollments/recommended-subjects')
      ]);

      setAvailableSubjects(availableRes.data.data.subjects);
      setRecommendedSubjects(recommendedRes.data.data);
    } catch (error) {
      setError('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subject, section) => {
    const subjectKey = `${subject.id}-${section.id}`;
    const isSelected = selectedSubjects.some(s => s.key === subjectKey);

    if (isSelected) {
      // Remove subject
      const updated = selectedSubjects.filter(s => s.key !== subjectKey);
      setSelectedSubjects(updated);
      setTotalUnits(updated.reduce((sum, s) => sum + s.units, 0));
    } else {
      // Check if subject already selected (different section)
      const existingSubject = selectedSubjects.find(s => s.subjectId === subject.id);
      if (existingSubject) {
        setError('You can only select one section per subject');
        return;
      }

      // Check unit limit
      const newTotal = totalUnits + subject.units;
      if (newTotal > 30) {
        setError('Maximum 30 units allowed per semester');
        return;
      }

      // Add subject
      const newSelection = {
        key: subjectKey,
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        units: subject.units,
        sectionId: section.id,
        sectionName: section.name,
        professor: section.professor.user.email,
        schedule: section.schedule
      };

      setSelectedSubjects([...selectedSubjects, newSelection]);
      setTotalUnits(newTotal);
    }
  };

  const handleEnroll = async () => {
    try {
      setError(null);
      const sectionIds = selectedSubjects.map(s => s.sectionId);
      
      const response = await apiService.post('/enrollments/enroll', {
        sectionIds,
        totalUnits
      });

      setSuccess('Enrollment submitted successfully!');
      setSelectedSubjects([]);
      setTotalUnits(0);
      setShowOathModal(false);
      loadEnrollmentData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const isSubjectSelected = (subject, section) => {
    const subjectKey = `${subject.id}-${section.id}`;
    return selectedSubjects.some(s => s.key === subjectKey);
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
          <h1 className="text-3xl font-bold text-gray-900">Enrollment</h1>
          <p className="text-gray-600 mt-1">
            Select your subjects for the current semester
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

        {/* Enrollment Summary */}
        <Card title="Enrollment Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedSubjects.length}
              </div>
              <div className="text-sm text-gray-600">Subjects Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalUnits}
              </div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {30 - totalUnits}
              </div>
              <div className="text-sm text-gray-600">Units Remaining</div>
            </div>
          </div>
        </Card>

        {/* Recommended Subjects */}
        {recommendedSubjects.length > 0 && (
          <Card title="Recommended Subjects">
            <div className="space-y-4">
              {recommendedSubjects.map((subject) => (
                <div key={subject.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {subject.code} - {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {subject.units} units
                      </p>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Recommended
                    </div>
                  </div>
                  
                  {subject.sections.length > 0 ? (
                    <div className="space-y-2">
                      {subject.sections.map((section) => (
                        <div
                          key={section.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSubjectSelected(subject, section)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSubjectToggle(subject, section)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{section.name}</div>
                              <div className="text-sm text-gray-600">
                                Prof: {section.professor.user.email}
                              </div>
                              {section.schedule && (
                                <div className="text-sm text-gray-600">
                                  Schedule: {section.schedule}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-600">
                                {section.availableSlots} slots left
                              </div>
                              {isSubjectSelected(subject, section) && (
                                <CheckCircle className="text-blue-600" size={20} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No available sections
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Available Subjects */}
        <Card title="All Available Subjects">
          <div className="space-y-4">
            {availableSubjects.map((subject) => (
              <div key={subject.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {subject.code} - {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subject.units} units • {subject.subjectType}
                    </p>
                  </div>
                </div>
                
                {subject.sections.length > 0 ? (
                  <div className="space-y-2">
                    {subject.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSubjectSelected(subject, section)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSubjectToggle(subject, section)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{section.name}</div>
                            <div className="text-sm text-gray-600">
                              Prof: {section.professor.user.email}
                            </div>
                            {section.schedule && (
                              <div className="text-sm text-gray-600">
                                Schedule: {section.schedule}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-600">
                              {section.availableSlots} slots left
                            </div>
                            {isSubjectSelected(subject, section) && (
                              <CheckCircle className="text-blue-600" size={20} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No available sections
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Enroll Button */}
        {selectedSubjects.length > 0 && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowSummaryModal(true)}
              size="lg"
              className="px-8"
            >
              <BookOpen size={20} className="mr-2" />
              Review & Enroll ({totalUnits} units)
            </Button>
          </div>
        )}

        {/* Summary Modal */}
        <Modal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          title="Enrollment Summary"
        >
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Your Enrollment
              </h3>
              <p className="text-gray-600">
                Total: {selectedSubjects.length} subjects, {totalUnits} units
              </p>
            </div>

            <div className="space-y-2">
              {selectedSubjects.map((subject) => (
                <div key={subject.key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{subject.subjectCode} - {subject.subjectName}</div>
                    <div className="text-sm text-gray-600">{subject.sectionName}</div>
                  </div>
                  <div className="text-sm font-medium">{subject.units} units</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="font-semibold">Total Units: {totalUnits}</div>
              <div className="text-sm text-gray-600">
                Remaining: {30 - totalUnits} units
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSummaryModal(false);
                  setShowOathModal(true);
                }}
                className="flex-1"
              >
                Continue to Oath
              </Button>
            </div>
          </div>
        </Modal>

        {/* Oath Modal */}
        <Modal
          isOpen={showOathModal}
          onClose={() => setShowOathModal(false)}
          title="Student Oath"
        >
          <div className="space-y-4">
            <div className="text-center">
              <AlertCircle className="mx-auto text-yellow-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                Student Oath
              </h3>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                I hereby declare that all information provided is true and correct. 
                I understand that any false information may result in the cancellation 
                of my enrollment and disciplinary action.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowOathModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnroll}
                className="flex-1"
              >
                I Agree & Enroll
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default EnrollmentPage;
