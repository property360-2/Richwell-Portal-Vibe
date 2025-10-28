// frontend/src/pages/admin/SectionsPage.jsx
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
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const SectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    professorId: '',
    maxSlots: '',
    semester: '',
    schoolYear: '',
    schedule: ''
  });

  useEffect(() => {
    fetchSubjects();
    fetchProfessors();
    fetchSections();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await apiService.get('/subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await apiService.getProfessors();
      setProfessors(response.data.data || []);
    } catch (error) {
      setProfessors([]);
      if (error.response?.status === 403) {
        setAlert({
          type: 'error',
          message:
            'Your role does not have permission to view professors. Please contact a dean for access.'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Failed to fetch professors'
        });
      }
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/sections');
      setSections(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sections', error);
      setAlert({
        type: 'error',
        message: 'Failed to fetch sections'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedSection(null);
    setFormData({
      name: '',
      subjectId: '',
      professorId: '',
      maxSlots: '30',
      semester: '',
      schoolYear: '',
      schedule: ''
    });
    setShowModal(true);
  };

  const handleEdit = (section) => {
    setEditMode(true);
    setSelectedSection(section);
    setFormData({
      name: section.name,
      subjectId: section.subjectId.toString(),
      professorId: section.professorId.toString(),
      maxSlots: section.maxSlots.toString(),
      semester: section.semester,
      schoolYear: section.schoolYear,
      schedule: section.schedule || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      subjectId: parseInt(formData.subjectId),
      professorId: parseInt(formData.professorId),
      maxSlots: parseInt(formData.maxSlots)
    };

    try {
      if (editMode) {
        await apiService.put(`/sections/${selectedSection.id}`, submitData);
        setAlert({
          type: 'success',
          message: 'Section updated successfully'
        });
      } else {
        await apiService.post('/sections', submitData);
        setAlert({
          type: 'success',
          message: 'Section created successfully'
        });
      }

      setShowModal(false);
      fetchSections();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleDelete = async (section) => {
    if (!window.confirm(`Are you sure you want to delete ${section.name}?`)) {
      return;
    }

    try {
      await apiService.delete(`/sections/${section.id}`);
      setAlert({
        type: 'success',
        message: 'Section deleted successfully'
      });
      fetchSections();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete section'
      });
    }
  };

  const columns = [
    {
      header: 'Section',
      field: 'name',
      width: '120px'
    },
    {
      header: 'Subject',
      field: 'subject',
      render: (value) => (
        <div>
          <p className="font-semibold">{value?.code}</p>
          <p className="text-sm text-gray-600">{value?.name}</p>
        </div>
      )
    },
    {
      header: 'Professor',
      field: 'professor',
      render: (value) => value?.user?.email || 'Not assigned'
    },
    {
      header: 'Schedule',
      field: 'schedule',
      render: (value) => value || 'TBA'
    },
    {
      header: 'Slots',
      field: 'availableSlots',
      width: '120px',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-600" />
          <span>{value}/{row.maxSlots}</span>
        </div>
      )
    },
    {
      header: 'Status',
      field: 'status',
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Term',
      field: 'schoolYear',
      render: (value, row) => (
        <div className="text-sm">
          <p>{value}</p>
          <p className="text-gray-600 capitalize">{row.semester} Sem</p>
        </div>
      )
    },
    {
      header: 'Actions',
      field: 'id',
      render: (value, row) => (
        <div className="flex gap-2">
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

  const currentYear = new Date().getFullYear();
  const schoolYearOptions = [
    { value: `${currentYear}-${currentYear + 1}`, label: `${currentYear}-${currentYear + 1}` },
    { value: `${currentYear + 1}-${currentYear + 2}`, label: `${currentYear + 1}-${currentYear + 2}` }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
            <p className="text-gray-600 mt-1">Manage class sections</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus size={20} className="mr-2" />
            Create Section
          </Button>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <Card>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading sections...</p>
            </div>
          ) : (
            <Table columns={columns} data={sections} />
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? 'Edit Section' : 'Create New Section'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Section Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., A, B, 1A"
                required
              />

              <InputField
                label="Max Slots"
                name="maxSlots"
                type="number"
                value={formData.maxSlots}
                onChange={handleChange}
                placeholder="30"
                required
                min="1"
                max="100"
              />
            </div>

            <Dropdown
              label="Subject"
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              options={subjects.map(s => ({ 
                value: s.id.toString(), 
                label: `${s.code} - ${s.name}` 
              }))}
              placeholder="Select subject"
              required
            />

            <Dropdown
              label="Professor"
              name="professorId"
              value={formData.professorId}
              onChange={handleChange}
              options={professors.map(p => ({ 
                value: p.id.toString(), 
                label: p.user?.email || 'Unknown' 
              }))}
              placeholder="Select professor"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                label="School Year"
                name="schoolYear"
                value={formData.schoolYear}
                onChange={handleChange}
                options={schoolYearOptions}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule (Optional)
              </label>
              <textarea
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., MWF 9:00-10:00 AM, Room 101"
              />
            </div>

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

export default SectionsPage;