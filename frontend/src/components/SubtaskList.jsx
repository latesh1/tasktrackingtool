import { useState } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare } from 'lucide-react';

export default function SubtaskList({ taskId, subtasks = [], onSubtasksChange, canEdit }) {
  const toast = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const completedCount = subtasks.filter(s => s.status === 'done' || s.is_completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  async function handleAddSubtask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAdding(true);
    try {
      const res = await taskService.createSubtask(taskId, {
        title: newTitle.trim(),
        status: 'todo',
      });
      toast.success('Subtask added');
      setNewTitle('');
      if (onSubtasksChange) {
        onSubtasksChange([...subtasks, res.data]);
      }
    } catch (err) {
      toast.error('Failed to add subtask');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(subtask) {
    const isDone = subtask.status === 'done' || subtask.is_completed;
    const newStatus = isDone ? 'todo' : 'done';

    setTogglingId(subtask.id);
    try {
      await taskService.updateStatus(subtask.id, newStatus);
      if (onSubtasksChange) {
        onSubtasksChange(subtasks.map(s => s.id === subtask.id ? { ...s, status: newStatus, is_completed: !isDone } : s));
      }
    } catch (err) {
      toast.error('Failed to update subtask status');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            Subtasks ({completedCount}/{subtasks.length})
          </span>
          <span className="text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Subtasks Checklist */}
      <div className="space-y-1.5">
        {subtasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No subtasks yet. Break this task into smaller steps below.</p>
        ) : (
          subtasks.map(subtask => {
            const isDone = subtask.status === 'done' || subtask.is_completed;
            const isBusy = togglingId === subtask.id;

            return (
              <div
                key={subtask.id}
                onClick={() => canEdit && handleToggleStatus(subtask)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  canEdit ? 'cursor-pointer hover:bg-slate-50' : ''
                } ${isDone ? 'bg-slate-50/70 border-slate-100' : 'bg-white border-slate-200/80'}`}
              >
                <button
                  type="button"
                  disabled={!canEdit || isBusy}
                  className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <span className={`text-xs sm:text-sm flex-1 leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                  {subtask.title}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Add Subtask Input Form */}
      {canEdit && (
        <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new subtask step…"
            className="flex-1 text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      )}
    </div>
  );
}
