import { useState, useRef } from 'react';
import { useMentorList, useStudentList, createProject } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';

// ── Upload phase labels ───────────────────────────────────────────────────────
const PHASES = {
  idle:       null,
  uploading:  { icon: '📤', text: 'Uploading PDF…',              sub: 'Sending file to server'               },
  checking:   { icon: '🔍', text: 'Running plagiarism check…',   sub: 'This may take up to 2 minutes'        },
  saving:     { icon: '💾', text: 'Saving project…',             sub: 'Almost done!'                         },
};

export default function ProposeProjectModal({ onClose, onCreated }) {
  const { auth } = useAuth();
  const { mentors, loading: loadingMentors } = useMentorList();
  const { students, loading: loadingStudents } = useStudentList();

  const [form, setForm] = useState({ title: '', description: '', mentorId: '' });
  const [selectedCoStudents, setSelectedCoStudents] = useState([]);
  const [pdfFile, setPdfFile]   = useState(null);
  const [phase, setPhase]       = useState('idle');   // idle | uploading | checking | saving
  const [error, setError]       = useState('');
  const fileInputRef            = useRef(null);

  const otherStudents = students.filter((s) => s._id !== auth.user.id);
  const submitting    = phase !== 'idle';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleCoStudent = (id) =>
    setSelectedCoStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      e.target.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('PDF must be smaller than 20 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!form.mentorId) return setError('Please select a mentor.');
    if (!pdfFile)       return setError('Please attach a PDF file.');

    const coStudentEmails = students
      .filter((s) => selectedCoStudents.includes(s._id))
      .map((s) => s.email);

    try {
      setPhase('uploading');
      // Small synthetic delay so users see the uploading state before HF processing
      await new Promise((r) => setTimeout(r, 600));

      setPhase('checking');
      // The actual network call — this is where HF model runs (~30-120s)
      const result = await createProject({
        title:           form.title,
        description:     form.description,
        mentorId:        form.mentorId,
        coStudentEmails,
        pdfFile,
      });

      setPhase('saving');
      await new Promise((r) => setTimeout(r, 400));

      onCreated(result.project);
      onClose();
    } catch (err) {
      setPhase('idle');
      setError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    }
  };

  const currentPhase = PHASES[phase];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => { if (!submitting && e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Propose a Project</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit for mentor review · PDF required</p>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Loading overlay ── */}
        {submitting && currentPhase && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
            {/* Spinner */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">
                {currentPhase.icon}
              </span>
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{currentPhase.text}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{currentPhase.sub}</p>

            {/* Progress bar */}
            <div className="w-64 mt-6 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 bg-indigo-500 rounded-full animate-pulse"
                style={{ width: phase === 'uploading' ? '30%' : phase === 'checking' ? '70%' : '95%' }}
              />
            </div>

            {phase === 'checking' && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 max-w-xs">
                The plagiarism model is analysing your document against existing sources.
                Please keep this window open.
              </p>
            )}
          </div>
        )}

        {/* ── Form body (hidden while processing) ── */}
        {!submitting && (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title" type="text" required
                value={form.title} onChange={handleChange}
                placeholder="e.g. AI-Based Attendance System"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description" required rows={4}
                value={form.description} onChange={handleChange}
                placeholder="Describe goals, scope, and expected outcomes…"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Mentor dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Mentor <span className="text-red-500">*</span>
              </label>
              {loadingMentors ? (
                <p className="text-xs text-slate-400 animate-pulse">Loading mentors…</p>
              ) : (
                <select
                  name="mentorId" required
                  value={form.mentorId} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">— Choose a mentor —</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              )}
            </div>

            {/* PDF upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project Report (PDF) <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  pdfFile
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                }`}
              >
                <span className="text-2xl shrink-0">{pdfFile ? '📄' : '📎'}</span>
                <div className="min-w-0 flex-1">
                  {pdfFile ? (
                    <>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Click to attach PDF</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Max 20 MB · Required for plagiarism check</p>
                    </>
                  )}
                </div>
                {pdfFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="shrink-0 w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file" accept="application/pdf"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Co-contributors multi-select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Co-Contributors
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">(optional)</span>
              </label>
              {loadingStudents ? (
                <p className="text-xs text-slate-400 animate-pulse">Loading students…</p>
              ) : otherStudents.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No other students registered yet.</p>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-40 overflow-y-auto">
                  {otherStudents.map((s) => {
                    const selected = selectedCoStudents.includes(s._id);
                    return (
                      <button
                        key={s._id} type="button"
                        onClick={() => toggleCoStudent(s._id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 12 12">
                              <polyline points="1.5,6 4.5,9 10.5,3" />
                            </svg>
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{s.email}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedCoStudents.length > 0 && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5 font-medium">
                  {selectedCoStudents.length} co-contributor{selectedCoStudents.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </form>
        )}

        {/* ── Footer ── */}
        {!submitting && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!pdfFile || !form.title || !form.mentorId}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Submit Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
