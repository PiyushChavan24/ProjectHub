import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import { useStudentList, updateProject } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';

/**
 * EditProjectModal
 *
 * Props:
 *  project   – the project document to edit (populated)
 *  onClose   – close without saving
 *  onUpdated – called with the updated project document on success
 */
export default function EditProjectModal({ project, onClose, onUpdated }) {
  const { auth } = useAuth();
  const { students, loading: loadingStudents } = useStudentList();

  // Pre-fill form from existing project
  const [form, setForm] = useState({
    title:       project.title,
    description: project.description,
  });

  // Pre-select existing co-contributors (everyone except the current user)
  const initialCoIds = (project.students ?? [])
    .map((s) => (typeof s === 'object' ? s._id : s))
    .filter((id) => id !== auth.user.id);

  const [selectedCoStudents, setSelectedCoStudents] = useState(initialCoIds);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const otherStudents = students.filter((s) => s._id !== auth.user.id);

  const toggleCoStudent = (id) =>
    setSelectedCoStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!form.title.trim())       return setError('Title is required.');
    if (!form.description.trim()) return setError('Description is required.');

    setSubmitting(true);
    try {
      // Resolve selected co-student IDs → emails for the backend
      const coStudentEmails = students
        .filter((s) => selectedCoStudents.includes(s._id))
        .map((s) => s.email);

      const result = await updateProject(project._id, {
        title:           form.title.trim(),
        description:     form.description.trim(),
        coStudentEmails,
      });

      onUpdated(result.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => !submitting && e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Edit Project</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-none">Status will reset to Pending after saving</p>
            </div>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. AI-Based Attendance System"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe goals, scope, and expected outcomes…"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Mentor (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Assigned Mentor
              <span className="text-xs font-normal text-slate-400 ml-1.5">(cannot be changed)</span>
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-700 font-semibold text-xs">
                  {(project.mentor?.name ?? '?')[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{project.mentor?.name ?? '—'}</p>
                <p className="text-xs text-slate-400">{project.mentor?.email ?? ''}</p>
              </div>
            </div>
          </div>

          {/* Co-contributors multi-select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Co-Contributors
              <span className="text-xs font-normal text-slate-400 ml-1.5">(click to toggle)</span>
            </label>
            {loadingStudents ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading students…</p>
            ) : otherStudents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No other students registered yet.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-44 overflow-y-auto">
                {otherStudents.map((s) => {
                  const selected = selectedCoStudents.includes(s._id);
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => toggleCoStudent(s._id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        selected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedCoStudents.length > 0 && (
              <p className="text-xs text-indigo-600 mt-1.5 font-medium">
                {selectedCoStudents.length} co-contributor{selectedCoStudents.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Re-submission notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <span className="shrink-0 mt-0.5">ℹ️</span>
            <span>
              Saving will reset the project status to <strong>Pending</strong> — your mentor will
              need to re-review the updated proposal.
            </span>
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.title.trim() || !form.description.trim()}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
