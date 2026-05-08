import { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { updateAdminUser } from '../../hooks/useAdminUsers';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'mentor',  label: 'Mentor'  },
  { value: 'admin',   label: 'Admin'   },
];

const ROLE_COLORS = {
  student: 'bg-blue-100   text-blue-700',
  mentor:  'bg-green-100  text-green-700',
  admin:   'bg-purple-100 text-purple-700',
};

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name:  user.name,
    email: user.email,
    role:  user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user: updated } = await updateAdminUser(user._id, form);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Edit User</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                {user.email}
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                  {user.role}
                </span>
              </p>
            </div>
          </div>
          {!loading && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
              <span className="shrink-0">⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              name="name" type="text" required
              value={form.name} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              name="email" type="email" required
              value={form.email} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Role
              {form.role !== user.role && (
                <span className="ml-2 text-xs text-amber-600 font-medium">
                  (changing from {user.role} → {form.role})
                </span>
              )}
            </label>
            <select
              name="role"
              value={form.role} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <button
            type="button" onClick={onClose} disabled={loading}
            className="px-5 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
