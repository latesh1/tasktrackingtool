import { PRIORITIES, STATUSES, STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/helpers';
import { X, SlidersHorizontal } from 'lucide-react';

export default function FilterPanel({ filters, onChange, projects = [], users = [] }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({ status: '', priority: '', project_id: '', assigned_to: '', search: '' });
  }

  const hasFilters = filters.status || filters.priority || filters.project_id || filters.assigned_to;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Status */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const active = filters.status === s;
            return (
              <button
                key={s}
                onClick={() => update('status', active ? '' : s)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  active ? cfg.color + ' ring-1 ring-offset-1 ring-current' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Priority</p>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITIES.map(p => {
            const cfg = PRIORITY_CONFIG[p];
            const active = filters.priority === p;
            return (
              <button
                key={p}
                onClick={() => update('priority', active ? '' : p)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  active ? cfg.color + ' ring-1 ring-offset-1 ring-current' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project */}
      {projects.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Project</p>
          <select
            value={filters.project_id || ''}
            onChange={e => update('project_id', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <option value="">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Assignee */}
      {users.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Assignee</p>
          <select
            value={filters.assigned_to || ''}
            onChange={e => update('assigned_to', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <option value="">Everyone</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
