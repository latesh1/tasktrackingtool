import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/helpers';
import TaskCard from '../components/TaskCard';
import TaskTable from '../components/TaskTable';
import KanbanBoard from '../components/KanbanBoard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import TaskForm from '../components/TaskForm';
import {
  CheckSquare, Plus, LayoutGrid, List, Kanban,
  SlidersHorizontal, X, CheckCircle, Trash2, Clock
} from 'lucide-react';

const VIEW_KEY = 'taskflow_view';

export default function TasksPage() {
  const { user, isManager, isAdmin } = useAuth();
  const canEdit = isManager || isAdmin;
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || 'grid');

  // Search & Filter state synced with searchParams
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(() => ({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    project_id: searchParams.get('project_id') || '',
    assigned_to: searchParams.get('assigned_to') || '',
    overdue: searchParams.get('overdue') === '1',
  }));
  const [page, setPage] = useState(1);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Bulk Selection
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Supporting filter options
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    projectService.getAll({ per_page: 100 }).then(r => setProjects(r.data?.items || [])).catch(() => {});
    userService.getAll().then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  // Update filters if searchParams change externally
  useEffect(() => {
    const proj = searchParams.get('project_id');
    const stat = searchParams.get('status');
    const assign = searchParams.get('assigned_to');
    const od = searchParams.get('overdue') === '1';

    if (proj || stat || assign || od) {
      setFilters(prev => ({
        ...prev,
        project_id: proj || prev.project_id,
        status: stat || prev.status,
        assigned_to: assign || prev.assigned_to,
        overdue: od || prev.overdue,
      }));
    }
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: view === 'kanban' ? 1 : page,
        per_page: view === 'kanban' ? 100 : view === 'grid' ? 12 : 20,
        search: search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        project_id: filters.project_id || undefined,
        assigned_to: filters.assigned_to || undefined,
        overdue: filters.overdue ? true : undefined,
      };
      const res = await taskService.getAll(params);
      setTasks(res.data?.items || []);
      setPagination(res.data?.pagination || null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, view, search, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  function toggleView(v) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  async function handleCreate(payload) {
    setSaving(true);
    try {
      await taskService.create(payload);
      toast.success('Task created successfully');
      setCreateOpen(false);
      fetchTasks();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(payload) {
    setSaving(true);
    try {
      await taskService.update(editTask.id, payload);
      toast.success('Task updated successfully');
      setEditTask(null);
      fetchTasks();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await taskService.delete(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      fetchTasks();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      await taskService.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  // Quick Filter shortcuts
  function setQuickFilter(type) {
    setPage(1);
    if (type === 'all') {
      setFilters({ status: '', priority: '', project_id: '', assigned_to: '', overdue: false });
      setSearchParams({});
    } else if (type === 'my_tasks') {
      setFilters(f => ({ ...f, assigned_to: String(user?.id || ''), overdue: false }));
    } else if (type === 'overdue') {
      setFilters(f => ({ ...f, overdue: true }));
    } else if (type === 'in_progress') {
      setFilters(f => ({ ...f, status: 'in_progress', overdue: false }));
    } else if (type === 'high_priority') {
      setFilters(f => ({ ...f, priority: 'high', overdue: false }));
    }
  }

  // Bulk Operations
  async function handleBulkStatus(status) {
    if (selectedTaskIds.length === 0) return;
    setBulkLoading(true);
    try {
      await taskService.bulkAction(selectedTaskIds, 'update_status', { status });
      toast.success(`Updated ${selectedTaskIds.length} tasks to ${status}`);
      setSelectedTaskIds([]);
      fetchTasks();
    } catch (e) {
      toast.error('Failed to perform bulk update');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedTaskIds.length === 0) return;
    setBulkLoading(true);
    try {
      await taskService.bulkAction(selectedTaskIds, 'delete');
      toast.success(`Deleted ${selectedTaskIds.length} tasks`);
      setSelectedTaskIds([]);
      setBulkDeleteOpen(false);
      fetchTasks();
    } catch (e) {
      toast.error('Failed to delete selected tasks');
    } finally {
      setBulkLoading(false);
    }
  }

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k === 'overdue' ? v : Boolean(v)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Filter & Actions Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search tasks by title or keywords…"
          />
        </div>

        {/* View & Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-2xl border transition-all ${
              activeFilterCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle: Grid | List | Kanban */}
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => toggleView('grid')}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleView('list')}
              className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleView('kanban')}
              className={`p-2 rounded-xl transition-all ${view === 'kanban' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          {/* Create Task Button */}
          {canEdit && (
            <button
              id="create-task-btn"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-300 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <button
          onClick={() => setQuickFilter('all')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
            activeFilterCount === 0 && !search ? 'bg-slate-800 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setQuickFilter('my_tasks')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
            filters.assigned_to === String(user?.id) ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          My Tasks
        </button>
        <button
          onClick={() => setQuickFilter('in_progress')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
            filters.status === 'in_progress' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setQuickFilter('high_priority')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
            filters.priority === 'high' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setQuickFilter('overdue')}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
            filters.overdue ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Overdue
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={() => setQuickFilter('all')}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 ml-auto shrink-0"
          >
            <X className="w-3.5 h-3.5" /> Clear active filters
          </button>
        )}
      </div>

      {/* Main Content View (Grid / List / Kanban) */}
      <div>
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" text="Loading tasks…" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchTasks} />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={activeFilterCount > 0 || search ? 'Try adjusting your search query or filters.' : 'Create your first task to get started!'}
            action={canEdit && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> New Task
              </button>
            )}
          />
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            canEdit={canEdit}
            onNewTask={() => setCreateOpen(true)}
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                canEdit={canEdit}
                onDelete={(id) => setDeleteId(id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            canEdit={canEdit}
            onDelete={(id) => setDeleteId(id)}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Pagination (for Grid and List views) */}
        {view !== 'kanban' && pagination && !loading && tasks.length > 0 && (
          <div className="mt-6">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Filter Modal / Drawer */}
      <Modal
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filter & Refine Tasks"
        size="md"
      >
        <FilterPanel
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
            setShowFilterDrawer(false);
          }}
          projects={projects}
          users={users}
        />
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleCreate} loading={saving} submitLabel="Create Task" />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && (
          <TaskForm
            initialValues={{
              ...editTask,
              tags: editTask.tags || [],
            }}
            onSubmit={handleEdit}
            loading={saving}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Single Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={bulkLoading}
        title="Delete Multiple Tasks"
        message={`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`}
        confirmLabel="Delete Tasks"
      />
    </div>
  );
}
