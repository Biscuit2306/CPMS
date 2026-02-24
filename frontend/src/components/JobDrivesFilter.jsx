import React, { useState, useCallback } from 'react';
import {
  Search,
  X,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  Filter,
} from 'lucide-react';
import '../styles/components-css/jobdrivesfilter.css';

const JobDrivesFilter = ({ 
  onFilterChange, 
  totalDrives = 0, 
  appliedCount = 0 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    driveType: 'all', // all, on-campus, off-campus
    salaryRange: [0, 100],
    minCGPA: 0,
    dateRange: { from: '', to: '' },
    status: 'all', // all, active, scheduled, ended, applied
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    type: true,
    salary: true,
    cgpa: false,
    date: false,
    status: false,
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

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
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

  const resetFilters = useCallback(() => {
    const emptyFilters = {
      searchTerm: '',
      driveType: 'all',
      salaryRange: [0, 100],
      minCGPA: 0,
      dateRange: { from: '', to: '' },
      status: 'all',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.driveType !== 'all' ||
    filters.salaryRange[0] > 0 ||
    filters.salaryRange[1] < 100 ||
    filters.minCGPA > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.status !== 'all';

  return (
    <div className="job-drives-filter-container">
      {/* Filter Header */}
      <div className="job-drives-filter-header">
        <div className="job-drives-filter-header-content">
          <button 
            className="job-drives-filter-toggle-main"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Filter size={20} />
            <span>Advanced Filters</span>
            <ChevronDown 
              size={18} 
              className={`job-drives-filter-chevron ${isOpen ? 'open' : ''}`}
            />
          </button>
          <div className="job-drives-filter-stats">
            <span className="job-drives-filter-stat">
              <Briefcase size={14} /> {totalDrives} Drives
            </span>
            <span className="job-drives-filter-stat">
              <TrendingUp size={14} /> {appliedCount} Applied
            </span>
          </div>
        </div>
        {hasActiveFilters && (
          <button 
            className="job-drives-filter-reset-btn"
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
        <div className="job-drives-filter-content">
          {/* Search Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('search')}
            >
              <Search size={16} />
              <span>Search</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.search ? 'open' : ''}`}
              />
            </button>
            {expandedSections.search && (
              <div className="job-drives-filter-section-body">
                <div className="job-drives-filter-search-wrapper">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by company or position..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="job-drives-filter-search-input"
                  />
                  {filters.searchTerm && (
                    <button
                      className="job-drives-filter-search-clear"
                      onClick={() => handleSearchChange('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drive Type Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('type')}
            >
              <Briefcase size={16} />
              <span>Drive Type</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.type ? 'open' : ''}`}
              />
            </button>
            {expandedSections.type && (
              <div className="job-drives-filter-section-body">
                <div className="job-drives-filter-options">
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="drive-type"
                      value="all"
                      checked={filters.driveType === 'all'}
                      onChange={(e) => handleFilterChange('driveType', e.target.value)}
                    />
                    <span>All Drives</span>
                  </label>
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="drive-type"
                      value="on-campus"
                      checked={filters.driveType === 'on-campus'}
                      onChange={(e) => handleFilterChange('driveType', e.target.value)}
                    />
                    <span>On Campus</span>
                  </label>
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="drive-type"
                      value="off-campus"
                      checked={filters.driveType === 'off-campus'}
                      onChange={(e) => handleFilterChange('driveType', e.target.value)}
                    />
                    <span>Off Campus</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('status')}
            >
              <TrendingUp size={16} />
              <span>Status</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.status ? 'open' : ''}`}
              />
            </button>
            {expandedSections.status && (
              <div className="job-drives-filter-section-body">
                <div className="job-drives-filter-options">
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={filters.status === 'all'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <span>All Drives</span>
                  </label>
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={filters.status === 'active'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <span>Currently Hiring</span>
                  </label>
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={filters.status === 'scheduled'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <span>Upcoming</span>
                  </label>
                  <label className="job-drives-filter-option">
                    <input
                      type="radio"
                      name="status"
                      value="applied"
                      checked={filters.status === 'applied'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <span>My Applications</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Salary Range Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('salary')}
            >
              <DollarSign size={16} />
              <span>Salary Range</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.salary ? 'open' : ''}`}
              />
            </button>
            {expandedSections.salary && (
              <div className="job-drives-filter-section-body">
                <div className="job-drives-filter-range">
                  <div className="job-drives-filter-range-labels">
                    <span className="job-drives-filter-range-label">
                      ₹{filters.salaryRange[0]} LPA
                    </span>
                    <span className="job-drives-filter-range-divider">to</span>
                    <span className="job-drives-filter-range-label">
                      ₹{filters.salaryRange[1]}+ LPA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.salaryRange[0]}
                    onChange={(e) => handleSalaryChange('min', parseInt(e.target.value), filters.salaryRange[1])}
                    className="job-drives-filter-range-input job-drives-filter-range-input-min"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.salaryRange[1]}
                    onChange={(e) => handleSalaryChange('max', filters.salaryRange[0], parseInt(e.target.value))}
                    className="job-drives-filter-range-input job-drives-filter-range-input-max"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CGPA Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('cgpa')}
            >
              <TrendingUp size={16} />
              <span>Minimum CGPA</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.cgpa ? 'open' : ''}`}
              />
            </button>
            {expandedSections.cgpa && (
              <div className="job-drives-filter-section-body">
                <select
                  value={filters.minCGPA}
                  onChange={(e) => handleFilterChange('minCGPA', parseFloat(e.target.value))}
                  className="job-drives-filter-select"
                >
                  <option value={0}>All (0.0+)</option>
                  <option value={5}>5.0+</option>
                  <option value={5.5}>5.5+</option>
                  <option value={6}>6.0+</option>
                  <option value={6.5}>6.5+</option>
                  <option value={7}>7.0+</option>
                  <option value={7.5}>7.5+</option>
                  <option value={8}>8.0+</option>
                  <option value={8.5}>8.5+</option>
                  <option value={9}>9.0+</option>
                </select>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="job-drives-filter-section">
            <button 
              className="job-drives-filter-section-header"
              onClick={() => toggleSection('date')}
            >
              <Calendar size={16} />
              <span>Drive Date Range</span>
              <ChevronDown 
                size={16} 
                className={`job-drives-filter-section-chevron ${expandedSections.date ? 'open' : ''}`}
              />
            </button>
            {expandedSections.date && (
              <div className="job-drives-filter-section-body">
                <div className="job-drives-filter-date-range">
                  <div className="job-drives-filter-date-input-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => handleDateChange('from', e.target.value)}
                      className="job-drives-filter-date-input"
                    />
                  </div>
                  <div className="job-drives-filter-date-input-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => handleDateChange('to', e.target.value)}
                      className="job-drives-filter-date-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDrivesFilter;
