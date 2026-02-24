import React, { useState, useCallback } from 'react';
import {
  Search,
  X,
  ChevronDown,
  DollarSign,
  MapPin,
  Briefcase,
  Filter,
  Clock,
  Zap,
  TrendingUp,
} from 'lucide-react';
import '../styles/components-css/externaljobsfilter.css';

const ExternalJobsFilter = ({ 
  onFilterChange, 
  jobTypes = [],
  locations = [],
  totalJobs = 0 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    jobTypes: [],
    locations: [],
    salaryRange: [0, 100],
    experience: [],
    dateRange: { from: '', to: '' },
    urgency: 'all', // all, urgent, normal
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    type: true,
    location: true,
    salary: false,
    experience: false,
    date: false,
    urgency: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearchChange = useCallback((value) => {
    const newFilters = { ...filters, searchTerm: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const toggleJobType = useCallback((type) => {
    const newTypes = filters.jobTypes.includes(type)
      ? filters.jobTypes.filter(t => t !== type)
      : [...filters.jobTypes, type];
    const newFilters = { ...filters, jobTypes: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const toggleLocation = useCallback((location) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    const newFilters = { ...filters, locations: newLocations };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const toggleExperience = useCallback((exp) => {
    const newExp = filters.experience.includes(exp)
      ? filters.experience.filter(e => e !== exp)
      : [...filters.experience, exp];
    const newFilters = { ...filters, experience: newExp };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleSalaryChange = useCallback((key, min, max) => {
    const newRange = [...filters.salaryRange];
    if (key === 'min') {
      newRange[0] = Math.min(Math.max(min, 0), newRange[1]);
    } else {
      newRange[1] = Math.max(Math.min(max, 100), newRange[0]);
    }
    const newFilters = { ...filters, salaryRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleDateChange = useCallback((key, value) => {
    const newDateRange = { ...filters.dateRange, [key]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleUrgencyChange = useCallback((value) => {
    const newFilters = { ...filters, urgency: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const resetFilters = useCallback(() => {
    const emptyFilters = {
      searchTerm: '',
      jobTypes: [],
      locations: [],
      salaryRange: [0, 100],
      experience: [],
      dateRange: { from: '', to: '' },
      urgency: 'all',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.jobTypes.length > 0 ||
    filters.locations.length > 0 ||
    filters.salaryRange[0] > 0 ||
    filters.salaryRange[1] < 100 ||
    filters.experience.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.urgency !== 'all';

  const experienceLevels = ['Fresher', 'Entry Level', 'Mid Level', 'Senior'];

  return (
    <div className="external-jobs-filter-container">
      {/* Filter Header */}
      <div className="external-jobs-filter-header">
        <div className="external-jobs-filter-header-content">
          <button 
            className="external-jobs-filter-toggle-main"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Filter size={20} />
            <span>Detailed Filters</span>
            <ChevronDown 
              size={18} 
              className={`external-jobs-filter-chevron ${isOpen ? 'open' : ''}`}
            />
          </button>
          <div className="external-jobs-filter-stats">
            <span className="external-jobs-filter-stat">
              <Briefcase size={14} /> {totalJobs} Opportunities
            </span>
          </div>
        </div>
        {hasActiveFilters && (
          <button 
            className="external-jobs-filter-reset-btn"
            onClick={resetFilters}
            title="Clear all filters"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>

      {/* Filters Content */}
      {isOpen && (
        <div className="external-jobs-filter-content">
          {/* Search Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('search')}
            >
              <Search size={16} />
              <span>Search</span>
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.search ? 'open' : ''}`}
              />
            </button>
            {expandedSections.search && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-search-wrapper">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by company, position, or skills..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="external-jobs-filter-search-input"
                  />
                  {filters.searchTerm && (
                    <button
                      className="external-jobs-filter-search-clear"
                      onClick={() => handleSearchChange('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Job Type Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('type')}
            >
              <Briefcase size={16} />
              <span>Job Type</span>
              {filters.jobTypes.length > 0 && (
                <span className="external-jobs-filter-section-badge">
                  {filters.jobTypes.length}
                </span>
              )}
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.type ? 'open' : ''}`}
              />
            </button>
            {expandedSections.type && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-options">
                  {jobTypes.map((type) => (
                    <label key={type} className="external-jobs-filter-option">
                      <input
                        type="checkbox"
                        checked={filters.jobTypes.includes(type)}
                        onChange={() => toggleJobType(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  {jobTypes.length === 0 && (
                    <p className="external-jobs-filter-empty">No job types available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('location')}
            >
              <MapPin size={16} />
              <span>Location</span>
              {filters.locations.length > 0 && (
                <span className="external-jobs-filter-section-badge">
                  {filters.locations.length}
                </span>
              )}
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.location ? 'open' : ''}`}
              />
            </button>
            {expandedSections.location && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-options">
                  {locations.map((loc) => (
                    <label key={loc._id} className="external-jobs-filter-option">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(loc._id)}
                        onChange={() => toggleLocation(loc._id)}
                      />
                      <span>
                        {loc._id} <span className="external-jobs-filter-count">({loc.count})</span>
                      </span>
                    </label>
                  ))}
                  {locations.length === 0 && (
                    <p className="external-jobs-filter-empty">No locations available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Salary Range Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('salary')}
            >
              <DollarSign size={16} />
              <span>Salary Range</span>
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.salary ? 'open' : ''}`}
              />
            </button>
            {expandedSections.salary && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-range">
                  <div className="external-jobs-filter-range-labels">
                    <span className="external-jobs-filter-range-label">
                      ₹{filters.salaryRange[0]} LPA
                    </span>
                    <span className="external-jobs-filter-range-divider">to</span>
                    <span className="external-jobs-filter-range-label">
                      ₹{filters.salaryRange[1]}+ LPA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.salaryRange[0]}
                    onChange={(e) => handleSalaryChange('min', parseInt(e.target.value), filters.salaryRange[1])}
                    className="external-jobs-filter-range-input external-jobs-filter-range-input-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.salaryRange[1]}
                    onChange={(e) => handleSalaryChange('max', filters.salaryRange[0], parseInt(e.target.value))}
                    className="external-jobs-filter-range-input external-jobs-filter-range-input-max"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Experience Level Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('experience')}
            >
              <TrendingUp size={16} />
              <span>Experience Level</span>
              {filters.experience.length > 0 && (
                <span className="external-jobs-filter-section-badge">
                  {filters.experience.length}
                </span>
              )}
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.experience ? 'open' : ''}`}
              />
            </button>
            {expandedSections.experience && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-options">
                  {experienceLevels.map((exp) => (
                    <label key={exp} className="external-jobs-filter-option">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(exp)}
                        onChange={() => toggleExperience(exp)}
                      />
                      <span>{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Application Deadline Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('date')}
            >
              <Clock size={16} />
              <span>Application Deadline</span>
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.date ? 'open' : ''}`}
              />
            </button>
            {expandedSections.date && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-date-range">
                  <div className="external-jobs-filter-date-input-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => handleDateChange('from', e.target.value)}
                      className="external-jobs-filter-date-input"
                    />
                  </div>
                  <div className="external-jobs-filter-date-input-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => handleDateChange('to', e.target.value)}
                      className="external-jobs-filter-date-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Urgency Filter */}
          <div className="external-jobs-filter-section">
            <button 
              className="external-jobs-filter-section-header"
              onClick={() => toggleSection('urgency')}
            >
              <Zap size={16} />
              <span>Urgency</span>
              <ChevronDown 
                size={16} 
                className={`external-jobs-filter-section-chevron ${expandedSections.urgency ? 'open' : ''}`}
              />
            </button>
            {expandedSections.urgency && (
              <div className="external-jobs-filter-section-body">
                <div className="external-jobs-filter-options">
                  <label className="external-jobs-filter-option">
                    <input
                      type="radio"
                      name="urgency"
                      value="all"
                      checked={filters.urgency === 'all'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                    />
                    <span>All Opportunities</span>
                  </label>
                  <label className="external-jobs-filter-option">
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={filters.urgency === 'urgent'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                    />
                    <span>Closing Soon (Within 7 Days)</span>
                  </label>
                  <label className="external-jobs-filter-option">
                    <input
                      type="radio"
                      name="urgency"
                      value="normal"
                      checked={filters.urgency === 'normal'}
                      onChange={(e) => handleUrgencyChange(e.target.value)}
                    />
                    <span>Normal Timeline</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalJobsFilter;
