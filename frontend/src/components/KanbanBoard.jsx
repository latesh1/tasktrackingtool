import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import UserAvatar from './UserAvatar';
import TagBadge from './TagBadge';
import { formatDate, isOverdue, truncate } from '../utils/helpers';
import {
  CalendarDays, MessageSquare, Paperclip, Plus, ArrowRight,
  ArrowLeft, CheckCircle2, AlertOctagon, Clock, CircleDashed
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: CircleDashed, color: 'border-amber-200 bg-amber-50/40 text-amber-800' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'border-indigo-200 bg-indigo-50/40 text-indigo-800' },
  { id: 'blocked', label: 'Blocked', icon: AlertOctagon, color: 'border-rose-200 bg-rose-50/40 text-rose-800' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800' },
];

export default function KanbanBoard({ tasks = [], onStatusChange, canEdit, onNewTask }) {
  const navigate = useNavigate();
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('text/plain')) || draggedTaskId;
    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="bg-slate-100/70 border border-slate-200/70 rounded-3xl p-3.5 flex flex-col min-h-[580px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">{col.label}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {colTasks.length}
                </span>
              </div>

              {canEdit && col.id === 'todo' && onNewTask && (
                <button
                  onClick={onNewTask}
                  className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Add task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tasks Container */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-medium">
                  Drop tasks here
                </div>
              ) : (
                colTasks.map(task => {
                  const overdue = isOverdue(task);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                        overdue ? 'border-rose-200' : 'border-slate-200/80 hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <PriorityBadge priority={task.priority} size="xs" />
                        {task.project && (
                          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[120px]">
                            {task.project.name}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`text-sm font-semibold mb-1.5 leading-snug line-clamp-2 ${overdue ? 'text-rose-700' : 'text-slate-800'} group-hover:text-indigo-600 transition-colors`}>
                        {task.title}
                      </h4>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {truncate(task.description, 80)}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.slice(0, 2).map(tag => (
                            <TagBadge key={tag.id} tag={tag} size="xs" />
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">+{task.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                        {/* Due Date & Counters */}
                        <div className="flex items-center gap-2 text-slate-400">
                          {task.due_date && (
                            <span className={`flex items-center gap-1 font-medium ${overdue ? 'text-rose-600' : ''}`}>
                              <CalendarDays className="w-3 h-3" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                          {task.comments_count > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" />{task.comments_count}
                            </span>
                          )}
                          {task.attachments_count > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3" />{task.attachments_count}
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <UserAvatar user={task.assignee} size="xs" />
                        ) : (
                          <span className="text-[11px] text-slate-300">Unassigned</span>
                        )}
                      </div>

                      {/* Quick Move Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[11px]" onClick={e => e.stopPropagation()}>
                        <span className="text-slate-400">Move to:</span>
                        <div className="flex gap-1">
                          {COLUMNS.filter(c => c.id !== col.id).map(c => (
                            <button
                              key={c.id}
                              onClick={() => onStatusChange?.(task.id, c.id)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors"
                              title={`Move to ${c.label}`}
                            >
                              {c.label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
