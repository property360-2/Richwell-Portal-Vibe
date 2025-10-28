// frontend/src/pages/admin/ProgramsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { apiService } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, Users, BookOpen } from 'lucide-react';

const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/programs');
      setPrograms(response.data.data);
    } catch (err) {
      console.error('Failed to fetch programs', err);
      showError('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Program name is required';
    } else {
      // Check for duplicate name (case-insensitive)
      const duplicate = programs.find(
        p => p.name.toLowerCase() === formData.name.toLowerCase() && 
        (!editMode || p.id !== selectedProgram.id)
      );
      if (duplicate) {
        errors.name = 'A program with this name already exists';
      }
    }

    if (!formData.code.trim()) {
      errors.code = 'Program code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      errors.code = 'Program code must contain only uppercase letters and numbers';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedProgram(null);
    setFormData({ name: '', code: '', description: '' });
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = async (program) => {
    setSelectedProgram(program);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the validation errors');
      return;
    }

    try {
      if (editMode) {
        await apiService.put(`/programs/${selectedProgram.id}`, formData);
        success('Program updated successfully');
      } else {
        await apiService.post('/programs', formData);
        success('Program created successfully');
      }

      setShowModal(false);
      fetchPrograms();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteClick = (program) => {
    setSelectedProgram(program);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await apiService.delete(`/programs/${selectedProgram.id}`);
      success('Program deleted successfully');
      setShowDeleteDialog(false);
      fetchPrograms();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete program');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      field: 'code',
      width: '150px',
      render: (value) => (
        <span className="font-mono font-semibold text-blue-600">{value}</span>
      )
    },
    {
      header: 'Program Name',
      field: 'name'
    },
    {
      header: 'Students',
      field: '_count',
      width: '120px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-600" />
          <span>{value?.students || 0}</span>
        </div>
      )
    },
    {
      header: 'Subjects',
      field: '_count',
      width: '120px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-gray-600" />
          <span>{value?.subjects || 0}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      field: 'id',
      width: '180px',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleView(row)}
            title="View details"
          >
            <Eye size={16} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(row)}
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
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
              error={formErrors.code}
            />

            <InputField
              label="Program Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Science in Computer Science"
              required
              error={formErrors.name}
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

        {/* View Details Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Program Details"
          size="lg"
        >
          {selectedProgram && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Program Code</p>
                  <p className="text-lg font-semibold">{selectedProgram.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Program Name</p>
                  <p className="text-lg font-semibold">{selectedProgram.name}</p>
                </div>
              </div>

              {selectedProgram.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900 mt-1">{selectedProgram.description}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Total Students</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {selectedProgram._count?.students || 0}
                      </p>
                    </div>
                    <Users size={48} className="text-blue-600" />
                  </div>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Total Subjects</p>
                      <p className="text-3xl font-bold text-green-900">
                        {selectedProgram._count?.subjects || 0}
                      </p>
                    </div>
                    <BookOpen size={48} className="text-green-600" />
                  </div>
                </Card>
              </div>

              {/* Placeholder for student distribution */}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-3">Student Distribution</p>
                <p className="text-sm text-gray-500 italic">
                  Detailed student statistics will be available soon
                </p>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          type="danger"
          title="Delete Program"
          message={`Are you sure you want to delete "${selectedProgram?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          loading={deleteLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProgramsPage;