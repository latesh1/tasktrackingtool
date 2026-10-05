/**
 * Utility helpers shared across the application.
 */

export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', hex: '#ef4444' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', hex: '#f97316' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', hex: '#eab308' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', hex: '#22c55e' },
};

export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: '⬜' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: '🔄' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', icon: '🚫' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: '✅' },
};

export const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
export const STATUSES = ['todo', 'in_progress', 'blocked', 'done'];

/**
 * Format a date string into a human-readable relative or absolute date.
 */
export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  if (includeTime) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a relative time string like "2 hours ago"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(dateStr);
}

/**
 * Check if a task is overdue (due_date passed and not done)
 */
export function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false;
  return new Date(task.due_date) < new Date();
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

/**
 * Extract user-friendly error message from Axios error
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey) return errors[firstKey][0];
  }
  if (error?.message) return error.message;
  return 'An unexpected error occurred.';
}

/**
 * Get all validation errors as a flat object from Axios error
 */
export function getValidationErrors(error) {
  return error?.response?.data?.errors || {};
}

/**
 * Truncate text to max length
 */
export function truncate(str, max = 80) {
  if (!str) return '';
  return str.length <= max ? str : str.substring(0, max) + '…';
}
