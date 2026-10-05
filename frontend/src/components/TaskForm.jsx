import { useState, useEffect } from 'react';
import { useForm } from '../hooks/useForm';
import { useToast } from '../context/ToastContext';
import { PRIORITIES, STATUSES, getValidationErrors, getErrorMessage } from '../utils/helpers';
import UserSelector from './UserSelector';
import TagSelector from './TagSelector';
import { projectService } from '../services/projectService';
import { CalendarDays, AlertCircle } from 'lucide-react';


export default function TaskForm({ initialValues = {}, onSubmit, loading = false, submitLabel = 'Create Task' }) {
  const toast = useToast();
  const { values, errors, setErrors, setValue, handleChange } = useForm({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    project_id: '',
    assigned_to: null,
    tags: [],
    ...initialValues,
  });

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    projectService.getAll({ per_page: 100 }).then(r => setProjects(r.data?.items || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    try {
      const payload = {
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        status: values.status,
        due_date: values.due_date || null,
        project_id: values.project_id || null,
        assigned_to: values.assigned_to || null,
        tags: values.tags.map(t => t.id),
      };
      await onSubmit(payload);
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="Enter task title…"
          required
          className={`w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
        />
        {errors.title && <FieldError msg={errors.title} />}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Add a detailed description…"
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
        />
      </div>

      {/* Priority + Status row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select
            name="priority"
            value={values.priority}
            onChange={handleChange}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date + Project row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <CalendarDays className="w-3.5 h-3.5 inline mr-1" />Due Date
          </label>
          <input
            type="datetime-local"
            name="due_date"
            value={values.due_date ? values.due_date.substring(0, 16) : ''}
            onChange={handleChange}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
          <select
            name="project_id"
            value={values.project_id || ''}
            onChange={handleChange}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white"
          >
            <option value="">No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Assignee</label>
        <UserSelector
          value={values.assigned_to}
          onChange={(id) => setValue('assigned_to', id)}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
        <TagSelector
          selectedTags={values.tags}
          onChange={(tags) => setValue('tags', tags)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {submitLabel}
      </button>
    </form>
  );
}

function FieldError({ msg }) {
  const text = Array.isArray(msg) ? msg[0] : msg;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
      <AlertCircle className="w-3 h-3 shrink-0" />{text}
    </p>
  );
}
