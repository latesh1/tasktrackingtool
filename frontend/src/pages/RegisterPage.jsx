import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getValidationErrors } from '../utils/helpers';
import { Eye, EyeOff, UserPlus, AlertCircle, Shield, UserCheck, User } from 'lucide-react';

function FieldError({ msg }) {
  const text = Array.isArray(msg) ? msg[0] : msg;
  if (!text) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-400 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{text}
    </p>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'member' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      const valErrors = getValidationErrors(err);
      if (Object.keys(valErrors).length > 0) {
        setErrors(valErrors);
      } else {
        setGlobalError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-7 sm:p-9 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Create an account</h2>
        <p className="text-slate-400 text-sm mt-1">Join your team workspace on TaskFlow</p>
      </div>

      {globalError && (
        <div className="mb-5 px-4 py-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="Sarah Connor"
          />
          <FieldError msg={errors.name} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="sarah@company.com"
          />
          <FieldError msg={errors.email} />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'member', label: 'Member', icon: User },
              { id: 'manager', label: 'Manager', icon: UserCheck },
              { id: 'admin', label: 'Admin', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => update('role', id)}
                className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  form.role === id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <FieldError msg={errors.role} />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError msg={errors.password} />
        </div>

        {/* Password Confirmation */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Confirm password
          </label>
          <input
            id="reg-password-confirmation"
            type={showPass ? 'text' : 'password'}
            value={form.password_confirmation}
            onChange={e => update('password_confirmation', e.target.value)}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="Re-type password"
          />
        </div>

        <button
          id="register-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-4 active:scale-98 cursor-pointer"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <UserPlus className="w-4 h-4" />
          }
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs sm:text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
