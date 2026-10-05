import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { Eye, EyeOff, LogIn, Sparkles, Shield, UserCheck, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(email, password) {
    setForm({ email, password });
    setError('');
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-7 sm:p-9 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-400 text-sm mt-1">Sign in to access your projects and task workspace</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 active:scale-98 cursor-pointer"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <LogIn className="w-4 h-4" />
          }
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs sm:text-sm text-slate-400 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
          Create one now
        </Link>
      </p>

      {/* Quick Demo Credentials Autofill */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <p className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Quick Test Accounts (Click to auto-fill)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@example.com', 'password123')}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              form.email === 'admin@example.com'
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
              <Shield className="w-3 h-3 text-purple-400" /> Admin
            </div>
            <p className="text-[10px] text-slate-400 truncate">admin@example.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('manager1@example.com', 'password123')}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              form.email === 'manager1@example.com'
                ? 'bg-blue-950/60 border-blue-500/50 text-blue-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
              <UserCheck className="w-3 h-3 text-blue-400" /> Manager
            </div>
            <p className="text-[10px] text-slate-400 truncate">manager1@example.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('member1@example.com', 'password123')}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              form.email === 'member1@example.com'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
              <User className="w-3 h-3 text-emerald-400" /> Member
            </div>
            <p className="text-[10px] text-slate-400 truncate">member1@example.com</p>
          </button>
        </div>
      </div>
    </div>
  );
}
