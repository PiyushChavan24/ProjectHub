import { useState, useMemo, useDeferredValue } from 'react';
import { Search, X, GraduationCap, UserCheck, BarChart2, Trophy, BookOpen, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useApprovedProjects, useSavedIds } from '../hooks/useProjects';

// ── Risk config ───────────────────────────────────────────────────────────────
const RISK_CFG = {
  LOW:      { label: 'LOW',      bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  MEDIUM:   { label: 'MEDIUM',   bar: 'bg-amber-400',   badge: 'bg-amber-100   text-amber-700   ring-amber-200',   dot: 'bg-amber-400'   },
  HIGH:     { label: 'HIGH',     bar: 'bg-red-500',     badge: 'bg-red-100     text-red-700     ring-red-200',     dot: 'bg-red-500'     },
  CRITICAL: { label: 'CRITICAL', bar: 'bg-red-700',     badge: 'bg-red-200     text-red-900     ring-red-300',     dot: 'bg-red-700'     },
};
const riskCfg = (r) => RISK_CFG[r?.toUpperCase()] ?? { label: r ?? '—', bar: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500 ring-slate-200', dot: 'bg-slate-400' };

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, riskKey }) {
  const pct = Math.round((score ?? 0) * 100);
  const cfg = riskCfg(riskKey);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
function GalleryCard({ project, saved, onSave }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const report   = project.plagiarismReport;
  const riskKey  = report?.highest_risk?.toUpperCase();
  const cfg      = riskCfg(riskKey);
  const students = project.students?.map((s) => s.name).join(', ') || '—';
  const mentor   = project.mentor?.name || '—';
  const date     = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer">

      {/* ── Coloured top accent strip ── */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      {/* ── Card body ── */}
      <div className="px-5 pt-4 pb-3 flex-1 flex flex-col gap-3">

        {/* Title + date + save */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">{project.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onSave?.(); }}
                title={saved ? 'Remove from saved' : 'Save project'}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  saved
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Bookmark className="w-3 h-3" fill={saved ? 'white' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
          <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
            {project.description}
          </p>
          {project.description?.length > 180 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors"
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>

        {/* Students */}
        <div className="flex items-start gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Students</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{students}</p>
          </div>
        </div>

        {/* Mentor */}
        <div className="flex items-start gap-2">
          <UserCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Mentor</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{mentor}</p>
          </div>
        </div>

        {/* Plagiarism report summary */}
        {report?.highest_risk ? (
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plagiarism Report</span>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <ScoreBar score={report.highest_score} riskKey={riskKey} />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{report.total_comparisons} source{report.total_comparisons !== 1 ? 's' : ''} checked</span>
              {report.total_elapsed_seconds != null && (
                <span>{report.total_elapsed_seconds.toFixed(2)}s</span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No plagiarism report available</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
        {project.pdfFileName && (
          <span className="text-xs text-slate-400 font-mono truncate max-w-[140px]" title={project.pdfFileName}>
            📄 {project.pdfFileName}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200 dark:bg-slate-700 w-full" />
      <div className="px-5 pt-4 pb-5 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-5/6" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-2/3" />
        <div className="h-8 bg-slate-100 dark:bg-slate-700/60 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectGallery() {
  const { projects, loading, error } = useApprovedProjects();
  const { savedIds, toggleSave } = useSavedIds();

  const [query,       setQuery]       = useState('');
  const [riskFilter,  setRiskFilter]  = useState('ALL');
  const [sortBy,      setSortBy]      = useState('newest');

  // Defer search input so filtering doesn't block keystrokes
  const deferredQuery     = useDeferredValue(query);
  const deferredRiskFilter = useDeferredValue(riskFilter);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    let result = projects.filter((p) => {
      if (q) {
        const inTitle    = p.title?.toLowerCase().includes(q);
        const inStudents = p.students?.some((s) => s.name?.toLowerCase().includes(q));
        const inMentor   = p.mentor?.name?.toLowerCase().includes(q);
        if (!inTitle && !inStudents && !inMentor) return false;
      }
      if (deferredRiskFilter !== 'ALL') {
        const r = p.plagiarismReport?.highest_risk?.toUpperCase();
        if (r !== deferredRiskFilter) return false;
      }
      return true;
    });

    // filter() already returns a new array — sort in place, no extra copy needed
    if (sortBy === 'newest')   result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (sortBy === 'oldest')   result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    if (sortBy === 'az')       result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'risk_asc') {
      const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
      result.sort((a, b) => (order[a.plagiarismReport?.highest_risk?.toUpperCase()] ?? -1) - (order[b.plagiarismReport?.highest_risk?.toUpperCase()] ?? -1));
    }

    return result;
  }, [projects, deferredQuery, deferredRiskFilter, sortBy]);

  const riskCounts = useMemo(() => {
    const counts = { ALL: projects.length, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const p of projects) {
      const r = p.plagiarismReport?.highest_risk?.toUpperCase();
      if (r && counts[r] !== undefined) counts[r]++;
    }
    return counts;
  }, [projects]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="w-full px-8 pt-24 pb-10 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Project Gallery</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm ml-13">
              Showcasing all <span className="font-semibold text-emerald-600">{projects.length}</span> approved project{projects.length !== 1 ? 's' : ''} from the platform.
            </p>
          </div>

          {/* Risk filter pills */}
          {!loading && projects.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).map((r) => {
                const cfg = r === 'ALL' ? null : riskCfg(r);
                return (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ring-1 ${
                      riskFilter === r
                        ? r === 'ALL'
                          ? 'bg-slate-800 text-white ring-slate-800'
                          : `${cfg.badge} ring-current`
                        : 'bg-white text-slate-500 ring-slate-200 hover:ring-slate-400'
                    }`}
                  >
                    {r} {riskCounts[r] > 0 && <span className="opacity-70">({riskCounts[r]})</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Search & sort bar ── */}
        {!loading && projects.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by project title, student name, or mentor…"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 transition"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="newest">Sort: Newest first</option>
              <option value="oldest">Sort: Oldest first</option>
              <option value="az">Sort: A → Z</option>
              <option value="risk_asc">Sort: Risk (low → high)</option>
            </select>
          </div>
        )}

        {/* ── Result count ── */}
        {!loading && (deferredQuery || deferredRiskFilter !== 'ALL') && (
          <p className="text-sm text-slate-500 -mt-4">
            Showing <strong>{displayed.length}</strong> of <strong>{projects.length}</strong> projects
            {deferredQuery && <span> matching <em>"{deferredQuery}"</em></span>}
            {deferredRiskFilter !== 'ALL' && <span> with <strong>{deferredRiskFilter}</strong> risk</span>}
          </p>
        )}

        {/* ── States ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-slate-700 font-semibold text-lg">Failed to load gallery</p>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          /* ── No approved projects at all ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-emerald-300" />
            </div>
            <h2 className="text-slate-700 font-bold text-xl">No approved projects yet</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-sm">
              Projects will appear here once a mentor approves them. Check back soon!
            </p>
          </div>
        ) : displayed.length === 0 ? (
          /* ── No results for current search/filter ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-700 font-semibold text-lg">No matching projects</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search term or filter.</p>
            <button
              onClick={() => { setQuery(''); setRiskFilter('ALL'); }}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* ── Gallery grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((p) => (
              <GalleryCard
                key={p._id}
                project={p}
                saved={savedIds.has(p._id)}
                onSave={() => toggleSave(p._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
