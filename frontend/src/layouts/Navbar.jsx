import { useLocation, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { Menu } from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Task Workspace',
  '/projects': 'Projects',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
};

function getBreadcrumb(pathname) {
  if (pathname.startsWith('/tasks/') && pathname !== '/tasks') return 'Task Details';
  if (pathname.startsWith('/projects/') && pathname !== '/projects') return 'Project Details';
  return ROUTE_TITLES[pathname] || 'TaskFlow';
}

export default function Navbar({ onOpenMobileMenu }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = getBreadcrumb(location.pathname);

  return (
    <header className="h-16 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
      {/* Mobile Menu Hamburger */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden p-2 rounded-2xl hover:bg-slate-100 text-slate-600 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex-1 truncate">
        {title}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationDropdown />

        {user && (
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity select-none"
            title="View Profile"
          >
            <UserAvatar user={user} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-400 capitalize mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
