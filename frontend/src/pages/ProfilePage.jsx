import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import UserAvatar from '../components/UserAvatar';
import TaskStatusBadge from '../components/TaskStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, isOverdue } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Calendar, CheckSquare, Clock, AlertTriangle,
  ArrowRight, ShieldAlert, Award
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      taskService.getAll({ assigned_to: user.id, per_page: 20 })
        .then(res => setTasks(res.data?.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const overdueTasks = tasks.filter(t => isOverdue(t));

  const roleDescriptions = {
    admin: 'System Administrator with full access to manage projects, assign and delete any tasks, and invite team members.',
    manager: 'Project Manager authorized to create projects, oversee team velocity, assign tasks, and modify task parameters.',
    member: 'Team Contributor focused on completing assigned tasks, updating subtasks, adding comments, and uploading assets.',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <UserAvatar user={user} size="lg" className="w-20 h-20 text-2xl shadow-md shadow-indigo-100 ring-4 ring-indigo-50" />
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{user?.name}</h1>
                <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : user?.role === 'manager'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                <Shield className="w-3.5 h-3.5" /> {user?.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100 max-w-2xl leading-relaxed">
              {roleDescriptions[user?.role] || roleDescriptions.member}
            </p>
          </div>
        </div>
      </div>

      {/* Task Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Assigned Tasks</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-800">{tasks.length}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">In Progress</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Completed</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">{doneTasks.length}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Overdue</p>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {overdueTasks.length}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* My Active Tasks Table / List */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">My Assigned Tasks</h2>
            <p className="text-xs text-slate-500">Tasks currently assigned to you for execution</p>
          </div>
          <button
            onClick={() => navigate(`/tasks?assigned_to=${user?.id}`)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
          >
            View in Task List <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading your tasks…" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No tasks currently assigned to you.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tasks.map(task => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="py-3 px-2 sm:px-3 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${overdue ? 'text-rose-600' : 'text-slate-800'} group-hover:text-indigo-600 transition-colors`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <TaskStatusBadge status={task.status} size="xs" />
                      <PriorityBadge priority={task.priority} size="xs" />
                      {task.project && (
                        <span className="text-xs text-slate-400 font-medium">
                          {task.project.name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={`text-xs ${overdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                          Due {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
