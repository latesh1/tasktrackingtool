import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { attachmentService } from '../services/attachmentService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  formatDate, isOverdue, getErrorMessage,
  PRIORITY_CONFIG, STATUS_CONFIG, PRIORITIES, STATUSES
} from '../utils/helpers';
import PriorityBadge from '../components/PriorityBadge';
import TaskStatusBadge from '../components/TaskStatusBadge';
import UserAvatar from '../components/UserAvatar';
import TagBadge from '../components/TagBadge';
import CommentSection from '../components/CommentSection';
import ActivityTimeline from '../components/ActivityTimeline';
import SubtaskList from '../components/SubtaskList';
import FileUploader, { AttachmentList } from '../components/FileUploader';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ArrowLeft, Pencil, Trash2, CalendarDays, Clock,
  MessageSquare, Paperclip, Activity, ChevronDown,
  CheckCircle2, Folder, UserCheck, Shield
} from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isManager, isAdmin } = useAuth();
  const toast = useToast();
  const canEdit = isManager || isAdmin;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'attachments' | 'activity'

  // Modals state
  const [editOpen, setEditOpen] = useState(searchParams.get('edit') === '1');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Status & Priority inline dropdowns
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadTask();
    userService.getAll().then(r => setAllUsers(r.data || [])).catch(() => {});
  }, [id]);

  async function loadTask() {
    setLoading(true);
    setError('');
    try {
      const res = await taskService.getById(id);
      setTask(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(payload) {
    setSaving(true);
    try {
      const res = await taskService.update(id, payload);
      setTask(res.data);
      setEditOpen(false);
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await taskService.delete(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      const res = await taskService.updateStatus(id, newStatus);
      setTask(prev => ({ ...prev, status: newStatus }));
      setStatusMenuOpen(false);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function handlePriorityChange(newPriority) {
    try {
      await taskService.update(id, { priority: newPriority });
      setTask(prev => ({ ...prev, priority: newPriority }));
      setPriorityMenuOpen(false);
      toast.success(`Priority set to ${newPriority}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function handleAssigneeChange(userId) {
    try {
      await taskService.assign(id, userId);
      const assignedUser = allUsers.find(u => u.id === Number(userId));
      setTask(prev => ({ ...prev, assignee: assignedUser, assigned_to: userId }));
      setAssigneeMenuOpen(false);
      toast.success('Task reassigned successfully');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }

  async function handleFileUpload(file) {
    setUploadingFile(true);
    try {
      await attachmentService.upload(id, file);
      toast.success('File uploaded successfully');
      loadTask();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploadingFile(false);
    }
  }

  async function confirmAttachmentDelete() {
    if (!deleteAttachmentId) return;
    try {
      await attachmentService.delete(deleteAttachmentId);
      setTask(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== deleteAttachmentId),
        attachments_count: Math.max(0, (prev.attachments_count || 1) - 1),
      }));
      toast.success('Attachment deleted');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleteAttachmentId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" text="Loading task details…" />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadTask} />;
  if (!task) return null;

  const overdue = isOverdue(task);
  const isOwner = user?.id === task.creator_id || user?.id === task.assigned_to;
  const canModify = canEdit || isOwner;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </button>

        {canModify && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Task
            </button>
            {canEdit && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-white border border-rose-200 text-rose-600 rounded-2xl hover:bg-rose-50 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main Task Details & Collaboration) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className={`bg-white rounded-3xl border p-6 shadow-xs ${overdue ? 'border-rose-200' : 'border-slate-100'}`}>
            {/* Badges Bar */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <PriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
              {overdue && (
                <span className="text-xs bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                  ⚠ Overdue
                </span>
              )}
              {task.project && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {task.project.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 leading-snug ${overdue ? 'text-rose-800' : 'text-slate-900'}`}>
              {task.title}
            </h1>

            {/* Description */}
            <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description ? (
                task.description
              ) : (
                <p className="text-slate-400 italic">No description provided for this task.</p>
              )}
            </div>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-slate-100">
                {task.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <SubtaskList
              taskId={task.id}
              subtasks={task.subtasks || []}
              canEdit={canModify}
              onSubtasksChange={(updated) => setTask(prev => ({ ...prev, subtasks: updated }))}
            />
          </div>

          {/* Collaboration Tabs Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-100 p-2 gap-1 bg-slate-50/60">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'comments' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Comments
                {task.comments?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {task.comments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('attachments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'attachments' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Attachments
                {task.attachments?.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {task.attachments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'activity' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                Activity Timeline
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === 'comments' && (
                <CommentSection taskId={task.id} initialComments={task.comments || []} />
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-5">
                  {canModify && (
                    <FileUploader onUpload={handleFileUpload} loading={uploadingFile} />
                  )}
                  {task.attachments?.length > 0 ? (
                    <AttachmentList
                      attachments={task.attachments}
                      onDelete={(attId) => setDeleteAttachmentId(attId)}
                      canDelete={canModify}
                    />
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-6">No attachments uploaded yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <ActivityTimeline activities={task.activities || []} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Metadata, Quick Status/Assign Controls) */}
        <div className="space-y-5">
          {/* Quick Actions & Status Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">
              Task Details
            </h2>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => canModify && setStatusMenuOpen(!statusMenuOpen)}
                  disabled={!canModify}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors text-sm font-semibold bg-white"
                >
                  <TaskStatusBadge status={task.status} />
                  {canModify && <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {statusMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setStatusMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1 space-y-0.5">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 ${
                            task.status === s ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Priority
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => canModify && setPriorityMenuOpen(!priorityMenuOpen)}
                  disabled={!canModify}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors text-sm font-semibold bg-white"
                >
                  <PriorityBadge priority={task.priority} />
                  {canModify && <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {priorityMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setPriorityMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1 space-y-0.5">
                      {PRIORITIES.map(p => (
                        <button
                          key={p}
                          onClick={() => handlePriorityChange(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 ${
                            task.priority === p ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Assignee
              </label>
              {canEdit ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAssigneeMenuOpen(!assigneeMenuOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors text-sm bg-white"
                  >
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={task.assignee} size="xs" />
                        <span className="font-semibold text-slate-800">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {assigneeMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setAssigneeMenuOpen(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1 max-h-56 overflow-y-auto space-y-0.5">
                        <button
                          onClick={() => handleAssigneeChange('')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-500"
                        >
                          Unassigned
                        </button>
                        {allUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleAssigneeChange(u.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-2 ${
                              task.assigned_to === u.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                            }`}
                          >
                            <UserAvatar user={u} size="xs" />
                            {u.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2">
                  {task.assignee ? (
                    <>
                      <UserAvatar user={task.assignee} size="xs" />
                      <span className="text-sm font-semibold text-slate-800">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Due Date
              </label>
              <div className={`flex items-center gap-2 p-2.5 rounded-2xl border text-sm font-medium ${
                overdue ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                {task.due_date ? formatDate(task.due_date, false) : 'No due date set'}
              </div>
            </div>

            {/* Created By & Timestamps */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Created by:</span>
                <span className="font-semibold text-slate-700">{task.creator?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-semibold text-slate-700">{formatDate(task.created_at, true)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-semibold text-slate-700">{formatDate(task.updated_at, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Task" size="lg">
        <TaskForm
          initialValues={{ ...task, tags: task.tags || [] }}
          onSubmit={handleEdit}
          loading={saving}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete Task Confirm Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
      />

      {/* Delete Attachment Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteAttachmentId)}
        onClose={() => setDeleteAttachmentId(null)}
        onConfirm={confirmAttachmentDelete}
        title="Delete Attachment"
        message="Are you sure you want to remove this file attachment?"
        confirmLabel="Delete File"
      />
    </div>
  );
}
