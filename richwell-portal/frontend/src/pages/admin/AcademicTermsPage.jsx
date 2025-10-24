// frontend/src/pages/admin/AcademicTermsPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import Dropdown from '../../components/common/Dropdown';
import Alert from '../../components/common/Alert';
import { apiService } from '../../utils/api';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';

const AcademicTermsPage = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    schoolYear: '',
    semester: '',
    isActive: false
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/academic-terms');
      setTerms(response.data.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to fetch academic terms'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedTerm(null);
    
    // Auto-generate school year
    const currentYear = new Date().getFullYear();
    setFormData({
      schoolYear: `${currentYear}-${currentYear + 1}`,
      semester: '',
      isActive: false
    });
    setShowModal(true);
  };

  const handleEdit = (term) => {
    setEditMode(true);
    setSelectedTerm(term);
    setFormData({
      schoolYear: term.schoolYear,
      semester: term.semester,
      isActive: term.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await apiService.put(`/academic-terms/${selectedTerm.id}`, formData);
        setAlert({
          type: 'success',
          message: 'Academic term updated successfully'
        });
      } else {
        await apiService.post('/academic-terms', formData);
        setAlert({
          type: 'success',
          message: 'Academic term created successfully'
        });
      }

      setShowModal(false);
      fetchTerms();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleActivate = async (term) => {
    if (!window.confirm(`Set ${term.schoolYear} ${term.semester} Semester as active term?`)) {
      return;
    }

    try {
      await apiService.put(`/academic-terms/${term.id}/activate`);
      setAlert({
        type: 'success',
        message: 'Academic term activated successfully'
      });
      fetchTerms();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to activate term'
      });
    }
  };

  const handleDelete = async (term) => {
    if (!window.confirm(`Are you sure you want to delete ${term.schoolYear} ${term.semester} Semester?`)) {
      return;
    }

    try {
      await apiService.delete(`/academic-terms/${term.id}`);
      setAlert({
        type: 'success',
        message: 'Academic term deleted successfully'
      });
      fetchTerms();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete term'
      });
    }
  };

  const columns = [
    {
      header: 'School Year',
      field: 'schoolYear',
      width: '180px'
    },
    {
      header: 'Semester',
      field: 'semester',
      width: '150px',
      render: (value) => (
        <span className="capitalize">{value} Semester</span>
      )
    },
    {
      header: 'Enrollments',
      field: '_count',
      width: '120px',
      render: (value) => value?.enrollments || 0
    },
    {
      header: 'Status',
      field: 'isActive',
      width: '120px',
      render: (value) => (
        <span className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {value ? <CheckCircle size={16} /> : <Circle size={16} />}
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      field: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
          {!row.isActive && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleActivate(row)}
              title="Set as active term"
            >
              <CheckCircle size={16} />
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row)}
            disabled={row.isActive}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  const semesterOptions = [
    { value: 'first', label: '1st Semester' },
    { value: 'second', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' }
  ];

  const generateSchoolYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i <= 2; i++) {
      const startYear = currentYear + i;
      years.push({
        value: `${startYear}-${startYear + 1}`,
        label: `${startYear}-${startYear + 1}`
      });
    }
    return years;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Terms</h1>
            <p className="text-gray-600 mt-1">Manage school years and semesters</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus size={20} className="mr-2" />
            Add Term
          </Button>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Active Term Banner */}
        {terms.find(t => t.isActive) && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Active Term</p>
                <p className="text-blue-700">
                  {terms.find(t => t.isActive).schoolYear} - {' '}
                  <span className="capitalize">{terms.find(t => t.isActive).semester} Semester</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading terms...</p>
            </div>
          ) : (
            <Table columns={columns} data={terms} />
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? 'Edit Academic Term' : 'Add New Academic Term'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Dropdown
              label="School Year"
              name="schoolYear"
              value={formData.schoolYear}
              onChange={handleChange}
              options={generateSchoolYears()}
              placeholder="Select school year"
              required
            />

            <Dropdown
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              options={semesterOptions}
              placeholder="Select semester"
              required
            />

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Set as active term
              </label>
            </div>

            <Alert
              type="info"
              message="Only one term can be active at a time. Setting this as active will deactivate other terms."
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth>
                {editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AcademicTermsPage;