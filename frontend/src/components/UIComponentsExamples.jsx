// ============================================================================
// UI COMPONENTS - USAGE EXAMPLES
// ============================================================================
// Copy-paste ready examples for implementing polished UI patterns

import React, { useState } from 'react';
import {
  EmptyState,
  SkeletonCard,
  SkeletonTable,
  LoadingSpinner,
  Alert,
  FormField,
  Pagination,
  Tabs,
  Modal,
  Card,
  StatCard
} from './UIComponents';
import { Plus, AlertCircle, TrendingUp, Users } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: LIST PAGE WITH EMPTY STATE
// ============================================================================

export function StudentProjectsPage() {
  const [projects] = useState([]); // Empty initially
  const [isLoading] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>My Projects</h1>
        <SkeletonCard count={3} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Projects</h1>
        <button className="btn btn-primary">
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No projects yet"
          description="Projects help you showcase your best work. Start adding your projects to build your portfolio."
          actionLabel="Create your first project"
          onAction={() => console.log('Create project')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <Card
              key={project.id}
              title={project.title}
              subtitle={project.tech}
              actions={[
                { label: 'View', onClick: () => {} },
                { label: 'Edit', onClick: () => {} },
                { label: 'Delete', variant: 'danger', onClick: () => {} }
              ]}
            >
              <p>{project.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: FORM WITH VALIDATION
// ============================================================================

export function LoginFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Email looks incomplete';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setAlerts([{
        id: Date.now(),
        type: 'success',
        message: 'Login successful!'
      }]);
      
      // Reset form
      setEmail('');
      setPassword('');
      setErrors({});
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Login</h2>

      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
        />
      ))}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              const newErrors = { ...errors };
              delete newErrors.email;
              setErrors(newErrors);
            }
          }}
          error={errors.email}
          placeholder="your@email.com"
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              const newErrors = { ...errors };
              delete newErrors.password;
              setErrors(newErrors);
            }
          }}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.5rem' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner size="sm" label="Signing in..." /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: DASHBOARD WITH STATS
// ============================================================================

export function AdminDashboardExample() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Users}
          label="Total Students"
          value="2,345"
          change="12% from last month"
          isPositive={true}
        />
        <StatCard
          icon={TrendingUp}
          label="Placement Rate"
          value="85%"
          change="3% from last month"
          isPositive={true}
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value="23"
          change="5 new today"
          isPositive={false}
        />
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Last 7 days">
        <SkeletonTable rows={5} cols={4} />
      </Card>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: TABLE WITH PAGINATION
// ============================================================================

export function StudentListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [students] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'placed' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
  ]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Students</h1>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <span className={`badge badge-${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary">Edit</button>
                  <button className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: TABBED INTERFACE
// ============================================================================

export function ProfilePageExample() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      content: (
        <div >
          <h3>Edit Profile</h3>
          <FormField
            label="Full Name"
            name="fullName"
            value="John Doe"
            onChange={() => {}}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value="john@example.com"
            onChange={() => {}}
          />
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Save Changes
          </button>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div>
          <h3>Change Password</h3>
          <FormField
            label="Current Password"
            name="current"
            type="password"
            value=""
            onChange={() => {}}
          />
          <FormField
            label="New Password"
            name="new"
            type="password"
            value=""
            onChange={() => {}}
          />
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Update Password
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Profile</h1>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: MODAL DIALOG
// ============================================================================

export function DeleteConfirmationExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      setIsModalOpen(false);
      alert('Deleted successfully!');
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button
        className="btn btn-danger"
        onClick={() => setIsModalOpen(true)}
      >
        Delete Project
      </button>

      <Modal
        isOpen={isModalOpen}
        title="Delete Project"
        onClose={() => setIsModalOpen(false)}
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setIsModalOpen(false)
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            variant: 'danger',
            onClick: handleDelete
          }
        ]}
      >
        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: ERROR HANDLING BEST PRACTICES
// ============================================================================

export function ErrorHandlingExample() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulatedError = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setError('Failed to load data. Please try again.');
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Error Handling Example</h1>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <button
        className="btn btn-primary"
        onClick={handleSimulatedError}
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner size="sm" /> : 'Trigger Error'}
      </button>

      {/* Best Practices */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h3>Error Handling Best Practices:</h3>
        <ul>
          <li>✅ Show errors inline near the input field</li>
          <li>✅ Use friendly, human language</li>
          <li>✅ Provide a way to dismiss or retry</li>
          <li>✅ Never show technical error codes to users</li>
          <li>✅ Log errors to console for debugging</li>
          <li>❌ Don't use alert() popups</li>
          <li>❌ Don't blame the user ("Invalid input")</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: COMPLETE PAGE WITH ALL PATTERNS
// ============================================================================

export function RecruiterCandidatesPageExample() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Simulate loading data
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCandidates([
        { id: 1, name: 'Alice Brown', applied: '2 days ago', status: 'pending' },
        { id: 2, name: 'Charlie Dean', applied: '5 days ago', status: 'shortlisted' },
        { id: 3, name: 'Eve Garcia', applied: '1 week ago', status: 'rejected' }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleAddCandidate = () => {
    setIsModalOpen(false);
    setAlerts([{
      id: Date.now(),
      type: 'success',
      message: 'Candidate added successfully!'
    }]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Job Candidates</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Candidate
        </button>
      </div>

      {/* Alerts */}
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
        />
      ))}

      {/* Search & Filter Section */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonTable rows={5} cols={4} />}

      {/* Empty State */}
      {!isLoading && candidates.length === 0 && (
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Start building your candidate pool by adding new candidates for this job drive."
          actionLabel="Add your first candidate"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Table */}
      {!isLoading && candidates.length > 0 && (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.applied}</td>
                    <td>
                      <span className={`badge badge-${candidate.status}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(candidates.length / 10)}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Add New Candidate"
        onClose={() => setIsModalOpen(false)}
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setIsModalOpen(false)
          },
          {
            label: 'Add Candidate',
            variant: 'primary',
            onClick: handleAddCandidate
          }
        ]}
      >
        <FormField
          label="Full Name"
          name="name"
          placeholder="John Doe"
          onChange={() => {}}
          value=""
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          onChange={() => {}}
          value=""
          required
        />
      </Modal>
    </div>
  );
}
