import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import UserAvatar from './UserAvatar';
import { User, ChevronDown, X } from 'lucide-react';

export default function UserSelector({ value, onChange, placeholder = 'Assign to…', allowClear = true }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    userService.getAll().then(r => setUsers(r.data || [])).catch(() => {});
  }, []);

  const selectedUser = users.find(u => u.id === value);
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function select(user) {
    onChange(user.id);
    setOpen(false);
    setSearch('');
  }

  function clear(e) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-left hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
      >
        {selectedUser ? (
          <>
            <UserAvatar user={selectedUser} size="xs" />
            <span className="flex-1 text-sm text-slate-700 truncate">{selectedUser.name}</span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-sm text-slate-400">{placeholder}</span>
          </>
        )}
        {selectedUser && allowClear ? (
          <button type="button" onClick={clear} className="p-0.5 hover:text-slate-600 text-slate-400">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-400 text-center">No users found</p>
            ) : (
              filtered.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => select(user)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                    value === user.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <UserAvatar user={user} size="xs" />
                  <div className="text-left">
                    <div className="font-medium text-slate-700">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.role}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
