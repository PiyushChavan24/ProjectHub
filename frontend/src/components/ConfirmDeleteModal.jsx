import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteProject } from '../hooks/useProjects';

/**
 * ConfirmDeleteModal
 *
 * Props:
 *  project  – the project document to delete
 *  onClose  – close without deleting
 *  onDeleted – called after successful deletion
 */
export default function ConfirmDeleteModal({ project, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteProject(project._id);
      onDeleted(project._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => !loading && e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Icon header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 text-center">Delete Project?</h2>
          <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
            You are about to permanently delete{' '}
            <span className="font-semibold text-slate-700">&quot;{project.title}&quot;</span>.
            This action cannot be undone.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Project preview pill */}
        <div className="mx-6 mb-5 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{project.title}</p>
            <p className="text-xs text-slate-400 truncate">
              {project.students?.map((s) => s.name ?? s).join(', ')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
