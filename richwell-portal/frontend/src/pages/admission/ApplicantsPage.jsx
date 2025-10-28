// frontend/src/pages/admission/ApplicantsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Filter, RefreshCcw, Search, Users, CheckCircle2, Clock3, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { apiService } from '../../utils/api';

const STATUS_LABELS = {
  pending: 'Pending Review',
  for_interview: 'For Interview',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  enrolled: 'Enrolled'
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  for_interview: 'bg-sky-50 text-sky-700 border border-sky-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  waitlisted: 'bg-violet-50 text-violet-700 border border-violet-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  enrolled: 'bg-blue-50 text-blue-700 border border-blue-200'
};

const getStatusLabel = (status) => STATUS_LABELS[status] || 'Unknown';
const getStatusStyle = (status) => STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border border-gray-200';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [terms, setTerms] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    programId: 'all',
    termId: 'all',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSupportingData = useCallback(async () => {
    try {
      const [programResponse, termResponse] = await Promise.all([
        apiService.get('/programs'),
        apiService.get('/academic-terms')
      ]);

      setPrograms(programResponse.data?.data || []);
      setTerms(termResponse.data?.data || []);
    } catch (err) {
      console.error('Failed to load admission filters', err);
    }
  }, []);

  const fetchApplicants = useCallback(async (currentFilters) => {
    const params = { ...currentFilters };

    if (params.status === 'all') delete params.status;
    if (params.programId === 'all') delete params.programId;
    if (params.termId === 'all') delete params.termId;
    if (!params.search) delete params.search;

    try {
      setError(null);
      setSuccessMessage('');
      setLoading(true);
      const response = await apiService.getAdmissionApplicants(params);
      setApplicants(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load applicants', err);
      const message = err.response?.data?.message || 'Unable to load applicants right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupportingData();
  }, [loadSupportingData]);

  useEffect(() => {
    fetchApplicants(filters);
  }, [fetchApplicants, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({ status: 'all', programId: 'all', termId: 'all', search: '' });
  };

  const handleStatusUpdate = async (applicant, status) => {
    try {
      setActionLoading(true);
      setError(null);
      await apiService.updateAdmissionApplicantStatus(applicant.id, { status });
      setSuccessMessage(`Applicant marked as ${getStatusLabel(status)}.`);
      await fetchApplicants(filters);
    } catch (err) {
      console.error('Failed to update applicant status', err);
      const message = err.response?.data?.message || 'Unable to update applicant status right now.';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedApplicant(null);
    setShowDetails(false);
  };

  const statusSummary = useMemo(() => {
    return applicants.reduce((summary, applicant) => {
      const status = applicant.status || 'unknown';
      const key = STATUS_LABELS[status] ? status : 'unknown';
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    }, {});
  }, [applicants]);

  const metrics = useMemo(() => ([
    {
      title: 'Total Applicants',
      value: applicants.length,
      description: 'Active records in this intake',
      icon: <Users size={24} className="text-blue-600" />
    },
    {
      title: 'Pending Review',
      value: statusSummary.pending || 0,
      description: 'Awaiting document validation',
      icon: <Clock3 size={24} className="text-amber-500" />
    },
    {
      title: 'For Interview',
      value: statusSummary.for_interview || 0,
      description: 'Scheduled for interviews',
      icon: <Calendar size={24} className="text-sky-500" />
    },
    {
      title: 'Accepted Applicants',
      value: statusSummary.accepted || 0,
      description: 'Recommended for enrollment',
      icon: <CheckCircle2 size={24} className="text-emerald-500" />
    }
  ]), [applicants.length, statusSummary]);

  const columns = [
    {
      header: 'Applicant',
      field: 'applicantName',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">{value || row.fullName || row.name || 'Unnamed Applicant'}</p>
          <p className="text-sm text-gray-500">{row.email || row.studentEmail || 'No email provided'}</p>
        </div>
      )
    },
    {
      header: 'Program',
      field: 'program',
      render: (value, row) => (
        <span>{value?.name || row.programName || row.program || '—'}</span>
      )
    },
    {
      header: 'Term',
      field: 'term',
      render: (value, row) => value?.name || row.termName || row.term || '—'
    },
    {
      header: 'Submitted',
      field: 'submittedAt',
      render: (value, row) => formatDate(value || row.createdAt)
    },
    {
      header: 'Status',
      field: 'status',
      render: (value) => (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(value)}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {getStatusLabel(value)}
        </span>
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      width: '220px',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openApplicantDetails(row)}
          >
            <span className="flex items-center gap-2">
              <Eye size={16} />
              <span>View</span>
            </span>
          </Button>
          <Button
            size="sm"
            variant="success"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(row, 'accepted')}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(row, 'waitlisted')}
          >
            Waitlist
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={actionLoading}
            onClick={() => handleStatusUpdate(row, 'rejected')}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicant Management</h1>
            <p className="text-gray-600 mt-1">
              Track applicants throughout the admissions pipeline and coordinate next steps with the registrar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchApplicants(filters)}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={18} />
              Refresh
            </Button>
          </div>
        </div>

        {(error || successMessage) && (
          <div className="space-y-3">
            {error && (
              <Alert type="error" message={error} onClose={() => setError(null)} />
            )}
            {successMessage && (
              <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  {metric.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card
          title="Filters"
          headerAction={
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          }
        >
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Search size={16} /> Search
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by applicant name, email, or student number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Filter size={16} /> Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users size={16} /> Program
              </label>
              <select
                name="programId"
                value={filters.programId}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar size={16} /> Term
              </label>
              <select
                name="termId"
                value={filters.termId}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All terms</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name || `${term.academicYear} • ${term.semester}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" size="md" variant="primary" className="w-full flex items-center justify-center gap-2">
                <Search size={16} />
                Apply Search
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Applicants">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <Table columns={columns} data={applicants} />
          )}
        </Card>
      </div>

      <Modal isOpen={showDetails} onClose={closeDetails} title="Applicant Details" size="lg">
        {selectedApplicant ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Full Name</dt>
                  <dd className="text-base text-gray-900 font-medium">
                    {selectedApplicant.applicantName || selectedApplicant.fullName || selectedApplicant.name || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-base text-gray-900">{selectedApplicant.email || selectedApplicant.studentEmail || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Program</dt>
                  <dd className="text-base text-gray-900">{selectedApplicant.program?.name || selectedApplicant.programName || selectedApplicant.program || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Term</dt>
                  <dd className="text-base text-gray-900">{selectedApplicant.term?.name || selectedApplicant.termName || selectedApplicant.term || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Current Status</dt>
                  <dd>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedApplicant.status)}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {getStatusLabel(selectedApplicant.status)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Submitted</dt>
                  <dd className="text-base text-gray-900">{formatDate(selectedApplicant.submittedAt || selectedApplicant.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
              <ul className="mt-2 space-y-2">
                {(selectedApplicant.documents || selectedApplicant.requirements || []).length === 0 ? (
                  <li className="text-sm text-gray-500">No documents uploaded yet.</li>
                ) : (
                  (selectedApplicant.documents || selectedApplicant.requirements).map((document, index) => (
                    <li key={document.id || index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{document.name || document.title}</p>
                        <p className="text-xs text-gray-500">{document.status ? `Status: ${getStatusLabel(document.status)}` : document.description}</p>
                      </div>
                      {document.url && (
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="success"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedApplicant, 'accepted')}
              >
                Mark as Accepted
              </Button>
              <Button
                variant="secondary"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedApplicant, 'for_interview')}
              >
                Schedule Interview
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedApplicant, 'rejected')}
              >
                Reject Applicant
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select an applicant to view more details.</p>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ApplicantsPage;
