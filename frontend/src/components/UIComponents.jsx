// ============================================================================
// UI COMPONENT UTILITIES
// ============================================================================
// Reusable React components for consistent UI patterns
// Import and use these across your pages

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionVariant = 'primary'
}) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" size={64} />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && (
        <div className="empty-state-action">
          <button 
            className={`btn btn-${actionVariant}`}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

export function SkeletonText({ lines = 2, width = '100%' }) {
  return (
    <>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? '80%' : width, marginBottom: '0.5rem' }}
        />
      ))}
    </>
  );
}

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          <SkeletonText lines={2} />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton skeleton-text" style={{ width: '80px', height: '32px' }} />
            <div className="skeleton skeleton-text" style={{ width: '100px', height: '32px' }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-text" style={{ width: '80%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowI) => (
            <tr key={rowI}>
              {[...Array(cols)].map((_, colI) => (
                <td key={colI}>
                  <div className="skeleton skeleton-text" style={{ width: '90%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

export function LoadingSpinner({ size = 'default', label = 'Loading...' }) {
  const sizeClass = {
    sm: 'spinner-sm',
    default: 'spinner',
    lg: 'spinner-lg'
  }[size];

  return (
    <div className="inline-loader">
      <span className={`spinner ${sizeClass}`} />
      {label && <span>{label}</span>}
    </div>
  );
}

// ============================================================================
// ALERT COMPONENTS
// ============================================================================

export function Alert({ 
  type = 'info', 
  message, 
  onClose,
  icon: Icon
}) {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const IconComponent = Icon || iconMap[type];

  return (
    <div className={`alert alert-${type}`}>
      {IconComponent && <IconComponent size={20} />}
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function AlertContainer({ alerts, onRemove }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => onRemove(alert.id)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// VALIDATION ERROR COMPONENT
// ============================================================================

export function FormError({ message, show = false }) {
  if (!show || !message) return null;
  
  return (
    <span className="form-error show">
      {message}
    </span>
  );
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  placeholder,
  required = false
}) {
  return (
    <div className={`form-group ${error ? 'field-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="form-label-required"></span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? 'error' : ''}
      />
      {error && <FormError message={error} show={true} />}
      {helperText && !error && <span className="form-helper">{helperText}</span>}
    </div>
  );
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export function Badge({ 
  label, 
  variant = 'neutral',
  icon: Icon
}) {
  return (
    <span className={`badge badge-${variant}`}>
      {Icon && <Icon size={14} />}
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusMap = {
    placed: { variant: 'success', label: 'Placed' },
    active: { variant: 'info', label: 'Active' },
    inactive: { variant: 'neutral', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    rejected: { variant: 'error', label: 'Rejected' }
  };

  const { variant, label } = statusMap[status] || { variant: 'neutral', label: status };
  
  return <Badge label={label} variant={variant} />;
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

export function Pagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  // const pages = []; // Variable removed - not used in component
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  return (
    <div className="pagination">
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}

// ============================================================================
// TABS COMPONENT
// ============================================================================

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}) {
  return (
    <>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span style={{ marginRight: '0.5rem', display: 'inline-flex' }}>
              {tab.icon}
            </span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={`content-${tab.id}`}
          className={`tab-content ${activeTab === tab.id ? '' : 'hidden'}`}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  actions = []
  // size parameter removed - not used in modal
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {actions.length > 0 && (
          <div className="modal-footer">
            {actions.map((action, i) => (
              <button
                key={i}
                className={`btn btn-${action.variant || 'secondary'}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  variant = 'primary',
  showPercentage = true
}) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="progress-container">
        <div 
          className={`progress-bar${variant !== 'primary' ? ` ${variant}` : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </>
  );
}

// ============================================================================
// CARD LAYOUT
// ============================================================================

export function Card({
  title,
  subtitle,
  children,
  actions,
  variant = 'default'
}) {
  return (
    <div className={`card${variant === 'clickable' ? ' card-clickable' : ''}`}>
      {title && (
        <div className="card-header">
          <div>
            <h3 className="text-lg font-bold text-primary">{title}</h3>
            {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

      {actions && (
        <div className="card-footer">
          {actions.map((action, i) => (
            <button
              key={i}
              className={`btn btn-${action.variant || 'secondary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

export function StatCard({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">
        {Icon && (
          <span style={{ marginRight: '0.5rem', display: 'inline-flex' }}>
            <Icon size={16} />
          </span>
        )}
        {label}
      </div>
      <div className="stat-card-value">{value}</div>
      {change && (
        <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}
