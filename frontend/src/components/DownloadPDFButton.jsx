import { useState } from 'react';
import { Download, FileX, Loader2, RefreshCw } from 'lucide-react';
import { downloadProjectPDF } from '../hooks/useProjects';

/**
 * DownloadPDFButton
 *
 * Props:
 *  projectId    – MongoDB _id of the project
 *  projectTitle – used to build the saved filename
 *  hasPdf       – boolean: whether pdfFileName is stored (PDF was uploaded)
 *  hasPdfData   – boolean: whether the raw buffer is stored (can actually be downloaded)
 *  size         – 'sm' | 'md'  (default 'sm')
 */
export default function DownloadPDFButton({
  projectId,
  projectTitle,
  hasPdf,
  hasPdfData,
  size = 'sm',
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isSm = size === 'sm';
  const base = isSm ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const iconCls = isSm ? 'w-3.5 h-3.5' : 'w-4 h-4';

  // ── Case 1: No PDF was ever uploaded ────────────────────────────────────────
  if (!hasPdf) {
    return (
      <span
        title="No PDF was uploaded for this project"
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium cursor-not-allowed select-none ${base} bg-slate-100 text-slate-400`}
      >
        <FileX className={iconCls} />
        No PDF
      </span>
    );
  }

  // ── Case 2: PDF was uploaded but buffer wasn't persisted (legacy project) ───
  // This happens for projects created before the pdfData storage was wired up.
  if (!hasPdfData) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span
          title="This project was submitted before PDF download storage was enabled. Please delete and re-submit it to enable downloads."
          className={`inline-flex items-center gap-1.5 rounded-lg font-medium cursor-not-allowed select-none ${base} bg-amber-50 text-amber-600 ring-1 ring-amber-200`}
        >
          <RefreshCw className={iconCls} />
          Re-submit needed
        </span>
        <p className="text-xs text-amber-500 max-w-[190px] leading-tight">
          PDF file was not stored. Delete &amp; re-submit to enable download.
        </p>
      </div>
    );
  }

  // ── Case 3: PDF buffer is present — normal download flow ────────────────────
  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await downloadProjectPDF(projectId, projectTitle);
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 403 ? 'Access denied.' :
        status === 404 ? 'PDF not stored for this project — delete and re-submit.' :
                         'Download failed — please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        title={`Download ${projectTitle} PDF report`}
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed
          ${base}
          ${loading
            ? 'bg-indigo-100 text-indigo-400'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
          }`}
      >
        {loading ? (
          <><Loader2 className={`${iconCls} animate-spin`} />Downloading…</>
        ) : (
          <><Download className={iconCls} />Download PDF</>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 max-w-[190px] leading-tight">{error}</p>
      )}
    </div>
  );
}
