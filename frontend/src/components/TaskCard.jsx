import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';
import UserAvatar from './UserAvatar';
import TagBadge from './TagBadge';
import { formatDate, isOverdue, truncate } from '../utils/helpers';
import { MessageSquare, Paperclip, CalendarDays, MoreVertical, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function TaskCard({ task, onDelete, onStatusChange, canEdit }) {
  const navigate = useNavigate();
  const overdue = isOverdue(task);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-all cursor-pointer group relative ${
        overdue ? 'border-red-200 hover:border-red-300' : 'border-slate-100 hover:border-indigo-200'
      }`}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} size="xs" />
          <TaskStatusBadge status={task.status} size="xs" />
        </div>

        {canEdit && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              aria-label="Task actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden w-44">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate(`/tasks/${task.id}?edit=1`); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit task
                </button>
                {task.status !== 'done' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onStatusChange?.(task.id, 'done'); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark complete
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(task.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-sm leading-snug mb-2 ${overdue ? 'text-red-700' : 'text-slate-800'}`}>
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
          {truncate(task.description, 100)}
        </p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(tag => <TagBadge key={tag.id} tag={tag} />)}
          {task.tags.length > 3 && (
            <span className="text-xs text-slate-400 px-1.5 py-0.5">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3">
          {/* Due date */}
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              <CalendarDays className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
          {/* Comment count */}
          {task.comments_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MessageSquare className="w-3 h-3" />{task.comments_count}
            </span>
          )}
          {/* Attachment count */}
          {task.attachments_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip className="w-3 h-3" />{task.attachments_count}
            </span>
          )}
        </div>
        {/* Assignee */}
        {task.assignee && <UserAvatar user={task.assignee} size="xs" />}
      </div>
    </div>
  );
}
