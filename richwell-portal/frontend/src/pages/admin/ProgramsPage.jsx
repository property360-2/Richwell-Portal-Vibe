// frontend/src/pages/admin/ProgramsPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import Alert from '../../components/common/Alert';
import { apiService } from '../../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/programs');
      setPrograms(response.data.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to fetch programs'
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
    setSelectedProgram(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setEditMode(true);
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      description: program.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await apiService.put(`/programs/${selectedProgram.id}`, formData);
        setAlert({
          type: 'success',
          message: 'Program updated successfully'
        });
      } else {
        await apiService.post('/programs', formData);
        setAlert({
          type: 'success',
          message: 'Program created successfully'
        });
      }

      setShowModal(false);
      fetchPrograms();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleDelete = async (program) => {
    if (!window.confirm(`Are you sure you want to delete ${program.name}?`)) {
      return;
    }

    try {
      await apiService.delete(`/programs/${program.id}`);
      setAlert({
        type: 'success',
        message: 'Program deleted successfully'
      });
      fetchPrograms();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete program'
      });
    }
  };

  const columns = [
    {
      header: 'Code',
      field: 'code',
      width: '150px'
    },
    {
      header: 'Program Name',
      field: 'name'
    },
    {
      header: 'Students',
      field: '_count',
      render: (value) => value?.students || 0
    },
    {
      header: 'Subjects',
      field: '_count',
      render: (value) => value?.subjects || 0
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
            <p className="text-gray-600 mt-1">Manage degree programs</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus size={20} className="mr-2" />
            Add Program
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
              <p className="text-gray-600 mt-4">Loading programs...</p>
            </div>
          ) : (
            <Table columns={columns} data={programs} />
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? 'Edit Program' : 'Add New Program'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Program Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., BSCS"
              required
              disabled={editMode}
            />

            <InputField
              label="Program Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Science in Computer Science"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Program description..."
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

export default ProgramsPage;