/**
 * PlagiarismReport
 * Displays the stored plagiarism check results from the FastAPI model.
 *
 * Props:
 *   report      — plagiarismReport sub-document from the Project
 *   pdfFileName — original file name (optional)
 *   compact     — if true renders a slim 1-row summary instead of the full card
 */

const RISK_CONFIG = {
  LOW:     { bg: 'bg-emerald-50',  border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-300', icon: '✅', label: 'Low Risk'    },
  MEDIUM:  { bg: 'bg-amber-50',    border: 'border-amber-200',   badge: 'bg-amber-100   text-amber-700   ring-amber-300',   icon: '⚠️', label: 'Medium Risk' },
  HIGH:    { bg: 'bg-red-50',      border: 'border-red-200',     badge: 'bg-red-100     text-red-700     ring-red-300',     icon: '🚨', label: 'High Risk'   },
  CRITICAL:{ bg: 'bg-red-100',     border: 'border-red-300',     badge: 'bg-red-200     text-red-800     ring-red-400',     icon: '🔴', label: 'Critical'    },
};

function resolveRisk(raw) {
  if (!raw) return null;
  const key = raw.toUpperCase();
  return RISK_CONFIG[key] ?? {
    bg: 'bg-slate-50', border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 ring-slate-300',
    icon: '❓', label: raw,
  };
}

function ScoreBar({ score }) {
  const pct   = Math.min(Math.max(Math.round((score ?? 0) * 100), 0), 100);
  const color =
    pct >= 75 ? 'bg-red-500'    :
    pct >= 45 ? 'bg-amber-400'  :
    pct >= 20 ? 'bg-yellow-400' : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-9 text-right">{pct}%</span>
    </div>
  );
}

// ── Compact one-liner summary ─────────────────────────────────────────────────
function CompactReport({ report }) {
  const risk = resolveRisk(report?.highest_risk);
  if (!risk) return null;
  const pct = Math.round((report.highest_score ?? 0) * 100);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Plagiarism:</span>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${risk.badge}`}>
        {risk.icon} {risk.label}
      </span>
      <span className="text-xs text-slate-500">{pct}% similarity</span>
    </div>
  );
}

// ── Full report card ──────────────────────────────────────────────────────────
function FullReport({ report, pdfFileName }) {
  const risk = resolveRisk(report?.highest_risk);
  if (!risk) {
    return (
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
        No plagiarism report available.
      </div>
    );
  }

  const pct       = Math.round((report.highest_score ?? 0) * 100);
  const checkedAt = report.checkedAt
    ? new Date(report.checkedAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className={`mt-3 rounded-xl border ${risk.border} ${risk.bg} overflow-hidden`}>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className="text-base">{risk.icon}</span>
          <span className="text-sm font-bold text-slate-800">Plagiarism Report</span>
          {pdfFileName && (
            <span className="hidden sm:inline text-xs text-slate-400 font-mono truncate max-w-[160px]">
              · {pdfFileName}
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${risk.badge}`}>
          {risk.label}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/60">
        {/* Similarity score */}
        <div className="bg-white px-4 py-3 col-span-2">
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Similarity Score</p>
          <ScoreBar score={report.highest_score} />
        </div>

        {/* Total comparisons */}
        <div className="bg-white px-4 py-3">
          <p className="text-xs text-slate-500 mb-1 font-medium">Comparisons</p>
          <p className="text-lg font-bold text-slate-800">{report.total_comparisons ?? '—'}</p>
        </div>

        {/* Elapsed time */}
        <div className="bg-white px-4 py-3">
          <p className="text-xs text-slate-500 mb-1 font-medium">Analysis Time</p>
          <p className="text-lg font-bold text-slate-800">
            {report.total_elapsed_seconds != null
              ? `${report.total_elapsed_seconds.toFixed(1)}s`
              : '—'}
          </p>
        </div>
      </div>

      {/* Footer timestamp */}
      {checkedAt && (
        <div className="px-4 py-2 text-xs text-slate-400">
          Checked on {checkedAt}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PlagiarismReport({ report, pdfFileName, compact = false }) {
  if (!report?.highest_risk) return null;
  if (compact) return <CompactReport report={report} />;
  return <FullReport report={report} pdfFileName={pdfFileName} />;
}
