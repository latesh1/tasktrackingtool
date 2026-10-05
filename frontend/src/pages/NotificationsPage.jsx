import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { timeAgo } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import {
  Bell, BellOff, CheckCheck, Check, Clock, UserCheck, AlertTriangle,
  MessageSquare, CheckCircle, ArrowRight
} from 'lucide-react';

const TYPE_ICONS = {
  task_assigned: { icon: UserCheck, color: 'bg-blue-100 text-blue-600' },
  status_changed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  task_overdue: { icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' },
  task_completed: { icon: CheckCircle, color: 'bg-indigo-100 text-indigo-600' },
  comment_added: { icon: MessageSquare, color: 'bg-teal-100 text-teal-600' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ per_page: 50 });
      setNotifications(res.data?.items || []);
      setUnreadCount(res.data?.unread_count || 0);
    } catch (e) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (e) {
      toast.error('Failed to update notification');
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to update notifications');
    }
  }

  function handleNotificationClick(item) {
    if (!item.read_at) {
      handleMarkRead(item.id);
    }
    // Deep-link to task if task_id exists
    const taskId = item.task_id || item.data?.task_id;
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    }
  }

  const displayedNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Stay updated with task assignments, status shifts, and comments</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading notifications…" />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description={filter === 'unread' ? "You've read all your updates." : 'When you receive assignments or updates, they will appear here.'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedNotifications.map(n => {
              const typeCfg = TYPE_ICONS[n.type] || { icon: Bell, color: 'bg-slate-100 text-slate-600' };
              const Icon = typeCfg.icon;
              const isUnread = !n.read_at;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group ${
                    isUnread ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${typeCfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {n.title}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2.5">
                      {(n.task_id || n.data?.task_id) && (
                        <span className="text-xs font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
                          View task <ArrowRight className="w-3 h-3" />
                        </span>
                      )}

                      {isUnread && (
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          className="text-xs font-medium text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {isUnread && (
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 self-center" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
