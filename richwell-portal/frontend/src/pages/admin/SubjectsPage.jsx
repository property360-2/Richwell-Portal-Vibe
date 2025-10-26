// frontend/src/pages/admin/SubjectsPage.jsx
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
import { Plus, Edit, Trash2, Filter } from 'lucide-react';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filterProgram, setFilterProgram] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    units: '',
    subjectType: '',
    yearStanding: '',
    recommendedYear: '',
    recommendedSemester: '',
    programId: '',
    prerequisiteId: ''
  });

  useEffect(() => {
    fetchPrograms();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [filterProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await apiService.get('/programs');
      setPrograms(response.data.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error('Failed to fetch programs');
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const url = filterProgram ? `/subjects?programId=${filterProgram}` : '/subjects';
      const response = await apiService.get(url);
      setSubjects(response.data.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to fetch subjects'
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
    setSelectedSubject(null);
    setFormData({
      code: '',
      name: '',
      units: '',
      subjectType: '',
      yearStanding: '',
      recommendedYear: '',
      recommendedSemester: '',
      programId: '',
      prerequisiteId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setEditMode(true);
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      units: subject.units.toString(),
      subjectType: subject.subjectType,
      yearStanding: subject.yearStanding || '',
      recommendedYear: subject.recommendedYear || '',
      recommendedSemester: subject.recommendedSemester || '',
      programId: subject.programId.toString(),
      prerequisiteId: subject.prerequisiteId?.toString() || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      units: parseInt(formData.units),
      programId: parseInt(formData.programId),
      prerequisiteId: formData.prerequisiteId ? parseInt(formData.prerequisiteId) : null,
      yearStanding: formData.yearStanding || null,
      recommendedYear: formData.recommendedYear || null,
      recommendedSemester: formData.recommendedSemester || null
    };

    try {
      if (editMode) {
        await apiService.put(`/subjects/${selectedSubject.id}`, submitData);
        setAlert({
          type: 'success',
          message: 'Subject updated successfully'
        });
      } else {
        await apiService.post('/subjects', submitData);
        setAlert({
          type: 'success',
          message: 'Subject created successfully'
        });
      }

      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      return;
    }

    try {
      await apiService.delete(`/subjects/${subject.id}`);
      setAlert({
        type: 'success',
        message: 'Subject deleted successfully'
      });
      fetchSubjects();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete subject'
      });
    }
  };

  const columns = [
    {
      header: 'Code',
      field: 'code',
      width: '120px'
    },
    {
      header: 'Subject Name',
      field: 'name'
    },
    {
      header: 'Units',
      field: 'units',
      width: '80px'
    },
    {
      header: 'Type',
      field: 'subjectType',
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value === 'major' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Program',
      field: 'program',
      render: (value) => value?.code || 'N/A'
    },
    {
      header: 'Prerequisite',
      field: 'prerequisite',
      render: (value) => value?.code || 'None'
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

  const subjectTypeOptions = [
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' }
  ];

  const yearOptions = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' }
  ];

  const semesterOptions = [
    { value: 'first', label: '1st Semester' },
    { value: 'second', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600 mt-1">Manage course subjects</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus size={20} className="mr-2" />
            Add Subject
          </Button>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Filter */}
        <Card>
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <Dropdown
              label="Filter by Program"
              name="filterProgram"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              options={programs.map(p => ({ value: p.id, label: p.name }))}
              placeholder="All Programs"
              className="flex-1"
            />
            {filterProgram && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterProgram('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading subjects...</p>
            </div>
          ) : (
            <Table columns={columns} data={subjects} />
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? 'Edit Subject' : 'Add New Subject'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Subject Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., CS101"
                required
                disabled={editMode}
              />

              <InputField
                label="Units"
                name="units"
                type="number"
                value={formData.units}
                onChange={handleChange}
                placeholder="3"
                required
                min="1"
                max="6"
              />
            </div>

            <InputField
              label="Subject Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Introduction to Programming"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                label="Subject Type"
                name="subjectType"
                value={formData.subjectType}
                onChange={handleChange}
                options={subjectTypeOptions}
                placeholder="Select type"
                required
              />

              <Dropdown
                label="Program"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                options={programs.map(p => ({ value: p.id.toString(), label: p.name }))}
                placeholder="Select program"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                label="Year Standing (Optional)"
                name="yearStanding"
                value={formData.yearStanding}
                onChange={handleChange}
                options={yearOptions}
                placeholder="No restriction"
              />

              <Dropdown
                label="Prerequisite (Optional)"
                name="prerequisiteId"
                value={formData.prerequisiteId}
                onChange={handleChange}
                options={subjects
                  .filter(s => s.id !== selectedSubject?.id)
                  .map(s => ({ value: s.id.toString(), label: `${s.code} - ${s.name}` }))}
                placeholder="None"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Dropdown
                label="Recommended Year (Optional)"
                name="recommendedYear"
                value={formData.recommendedYear}
                onChange={handleChange}
                options={yearOptions}
                placeholder="No recommendation"
              />

              <Dropdown
                label="Recommended Semester (Optional)"
                name="recommendedSemester"
                value={formData.recommendedSemester}
                onChange={handleChange}
                options={semesterOptions}
                placeholder="No recommendation"
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

export default SubjectsPage;