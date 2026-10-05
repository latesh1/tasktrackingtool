import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Bell, BellOff, CheckCheck, ArrowRight } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ per_page: 10 });
      setNotifications(res.data?.items || []);
      setUnreadCount(res.data?.unread_count || 0);
    } catch (e) {
      /* no-op */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markRead(id) {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function markAllRead() {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  }

  function handleItemClick(n) {
    if (!n.read_at) {
      markRead(n.id);
    }
    setOpen(false);
    const taskId = n.task_id || n.data?.task_id;
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    } else {
      navigate('/notifications');
    }
  }

  const TYPE_COLORS = {
    task_assigned: 'bg-blue-500',
    status_changed: 'bg-emerald-500',
    task_overdue: 'bg-rose-500',
    task_completed: 'bg-indigo-500',
    comment_added: 'bg-teal-500',
  };

  return (
    <div className="relative">
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <BellOff className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">No new notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">You're all caught up with your team updates.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                      !n.read_at ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${TYPE_COLORS[n.type] || 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm leading-snug ${!n.read_at ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-2.5 bg-slate-50/80 text-center">
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 w-full py-1 hover:underline"
              >
                View all notifications in Center <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
