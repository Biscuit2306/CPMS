import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, Calendar, Target, Award, AlertCircle, CheckCircle, Edit, Trash2, Eye, Plus, TrendingUp, BarChart, Settings, LogOut, FileText } from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/jobposting.css';
import { Link } from "react-router-dom";

const JobPosting = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = [
        { number: '24', label: 'Total Jobs', icon: Briefcase, color: 'blue' },
        { number: '18', label: 'Active', icon: CheckCircle, color: 'green' },
        { number: '6', label: 'Closed', icon: Clock, color: 'orange' },
        { number: '487', label: 'Total Applications', icon: Users, color: 'purple' }
    ];

    const jobs = [
        {
            id: 1,
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '$140k - $180k',
            posted: '2024-01-05',
            deadline: '2024-02-15',
            status: 'active',
            applicants: 45,
            shortlisted: 12,
            interviewed: 8,
            hired: 2,
            description: 'Looking for an experienced software engineer to join our team.',
            requirements: ['5+ years experience', 'React, Node.js', 'Problem solving skills'],
            benefits: ['Health Insurance', 'Remote Work', '401k Matching']
        },
        {
            id: 2,
            title: 'Product Manager',
            department: 'Product',
            location: 'San Francisco, CA',
            type: 'Full-time',
            salary: '$130k - $170k',
            posted: '2024-01-10',
            deadline: '2024-01-30',
            status: 'urgent',
            applicants: 32,
            shortlisted: 8,
            interviewed: 5,
            hired: 1,
            description: 'Seeking a strategic product manager to lead our product initiatives.',
            requirements: ['7+ years PM experience', 'Technical background', 'Leadership skills'],
            benefits: ['Health Insurance', 'Stock Options', 'Gym Membership']
        },
        {
            id: 3,
            title: 'UX Designer',
            department: 'Design',
            location: 'New York, NY',
            type: 'Full-time',
            salary: '$110k - $150k',
            posted: '2024-01-15',
            deadline: '2024-02-20',
            status: 'active',
            applicants: 28,
            shortlisted: 10,
            interviewed: 4,
            hired: 0,
            description: 'Creative UX designer needed to enhance user experiences.',
            requirements: ['4+ years experience', 'Figma expertise', 'Portfolio required'],
            benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget']
        },
        {
            id: 4,
            title: 'DevOps Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '$120k - $160k',
            posted: '2024-01-12',
            deadline: '2024-02-10',
            status: 'active',
            applicants: 19,
            shortlisted: 6,
            interviewed: 3,
            hired: 1,
            description: 'DevOps engineer to manage our cloud infrastructure.',
            requirements: ['AWS/GCP experience', 'Kubernetes', 'CI/CD pipelines'],
            benefits: ['Health Insurance', 'Remote Work', 'Conference Budget']
        },
        {
            id: 5,
            title: 'Marketing Lead',
            department: 'Marketing',
            location: 'Los Angeles, CA',
            type: 'Full-time',
            salary: '$100k - $140k',
            posted: '2024-01-20',
            deadline: '2024-02-28',
            status: 'active',
            applicants: 21,
            shortlisted: 5,
            interviewed: 2,
            hired: 0,
            description: 'Marketing lead to drive our growth initiatives.',
            requirements: ['5+ years marketing', 'Digital marketing', 'Team management'],
            benefits: ['Health Insurance', 'Bonus Structure', 'Flexible PTO']
        },
        {
            id: 6,
            title: 'Data Analyst',
            department: 'Analytics',
            location: 'Boston, MA',
            type: 'Full-time',
            salary: '$90k - $120k',
            posted: '2024-01-08',
            deadline: '2024-01-25',
            status: 'closed',
            applicants: 42,
            shortlisted: 15,
            interviewed: 10,
            hired: 3,
            description: 'Data analyst to derive insights from business data.',
            requirements: ['SQL expertise', 'Python/R', 'Data visualization'],
            benefits: ['Health Insurance', 'Professional Development', 'Stock Options']
        }
    ];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || job.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleCreateJob = () => {
        setShowCreateModal(true);
    };

    const handleDeleteJob = (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            alert(`Job ${jobId} deleted!`);
        }
    };

    return (
        <div className="job-posting">
            <Navbar />

            <div className="job-posting__layout">
                {/* Sidebar */}
                <aside className={`job-posting__sidebar ${sidebarOpen ? 'job-posting__sidebar--open' : ''}`}>
                    <div className="job-posting__sidebar-header">
                        <div className="job-posting__user-profile">
                            <div className="job-posting__avatar">HR</div>
                            <div className="job-posting__user-details">
                                <h4>HR Manager</h4>
                                <p>Talent Acquisition</p>
                            </div>
                        </div>
                    </div>

                    <div className="job-posting__sidebar-content">
                        <nav className="job-posting__nav">
                            <Link
                                to="/recruiter"
                                className="job-posting__nav-item"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Briefcase size={20} />
                                <span>RecruiterDashboard</span>
                            </Link>

                            <a href="#" className="job-posting__nav-item job-posting__nav-item--active">
                                <Briefcase size={20} />
                                <span>Job Postings</span>
                                <div className="job-posting__nav-indicator"></div>
                            </a>

                            <a href="#" className="job-posting__nav-item">
                                <Users size={20} />
                                <span>Candidates</span>
                            </a>

                            <a href="#" className="job-posting__nav-item">
                                <Calendar size={20} />
                                <span>Interviews</span>
                            </a>

                            <a href="#" className="job-posting__nav-item">
                                <BarChart size={20} />
                                <span>Analytics</span>
                            </a>

                            <a href="#" className="job-posting__nav-item">
                                <Award size={20} />
                                <span>Offers</span>
                            </a>

                            <a href="#" className="job-posting__nav-item">
                                <Settings size={20} />
                                <span>Settings</span>
                            </a>
                        </nav>
                    </div>

                    <div className="job-posting__sidebar-footer">
                        <button className="job-posting__logout-btn">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="job-posting__main">
                    <div className="job-posting__content">

                        {/* Header */}
                        <div className="job-posting__header">
                            <div>
                                <h1 className="job-posting__title">Job Postings</h1>
                                <p className="job-posting__subtitle">Manage and track all your job openings</p>
                            </div>
                            <div className="job-posting__header-actions">
                                <div className="job-posting__search-wrap">
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        className="job-posting__search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="job-posting__btn-create" onClick={handleCreateJob}>
                                    <Plus size={18} />
                                    Create Job
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="job-posting__stats">
                            {stats.map((stat, i) => (
                                <div key={i} className={`job-posting__stat job-posting__stat--${stat.color}`}>
                                    <div className="job-posting__stat-icon">
                                        <stat.icon size={24} />
                                    </div>
                                    <div className="job-posting__stat-content">
                                        <p className="job-posting__stat-value">{stat.number}</p>
                                        <p className="job-posting__stat-label">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="job-posting__filters">
                            <div className="job-posting__tabs">
                                {['all', 'active', 'urgent', 'closed'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`job-posting__tab ${activeTab === tab ? 'job-posting__tab--active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Jobs Grid */}
                        <div className="job-posting__grid">
                            {filteredJobs.map(job => (
                                <div key={job.id} className="job-posting__card">
                                    <div className="job-posting__card-header">
                                        <div className="job-posting__card-top">
                                            <h3 className="job-posting__job-title">{job.title}</h3>
                                            <span className={`job-posting__status job-posting__status--${job.status}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="job-posting__department">{job.department}</p>
                                    </div>

                                    <div className="job-posting__job-meta">
                                        <div className="job-posting__meta-item">
                                            <MapPin size={16} />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="job-posting__meta-item">
                                            <Clock size={16} />
                                            <span>{job.type}</span>
                                        </div>
                                        <div className="job-posting__meta-item">
                                            <DollarSign size={16} />
                                            <span>{job.salary}</span>
                                        </div>
                                    </div>

                                    <div className="job-posting__job-stats">
                                        <div className="job-posting__stat-item">
                                            <span className="job-posting__stat-num">{job.applicants}</span>
                                            <span className="job-posting__stat-lbl">Applicants</span>
                                        </div>
                                        <div className="job-posting__stat-item">
                                            <span className="job-posting__stat-num">{job.shortlisted}</span>
                                            <span className="job-posting__stat-lbl">Shortlisted</span>
                                        </div>
                                        <div className="job-posting__stat-item">
                                            <span className="job-posting__stat-num">{job.interviewed}</span>
                                            <span className="job-posting__stat-lbl">Interviewed</span>
                                        </div>
                                        <div className="job-posting__stat-item">
                                            <span className="job-posting__stat-num">{job.hired}</span>
                                            <span className="job-posting__stat-lbl">Hired</span>
                                        </div>
                                    </div>

                                    <div className="job-posting__progress">
                                        <div className="job-posting__progress-label">
                                            <span>Hiring Progress</span>
                                            <span>{job.hired}/3</span>
                                        </div>
                                        <div className="job-posting__progress-bar">
                                            <div
                                                className="job-posting__progress-fill"
                                                style={{ width: `${(job.hired / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="job-posting__job-footer">
                                        <div className="job-posting__job-dates">
                                            <span className="job-posting__date-item">
                                                <Calendar size={14} />
                                                Posted: {new Date(job.posted).toLocaleDateString()}
                                            </span>
                                            <span className="job-posting__date-item job-posting__date-item--deadline">
                                                <AlertCircle size={14} />
                                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="job-posting__card-actions">
                                        <button className="job-posting__action-btn" onClick={() => setSelectedJob(job)}>
                                            <Eye size={16} />
                                            View
                                        </button>
                                        <button className="job-posting__action-btn">
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button className="job-posting__action-btn job-posting__action-btn--danger" onClick={() => handleDeleteJob(job.id)}>
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="job-posting__overlay" onClick={() => setSelectedJob(null)}>
                    <div className="job-posting__modal" onClick={(e) => e.stopPropagation()}>
                        <button className="job-posting__close" onClick={() => setSelectedJob(null)}>×</button>

                        <div className="job-posting__modal-header">
                            <div className="job-posting__modal-icon">
                                <Briefcase size={32} />
                            </div>
                            <h2 className="job-posting__modal-title">{selectedJob.title}</h2>
                            <p className="job-posting__modal-dept">{selectedJob.department}</p>
                            <span className={`job-posting__status job-posting__status--${selectedJob.status}`}>
                                {selectedJob.status}
                            </span>
                        </div>

                        <div className="job-posting__modal-body">
                            <div className="job-posting__modal-section">
                                <h3 className="job-posting__modal-subtitle">Job Details</h3>
                                <div className="job-posting__details-grid">
                                    <div className="job-posting__detail">
                                        <MapPin size={18} />
                                        <div>
                                            <span className="job-posting__detail-label">Location</span>
                                            <span className="job-posting__detail-value">{selectedJob.location}</span>
                                        </div>
                                    </div>
                                    <div className="job-posting__detail">
                                        <Clock size={18} />
                                        <div>
                                            <span className="job-posting__detail-label">Type</span>
                                            <span className="job-posting__detail-value">{selectedJob.type}</span>
                                        </div>
                                    </div>
                                    <div className="job-posting__detail">
                                        <DollarSign size={18} />
                                        <div>
                                            <span className="job-posting__detail-label">Salary</span>
                                            <span className="job-posting__detail-value">{selectedJob.salary}</span>
                                        </div>
                                    </div>
                                    <div className="job-posting__detail">
                                        <Users size={18} />
                                        <div>
                                            <span className="job-posting__detail-label">Applicants</span>
                                            <span className="job-posting__detail-value">{selectedJob.applicants}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="job-posting__modal-section">
                                <h3 className="job-posting__modal-subtitle">Description</h3>
                                <p className="job-posting__description">{selectedJob.description}</p>
                            </div>

                            <div className="job-posting__modal-section">
                                <h3 className="job-posting__modal-subtitle">Requirements</h3>
                                <ul className="job-posting__requirements">
                                    {selectedJob.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="job-posting__modal-section">
                                <h3 className="job-posting__modal-subtitle">Benefits</h3>
                                <div className="job-posting__benefits">
                                    {selectedJob.benefits.map((benefit, i) => (
                                        <span key={i} className="job-posting__benefit-tag">
                                            <Award size={14} />
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="job-posting__modal-section">
                                <h3 className="job-posting__modal-subtitle">Hiring Pipeline</h3>
                                <div className="job-posting__pipeline">
                                    <div className="job-posting__pipeline-item">
                                        <div className="job-posting__pipeline-num">{selectedJob.applicants}</div>
                                        <div className="job-posting__pipeline-label">Applied</div>
                                    </div>
                                    <div className="job-posting__pipeline-arrow">→</div>
                                    <div className="job-posting__pipeline-item">
                                        <div className="job-posting__pipeline-num">{selectedJob.shortlisted}</div>
                                        <div className="job-posting__pipeline-label">Shortlisted</div>
                                    </div>
                                    <div className="job-posting__pipeline-arrow">→</div>
                                    <div className="job-posting__pipeline-item">
                                        <div className="job-posting__pipeline-num">{selectedJob.interviewed}</div>
                                        <div className="job-posting__pipeline-label">Interviewed</div>
                                    </div>
                                    <div className="job-posting__pipeline-arrow">→</div>
                                    <div className="job-posting__pipeline-item job-posting__pipeline-item--success">
                                        <div className="job-posting__pipeline-num">{selectedJob.hired}</div>
                                        <div className="job-posting__pipeline-label">Hired</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="job-posting__modal-footer">
                            <button className="job-posting__btn-secondary" onClick={() => setSelectedJob(null)}>
                                Close
                            </button>
                            <button className="job-posting__btn-primary">
                                View Applicants
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Job Modal */}
            {showCreateModal && (
                <div className="job-posting__overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="job-posting__modal job-posting__modal--form" onClick={(e) => e.stopPropagation()}>
                        <button className="job-posting__close" onClick={() => setShowCreateModal(false)}>×</button>

                        <h2 className="job-posting__form-title">Create New Job Posting</h2>

                        <div className="job-posting__form">
                            <div className="job-posting__form-group">
                                <label className="job-posting__label">Job Title</label>
                                <input type="text" className="job-posting__input" placeholder="e.g. Senior Software Engineer" />
                            </div>

                            <div className="job-posting__form-row">
                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Department</label>
                                    <select className="job-posting__input">
                                        <option>Engineering</option>
                                        <option>Product</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>

                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Job Type</label>
                                    <select className="job-posting__input">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                            </div>

                            <div className="job-posting__form-row">
                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Location</label>
                                    <input type="text" className="job-posting__input" placeholder="e.g. Remote, New York" />
                                </div>

                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Salary Range</label>
                                    <input type="text" className="job-posting__input" placeholder="e.g. $100k - $150k" />
                                </div>
                            </div>

                            <div className="job-posting__form-group">
                                <label className="job-posting__label">Description</label>
                                <textarea className="job-posting__textarea" rows="4" placeholder="Job description..."></textarea>
                            </div>

                            <div className="job-posting__form-group">
                                <label className="job-posting__label">Requirements</label>
                                <textarea className="job-posting__textarea" rows="3" placeholder="List requirements..."></textarea>
                            </div>

                            <div className="job-posting__form-row">
                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Application Deadline</label>
                                    <input type="date" className="job-posting__input" />
                                </div>

                                <div className="job-posting__form-group">
                                    <label className="job-posting__label">Positions</label>
                                    <input type="number" className="job-posting__input" placeholder="Number of openings" min="1" />
                                </div>
                            </div>
                        </div>

                        <div className="job-posting__modal-footer">
                            <button className="job-posting__btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button className="job-posting__btn-primary" onClick={() => {
                                alert('Job created successfully!');
                                setShowCreateModal(false);
                            }}>
                                Create Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default JobPosting;