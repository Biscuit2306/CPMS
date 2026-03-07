import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Heart,
  Filter,
  Loader,
  TrendingUp,
} from "lucide-react";
import StudentLayout from "../../components/StudentLayout";
import ExternalJobsFilter from "../../components/ExternalJobsFilter";
import InterviewFeature from "../InterviewFeature";
import ProjectEvaluator from "../ProjectEvaluator";
import { useStudent } from "../../context/StudentContext";
import "../../styles/student-css/externaljobs.css";

const ExternalJobs = () => {
  const { student } = useStudent();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // States
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [stats, setStats] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    jobTypes: [],
    locations: [],
    salaryRange: [0, 100],
    experience: [],
    dateRange: { from: '', to: '' },
    urgency: 'all',
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
    fetchStats();
    fetchSavedJobs();
  }, []);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/scraped-jobs`
      );
      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
      } else {
        console.error("Failed to fetch jobs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch job statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/scraped-jobs/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch saved jobs for current student
  const fetchSavedJobs = async () => {
    try {
      if (!student?.firebaseUid) return;

      const response = await fetch(
        `${BACKEND_URL}/api/scraped-jobs/student/${student.firebaseUid}/saved`
      );
      const data = await response.json();

      if (data.success) {
        setSavedJobs(data.jobs.map((job) => job._id));
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  // Apply advanced filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          (job.company || '').toLowerCase().includes(searchLower) ||
          (job.position || '').toLowerCase().includes(searchLower) ||
          (job.jobDescription || '').toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Job type filter
      if (filters.jobTypes.length > 0) {
        if (!filters.jobTypes.includes(job.jobType)) {
          return false;
        }
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(job.location)) {
          return false;
        }
      }

      // Salary range filter
      if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100) {
        const salary = job.salary ? parseInt(job.salary.replace(/[^\d]/g, '')) : 0;
        if (salary < filters.salaryRange[0] || salary > filters.salaryRange[1]) {
          return false;
        }
      }

      // Experience level filter
      if (filters.experience.length > 0) {
        const jobExpLevel = job.experience || '';
        if (!filters.experience.some(exp => jobExpLevel.toLowerCase().includes(exp.toLowerCase()))) {
          return false;
        }
      }

      // Date range filter (application deadline)
      if (filters.dateRange.from || filters.dateRange.to) {
        const deadline = new Date(job.applicationDeadline);
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (deadline < fromDate) return false;
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          if (deadline > toDate) return false;
        }
      }

      // Urgency filter
      if (filters.urgency !== 'all') {
        const deadline = new Date(job.applicationDeadline);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        if (filters.urgency === 'urgent' && daysUntilDeadline > 7) {
          return false;
        }
        if (filters.urgency === 'normal' && daysUntilDeadline <= 7) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, filters]);

  // Toggle save job
  const toggleSaveJob = async (jobId) => {
    try {
      if (!student?.firebaseUid) {
        alert("Please log in first");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/scraped-jobs/${jobId}/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentFirebaseUid: student.firebaseUid }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.saved) {
          setSavedJobs([...savedJobs, jobId]);
        } else {
          setSavedJobs(savedJobs.filter((id) => id !== jobId));
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  // Constants
  const jobTypes = stats.byJobType ? stats.byJobType.map(item => item._id) : [];
  const locations = stats.byLocation || [];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <StudentLayout>
      <div className="external-jobs-container">
        {/* Header */}
        <div className="external-jobs-header">
          <div className="external-jobs-header-content">
            <h1> External Jobs</h1>
            <p>Search and apply to the latest job vacancies & openings in India</p>
          </div>
        </div>

        {/* Advanced Filters and results layout */}
        <div className="external-jobs-main">
          <div className="external-jobs-filter-sidebar">
            <ExternalJobsFilter 
              onFilterChange={handleFilterChange}
              jobTypes={jobTypes}
              locations={locations}
              totalJobs={stats.totalJobs || 0}
            />
          </div>

          {/* Jobs List wrapper */}
          <div className="external-jobs-list-wrapper">
            <div className="external-jobs-list">
          {loading ? (
            <div className="external-jobs-loading-container">
              <Loader size={40} className="external-jobs-spinner" />
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <>
              <div className="external-jobs-results-info">
                Showing {filteredJobs.length} job
                {filteredJobs.length !== 1 ? "s" : ""}
              </div>

              {filteredJobs.map((job) => (
                <div key={job._id} className="external-jobs-card">
                  <div className="external-jobs-card-header">
                    <div className="external-jobs-card-title">
                      <h3 className="external-jobs-card-position">{job.position}</h3>
                      <span className="external-jobs-card-type-badge">{job.jobType}</span>
                    </div>

                    <button
                      className={`external-jobs-save-btn ${
                        savedJobs.includes(job._id) ? "external-jobs-saved" : ""
                      }`}
                      onClick={() => toggleSaveJob(job._id)}
                      title={
                        savedJobs.includes(job._id)
                          ? "Remove from saved"
                          : "Save job"
                      }
                    >
                      <Heart
                        size={20}
                        fill={savedJobs.includes(job._id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="external-jobs-card-company">
                    <Briefcase size={18} />
                    <span>{job.company}</span>
                  </div>

                  <div className="external-jobs-card-details">
                    <div className="external-jobs-detail-item">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="external-jobs-detail-item">
                      <DollarSign size={16} />
                      <span>{job.salary}</span>
                    </div>
                    <div className="external-jobs-detail-item">
                      <Calendar size={16} />
                      <span>
                        Deadline:{" "}
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="external-jobs-card-description">
                    {job.jobDescription.substring(0, 150)}...
                  </div>

                  <div className="external-jobs-card-footer">
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="external-jobs-apply-btn"
                    >
                      Apply Now
                      <ExternalLink size={16} />
                    </a>

                    {job.companyWebsite && (
                      <a
                        href={job.companyWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="external-jobs-company-link-btn"
                      >
                        Company Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="external-jobs-no-jobs-container">
              <Briefcase size={48} />
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
            </div> {/* end external-jobs-list */}
          </div>   {/* end list-wrapper */}
        </div>     {/* end main */}
      </div>       {/* end container */}

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default ExternalJobs;
