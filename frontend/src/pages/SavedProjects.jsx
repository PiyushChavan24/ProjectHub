/** @format */

import { Bookmark, BookmarkX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useSavedProjects } from "../hooks/useProjects";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "week", secs: 604800 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function SavedCard({ project, onUnsave }) {
  const navigate = useNavigate();
  const mentorName = project.mentor?.name ?? "—";
  const students = project.students?.map((s) => s.name).join(", ") || "—";

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex flex-col gap-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug line-clamp-2">
            {project.title}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {mentorName} · {timeAgo(project.createdAt)}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onUnsave(project._id); }}
          title="Remove from saved"
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <BookmarkX className="w-3.5 h-3.5" />
          Unsave
        </button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {project.description}
        </p>
      )}

      {/* Students */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <span className="font-medium text-slate-500 dark:text-slate-400">Students: </span>
        {students}
      </p>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <StatusBadge status={project.status} />
        {project.pdfFileName && (
          <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]" title={project.pdfFileName}>
            📄 {project.pdfFileName}
          </span>
        )}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-1/3" />
        </div>
        <div className="h-7 w-16 bg-slate-100 dark:bg-slate-700/60 rounded-lg" />
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full" />
      <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-5/6" />
      <div className="h-6 bg-slate-100 dark:bg-slate-700/60 rounded-full w-20 mt-2" />
    </div>
  );
}

export default function SavedProjects() {
  const { projects, loading, error, toggleSave } = useSavedProjects();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="w-full px-8 pt-24 pb-10 space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Saved Projects</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading…" : `${projects.length} saved project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-5">
              <Bookmark className="w-10 h-10 text-indigo-300 dark:text-indigo-500" />
            </div>
            <h2 className="text-slate-700 dark:text-slate-200 font-bold text-xl">No saved projects yet</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-sm">
              Click the <strong>Save</strong> button on any project card to bookmark it here.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <SavedCard key={p._id} project={p} onUnsave={toggleSave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
