import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskStatusBadge from '../components/TaskStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import UserAvatar from '../components/UserAvatar';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import { formatDate, timeAgo, isOverdue } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  CheckSquare, Clock, AlertTriangle, TrendingUp,
  Activity, Folder, Users, ArrowUpRight, Plus,
  CalendarCheck, AlertOctagon, CheckCircle2, CircleDashed
} from 'lucide-react';

function StatCard({ label, value, subtext, icon: Icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl border border-slate-100 p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-100' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value ?? 0}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickTaskRow({ task, onClick }) {
  const overdue = isOverdue(task);
  return (
    <div
      onClick={() => onClick(task.id)}
      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className={`text-sm font-semibold truncate ${overdue ? 'text-rose-600' : 'text-slate-800'} group-hover:text-indigo-600 transition-colors`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <TaskStatusBadge status={task.status} size="xs" />
          <PriorityBadge priority={task.priority} size="xs" />
          {task.project && (
            <span className="text-xs text-slate-400 font-medium">{task.project.name}</span>
          )}
          {task.due_date && (
            <span className={`text-xs ${overdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
              Due {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {task.assignee && <UserAvatar user={task.assignee} size="xs" />}
        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function DashboardPage() {
  const { user, isManager, isAdmin } = useAuth();
  const canCreate = isManager || isAdmin;
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsRes, recentRes, overdueRes] = await Promise.all([
          dashboardService.getStats(),
          taskService.getAll({ sort: 'created_at', order: 'desc', per_page: 6 }),
          taskService.getAll({ overdue: true, per_page: 6 }),
        ]);
        setStats(statsRes.data || {});
        setRecentTasks(recentRes.data?.items || []);
        setOverdueTasks(overdueRes.data?.items || []);
      } catch (e) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleQuickCreate(payload) {
    setCreatingTask(true);
    try {
      await taskService.create(payload);
      toast.success('Task created successfully');
      setCreateModalOpen(false);
      // Reload stats & tasks
      const [statsRes, recentRes] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAll({ sort: 'created_at', order: 'desc', per_page: 6 }),
      ]);
      setStats(statsRes.data || {});
      setRecentTasks(recentRes.data?.items || []);
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard metrics…" />;
  if (error) return <ErrorMessage message={error} />;

  // Support both formatted structure and direct keys from backend
  const totalTasks = stats?.total_tasks ?? stats?.task_summary?.total ?? 0;
  const inProgress = stats?.in_progress_count ?? stats?.task_summary?.in_progress ?? 0;
  const overdueCount = stats?.overdue_count ?? stats?.task_summary?.overdue ?? 0;
  const doneCount = stats?.done_count ?? stats?.task_summary?.done ?? 0;
  const todoCount = stats?.todo_count ?? stats?.task_summary?.todo ?? 0;
  const blockedCount = stats?.blocked_count ?? stats?.task_summary?.blocked ?? 0;
  const totalProjects = stats?.total_projects ?? stats?.project_summary?.total ?? 0;
  const dueToday = stats?.tasks_due_today ?? 0;
  const dueThisWeek = stats?.tasks_due_this_week ?? 0;

  // Percentage calculations
  const todoPct = totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0;
  const inProgressPct = totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0;
  const blockedPct = totalTasks > 0 ? Math.round((blockedCount / totalTasks) * 100) : 0;
  const donePct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-950/20">
        <div>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 mb-2 backdrop-blur-sm">
            Workspace Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl leading-relaxed">
            You have <strong className="text-white">{dueToday} tasks due today</strong> and <strong className="text-white">{dueThisWeek} due this week</strong>. Here is your team's live status.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-2xl shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        )}
      </div>

      {/* Primary 4 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          subtext={`${todoCount} to-do`}
          icon={CheckSquare}
          color="bg-indigo-600"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          subtext="Active sprints"
          icon={Activity}
          color="bg-blue-500"
          onClick={() => navigate('/tasks?status=in_progress')}
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          subtext="Immediate attention"
          icon={AlertTriangle}
          color="bg-rose-500"
          onClick={() => navigate('/tasks?overdue=1')}
        />
        <StatCard
          label="Completed"
          value={doneCount}
          subtext={`${donePct}% completion rate`}
          icon={TrendingUp}
          color="bg-emerald-500"
          onClick={() => navigate('/tasks?status=done')}
        />
      </div>

      {/* Task Distribution Bar Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-800">Task Velocity & Distribution</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> To Do ({todoCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> In Progress ({inProgress})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocked ({blockedCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done ({doneCount})
            </span>
          </div>
        </div>

        {/* Progress distribution bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {todoPct > 0 && <div style={{ width: `${todoPct}%` }} className="h-full bg-amber-400 transition-all" title={`To Do: ${todoCount}`} />}
          {inProgressPct > 0 && <div style={{ width: `${inProgressPct}%` }} className="h-full bg-indigo-500 transition-all" title={`In Progress: ${inProgress}`} />}
          {blockedPct > 0 && <div style={{ width: `${blockedPct}%` }} className="h-full bg-rose-500 transition-all" title={`Blocked: ${blockedCount}`} />}
          {donePct > 0 && <div style={{ width: `${donePct}%` }} className="h-full bg-emerald-500 transition-all" title={`Done: ${doneCount}`} />}
        </div>
      </div>

      {/* Two Column Layout: Recent Tasks + Overdue Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recently Created Tasks</h2>
              <p className="text-xs text-slate-400">Latest activity across the team</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-50">
            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No tasks recorded yet.</p>
            ) : (
              recentTasks.map(task => (
                <QuickTaskRow
                  key={task.id}
                  task={task}
                  onClick={(id) => navigate(`/tasks/${id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Overdue Attention */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Attention Required
                {overdueTasks.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {overdueTasks.length} overdue
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Tasks that have passed their target due date</p>
            </div>
            <button
              onClick={() => navigate('/tasks?overdue=1')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
            >
              Filter overdue <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-50">
            {overdueTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">There are no overdue tasks at this time.</p>
              </div>
            ) : (
              overdueTasks.map(task => (
                <QuickTaskRow
                  key={task.id}
                  task={task}
                  onClick={(id) => navigate(`/tasks/${id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Create Task Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleQuickCreate} loading={creatingTask} submitLabel="Create Task" />
      </Modal>
    </div>
  );
}
