import { timeAgo } from '../utils/helpers';
import UserAvatar from './UserAvatar';
import {
  PlusCircle, Tag, CheckCircle, RotateCcw, User,
  Pencil, MessageSquare, Paperclip, Trash2, Activity
} from 'lucide-react';

const ACTION_CONFIG = {
  created: { label: 'created this task', icon: PlusCircle, color: 'text-indigo-500 bg-indigo-50' },
  assigned: { label: 'assigned this task', icon: User, color: 'text-blue-500 bg-blue-50' },
  reassigned: { label: 'reassigned this task', icon: User, color: 'text-blue-500 bg-blue-50' },
  status_changed: { label: 'changed status', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
  priority_changed: { label: 'changed priority', icon: Activity, color: 'text-orange-500 bg-orange-50' },
  title_changed: { label: 'updated title', icon: Pencil, color: 'text-slate-500 bg-slate-100' },
  description_changed: { label: 'updated description', icon: Pencil, color: 'text-slate-500 bg-slate-100' },
  due_date_changed: { label: 'changed due date', icon: RotateCcw, color: 'text-purple-500 bg-purple-50' },
  comment_added: { label: 'added a comment', icon: MessageSquare, color: 'text-teal-500 bg-teal-50' },
  comment_deleted: { label: 'deleted a comment', icon: MessageSquare, color: 'text-red-500 bg-red-50' },
  attachment_added: { label: 'uploaded an attachment', icon: Paperclip, color: 'text-cyan-500 bg-cyan-50' },
  attachment_removed: { label: 'removed an attachment', icon: Trash2, color: 'text-red-500 bg-red-50' },
  subtask_created: { label: 'created a subtask', icon: PlusCircle, color: 'text-violet-500 bg-violet-50' },
  tag_added: { label: 'added a tag', icon: Tag, color: 'text-pink-500 bg-pink-50' },
  tag_removed: { label: 'removed a tag', icon: Tag, color: 'text-slate-500 bg-slate-100' },
};

function ActivityItem({ activity }) {
  const config = ACTION_CONFIG[activity.action] || {
    label: activity.action.replace(/_/g, ' '),
    icon: Activity,
    color: 'text-slate-500 bg-slate-100',
  };

  const Icon = config.icon;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-1 mb-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {activity.user && <UserAvatar user={activity.user} size="xs" />}
          <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{activity.user?.name || 'System'}</span>{' '}
            {config.label}
          </span>
          <span className="text-xs text-slate-400 ml-auto">{timeAgo(activity.created_at)}</span>
        </div>
        {(activity.old_value || activity.new_value) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {activity.old_value && (
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 line-through">
                {activity.old_value}
              </span>
            )}
            {activity.old_value && activity.new_value && (
              <span className="text-slate-400">→</span>
            )}
            {activity.new_value && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                {activity.new_value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return <p className="text-sm text-slate-400 italic">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-0">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
