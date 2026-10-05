import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import {
  FolderKanban, Plus, Pencil, Trash2, ArrowUpRight,
  CheckSquare, Users, Clock, FolderPlus
} from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  on_hold: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

function ProjectCard({ project, onEdit, onDelete, canEdit, onClick }) {
  const statusClass = STATUS_COLORS[project.status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const totalTasks = project.tasks_count || 0;
  const completedTasks = project.completed_tasks_count || 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
            {project.name?.charAt(0).toUpperCase()}
          </div>
          {canEdit && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEdit(project)}
                className="p-2 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Edit Project"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors">
          {project.name}
        </h3>
        {project.description ? (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {project.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-4">No project description</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${statusClass}`}>
            {project.status?.replace('_', ' ')}
          </span>
          {project.due_date && (
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> {formatDate(project.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Task velocity progress */}
      <div className="mt-2 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            {completedTasks}/{totalTasks} tasks completed
          </span>
          <span className="font-bold text-indigo-600">{progressPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ProjectFormModal({ initialValues = {}, onSubmit, loading, onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    due_date: '',
    ...initialValues,
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, due_date: form.due_date || null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Project Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
          placeholder="e.g., Mobile App Launch Q4"
          className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Brief summary of project goals…"
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full text-sm border border-slate-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white"
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Target Due Date
          </label>
          <input
            type="date"
            value={form.due_date ? form.due_date.substring(0, 10) : ''}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="w-full text-sm border border-slate-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Saving…' : 'Save Project'}
      </button>
    </form>
  );
}

export default function ProjectsPage() {
  const { isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const canEdit = isManager || isAdmin;

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectService.getAll({
        page,
        per_page: 12,
        search: search || undefined,
      });
      setProjects(res.data?.items || []);
      setPagination(res.data?.pagination || null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleCreate(payload) {
    setSaving(true);
    try {
      await projectService.create(payload);
      toast.success('Project created successfully');
      setCreateOpen(false);
      fetchProjects();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(payload) {
    setSaving(true);
    try {
      await projectService.update(editProject.id, payload);
      toast.success('Project updated');
      setEditProject(null);
      fetchProjects();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await projectService.delete(deleteId);
      toast.success('Project deleted');
      setDeleteId(null);
      fetchProjects();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search projects by name…"
          className="flex-1"
        />

        {canEdit && (
          <button
            id="create-project-btn"
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" text="Loading projects…" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project workspace to organize and track tasks."
          action={canEdit && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                canEdit={canEdit}
                onClick={() => navigate(`/tasks?project_id=${project.id}`)}
                onEdit={setEditProject}
                onDelete={setDeleteId}
              />
            ))}
          </div>

          {pagination && !loading && (
            <div className="mt-6">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Project" size="md">
        <ProjectFormModal onSubmit={handleCreate} loading={saving} onClose={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="md">
        {editProject && (
          <ProjectFormModal
            initialValues={editProject}
            onSubmit={handleEdit}
            loading={saving}
            onClose={() => setEditProject(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message="Are you sure you want to permanently delete this project? Associated tasks will be affected."
        confirmLabel="Delete Project"
      />
    </div>
  );
}
