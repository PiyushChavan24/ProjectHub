import { useState } from 'react';
import { Trash2, Users, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProjectCard from '../../components/ProjectCard';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useMentorProjects, useMentorStudents, reviewProject, useSavedIds } from '../../hooks/useProjects';

// ── Inline Review Modal ───────────────────────────────────────────────────────
function ReviewModal({ project, onClose, onDone }) {
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (status) => {
    setLoading(true);
    setError('');
    try {
      await reviewProject(project._id, status, note);
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Review Project</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{project.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>
          )}

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>
                <span className="font-medium text-slate-600 dark:text-slate-300">Students: </span>
                {project.students?.map((s) => s.name).join(', ')}
              </span>
              <span>
                <span className="font-medium text-slate-600 dark:text-slate-300">Submitted: </span>
                {new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Review Note
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">(optional — visible to students)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add feedback for the students…"
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => submit('rejected')}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
            {loading ? '…' : 'Reject'}
          </button>
          <button
            onClick={() => submit('approved')}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? '…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Mentor Dashboard ─────────────────────────────────────────────────────
export default function MentorDashboard() {
  const { auth } = useAuth();

  const { projects, loading: loadingProjects, error: projectError, refresh: refreshProjects } = useMentorProjects();
  const { students, loading: loadingStudents, error: studentError,  refresh: refreshStudents  } = useMentorStudents();
  const { savedIds, toggleSave } = useSavedIds();

  const [reviewTarget, setReviewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const pending  = projects.filter((p) => p.status === 'pending');
  const reviewed = projects.filter((p) => p.status !== 'pending');

  const handleReviewDone = () => {
    refreshProjects();
  };

  const handleDeleted = () => {
    refreshProjects();
    refreshStudents(); // student list may shrink if they had only this project
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-8 space-y-8">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mentor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, <span className="font-medium text-slate-700 dark:text-slate-200">{auth.user.name}</span>!
            Review proposals and manage your assigned projects.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'My Students',       value: students.length,  icon: '👥', color: 'bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-800'  },
            { label: 'Pending Approvals', value: pending.length,   icon: '📋', color: 'bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-800'  },
            { label: 'Reviewed',          value: reviewed.length,  icon: '✅', color: 'bg-blue-50   dark:bg-blue-900/20   border-blue-200   dark:border-blue-800'   },
            { label: 'Total Projects',    value: projects.length,  icon: '🗂️', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: Pending Approvals
        ───────────────────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" />
              Pending Approvals
            </h2>
            {pending.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold ring-1 ring-amber-200">
                {pending.length} awaiting review
              </span>
            )}
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <div key={i} className="h-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse" />)}
            </div>
          ) : projectError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">{projectError}</div>
          ) : pending.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">All caught up!</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">No projects are waiting for your review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  saved={savedIds.has(p._id)}
                  onSave={() => toggleSave(p._id)}
                  actions={
                    <>
                      <button
                        onClick={() => setReviewTarget(p)}
                        className="flex-1 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-center"
                      >
                        Review Project
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Delete project"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: Previously Reviewed
        ───────────────────────────────────────────────────────────────────── */}
        {reviewed.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Previously Reviewed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewed.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  saved={savedIds.has(p._id)}
                  onSave={() => toggleSave(p._id)}
                  actions={
                    <>
                      {p.status === 'approved' ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved by you
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Rejected by you
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Delete project"
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: My Students  (live from /api/mentor/students)
        ───────────────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            My Students
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">— linked to your projects</span>
          </h2>

          {loadingStudents ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : studentError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">{studentError}</div>
          ) : students.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
              <p className="text-3xl mb-3">👤</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">No students assigned yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Students will appear here once they submit a project and select you as mentor.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.map((s) => {
                  const projectCount = projects.filter((p) =>
                    p.students?.some((ps) => (typeof ps === 'object' ? ps._id : ps) === s._id)
                  ).length;

                  return (
                    <div key={s._id} className="px-6 py-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {s.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{s.email}</p>
                      </div>

                      {/* Project badge */}
                      <span className="shrink-0 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                        {projectCount} project{projectCount !== 1 ? 's' : ''}
                      </span>

                      {/* Role badge */}
                      <span className="shrink-0 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full capitalize">
                        {s.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: All Projects Quick Overview
        ───────────────────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">All Projects Overview</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                {projects.map((p) => (
                  <div key={p._id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {p.students?.map((s) => s.name).join(', ')}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Modals ── */}
      {reviewTarget && (
        <ReviewModal
          project={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={handleReviewDone}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
