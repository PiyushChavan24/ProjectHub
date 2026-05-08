import { useState } from 'react';
import { UserMinus, AlertTriangle, X } from 'lucide-react';
import { deleteAdminUser } from '../../hooks/useAdminUsers';

const ROLE_COLORS = {
  student: 'bg-blue-100   text-blue-700',
  mentor:  'bg-green-100  text-green-700',
  admin:   'bg-purple-100 text-purple-700',
};

export default function ConfirmDeleteUserModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await deleteAdminUser(user._id);
      onDeleted(user._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <UserMinus className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-bold text-slate-800 text-base">Remove User</h2>
          </div>
          {!loading && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This action is <strong>permanent</strong> and cannot be undone. The user's account will be deleted immediately.
            </p>
          </div>

          {/* User preview */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <span className={`ml-auto shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <button
            onClick={onClose} disabled={loading}
            className="px-5 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
