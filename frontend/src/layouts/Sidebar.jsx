import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, FolderKanban, LogOut,
  ChevronLeft, ChevronRight, ListTodo, Kanban, Bell, User,
  X
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-slate-900 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-900/50 shrink-0">
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-extrabold text-base text-white tracking-tight leading-none">TaskFlow</p>
              <p className="text-[11px] text-indigo-400 font-medium tracking-wider uppercase mt-1">Enterprise PM</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User profile & Logout footer */}
      <div className="border-t border-slate-900 p-3 space-y-2">
        {!collapsed && user && (
          <div
            onClick={() => { navigate('/profile'); onCloseMobile?.(); }}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-900 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{user.name}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 hover:bg-indigo-600 border border-slate-700 rounded-full items-center justify-center text-slate-300 hover:text-white transition-all z-30 shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} shrink-0 min-h-screen relative`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-xs bg-slate-950 h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
