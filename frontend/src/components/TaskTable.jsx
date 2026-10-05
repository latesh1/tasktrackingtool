import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';
import UserAvatar from './UserAvatar';
import TagBadge from './TagBadge';
import { formatDate, isOverdue } from '../utils/helpers';
import { Pencil, Trash2, CheckCircle, CalendarDays, MessageSquare, Paperclip } from 'lucide-react';

export default function TaskTable({ tasks = [], onDelete, onStatusChange, canEdit }) {
  const navigate = useNavigate();

  if (tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5 min-w-[280px]">
                Task Details
              </th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                Priority
              </th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                Status
              </th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                Assignee
              </th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                Due Date
              </th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                Tags
              </th>
              {canEdit && (
                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map(task => {
              const overdue = isOverdue(task);

              return (
                <tr
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                    overdue ? 'bg-rose-50/25' : ''
                  }`}
                >
                  {/* Task details */}
                  <td className="px-5 py-3.5">
                    <p className={`font-semibold leading-snug group-hover:text-indigo-600 transition-colors ${
                      overdue ? 'text-rose-700' : 'text-slate-800'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {task.project && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {task.project.name}
                        </span>
                      )}
                      {task.comments_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" />{task.comments_count}
                        </span>
                      )}
                      {task.attachments_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Paperclip className="w-3.5 h-3.5" />{task.attachments_count}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} size="xs" />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <TaskStatusBadge status={task.status} size="xs" />
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={task.assignee} size="xs" />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {task.due_date ? (
                      <span className={`flex items-center gap-1 text-xs font-medium ${
                        overdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}>
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(task.due_date)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {task.tags?.slice(0, 2).map(tag => (
                        <TagBadge key={tag.id} tag={tag} size="xs" />
                      ))}
                      {task.tags?.length > 2 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">+{task.tags.length - 2}</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  {canEdit && (
                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== 'done' && (
                          <button
                            onClick={() => onStatusChange?.(task.id, 'done')}
                            className="p-1.5 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="Mark as Done"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/tasks/${task.id}?edit=1`)}
                          className="p-1.5 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit Task"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete?.(task.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
