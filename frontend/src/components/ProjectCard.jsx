/** @format */

// /** @format */

// // /** @format */

// // // /** @format */

// // // import { useState } from "react";
// // // import { Bookmark, FileText, ChevronDown } from "lucide-react";
// // // import StatusBadge from "./StatusBadge";
// // // import PlagiarismReport from "./PlagiarismReport";

// // // /**
// // //  * Shared project card — Student / Mentor / Admin dashboards.
// // //  * Restyled to match a clean job-board aesthetic.
// // //  *
// // //  * Props:
// // //  *  project  – populated Project document (includes plagiarismReport)
// // //  *  actions  – optional JSX rendered in the card footer
// // //  *  saved    – optional boolean for the bookmark state
// // //  *  onSave   – optional handler for bookmark toggle
// // //  */
// // // export default function ProjectCard({
// // //  project,
// // //  actions,
// // //  saved = false,
// // //  onSave,
// // // }) {
// // //  const [expanded, setExpanded] = useState(false);

// // //  const studentNames = project.students?.map((s) => s.name).join(", ") ?? "—";
// // //  const mentorName = project.mentor?.name ?? "—";
// // //  const hasReport = !!project.plagiarismReport?.highest_risk;

// // //  // Relative time helper — "5 days ago", "1 day ago", "3 months ago"
// // //  const timeAgo = (date) => {
// // //   const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
// // //   const intervals = [
// // //    { label: "year", secs: 31536000 },
// // //    { label: "month", secs: 2592000 },
// // //    { label: "week", secs: 604800 },
// // //    { label: "day", secs: 86400 },
// // //    { label: "hour", secs: 3600 },
// // //    { label: "minute", secs: 60 },
// // //   ];
// // //   for (const i of intervals) {
// // //    const count = Math.floor(seconds / i.secs);
// // //    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
// // //   }
// // //   return "just now";
// // //  };

// // //  // Initial / icon for the avatar circle (use mentor initial as fallback)
// // //  const initial = (mentorName?.[0] ?? project.title?.[0] ?? "?").toUpperCase();

// // //  // Tags: pull from project.tags if present, else fall back to status + mentor type
// // //  const tags = project.tags?.length
// // //   ? project.tags
// // //   : [project.type, project.mode].filter(Boolean);

// // //  return (
// // //   <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow flex flex-col gap-4">
// // //    {/* ── Top row: avatar + bookmark ── */}
// // //    <div className="flex items-start justify-between">
// // //     <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
// // //      {initial}
// // //     </div>

// // //     <button
// // //      onClick={onSave}
// // //      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
// // //       saved
// // //        ? "bg-slate-900 text-white"
// // //        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// // //      }`}>
// // //      {saved ? "Saved" : "Save"}
// // //      <Bookmark className="w-3 h-3" fill={saved ? "white" : "none"} />
// // //     </button>
// // //    </div>

// // //    {/* ── Org + posted date ── */}
// // //    <div className="flex items-center gap-2 text-xs">
// // //     <span className="font-semibold text-slate-800">{mentorName}</span>
// // //     <span className="text-slate-400">{timeAgo(project.createdAt)}</span>
// // //    </div>

// // //    {/* ── Title ── */}
// // //    <h3 className="text-lg font-bold text-slate-900 leading-snug -mt-2">
// // //     {project.title}
// // //    </h3>

// // //    {/* ── Tags ── */}
// // //    {tags.length > 0 && (
// // //     <div className="flex flex-wrap gap-2 -mt-1">
// // //      {tags.map((t) => (
// // //       <span
// // //        key={t}
// // //        className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
// // //        {t}
// // //       </span>
// // //      ))}
// // //     </div>
// // //    )}

// // //    {/* ── Description (light gray, secondary) ── */}
// // //    {project.description && (
// // //     <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
// // //      {project.description}
// // //     </p>
// // //    )}

// // //    {/* ── Meta block (collapsed visual rhythm) ── */}
// // //    <div className="flex flex-col gap-1 text-xs">
// // //     <div className="flex items-center gap-2 text-slate-500">
// // //      <span className="font-medium text-slate-400 w-14 shrink-0">Students</span>
// // //      <span className="text-slate-700 font-medium truncate">{studentNames}</span>
// // //     </div>
// // //     {project.pdfFileName && (
// // //      <div className="flex items-center gap-2 text-slate-500">
// // //       <FileText className="w-3 h-3 text-slate-400" />
// // //       <span className="text-slate-600 font-mono truncate">
// // //        {project.pdfFileName}
// // //       </span>
// // //      </div>
// // //     )}
// // //     {project.reviewNote && (
// // //      <div className="flex items-start gap-2 mt-1">
// // //       <span className="font-medium text-slate-400 w-14 shrink-0">Note</span>
// // //       <span className="text-slate-600 italic line-clamp-2">
// // //        {project.reviewNote}
// // //       </span>
// // //      </div>
// // //     )}
// // //    </div>

// // //    {/* ── Plagiarism Report ── */}
// // //    {hasReport && (
// // //     <div className="border-t border-slate-100 pt-3">
// // //      <div className="flex items-center justify-between">
// // //       <PlagiarismReport
// // //        report={project.plagiarismReport}
// // //        pdfFileName={project.pdfFileName}
// // //        compact
// // //       />
// // //       <button
// // //        onClick={() => setExpanded((v) => !v)}
// // //        className="text-xs text-slate-500 hover:text-slate-900 ml-3 shrink-0 flex items-center gap-1">
// // //        {expanded ? "Hide" : "Details"}
// // //        <ChevronDown
// // //         className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
// // //        />
// // //       </button>
// // //      </div>

// // //      {expanded && (
// // //       <div className="mt-3">
// // //        <PlagiarismReport
// // //         report={project.plagiarismReport}
// // //         pdfFileName={project.pdfFileName}
// // //        />
// // //       </div>
// // //      )}
// // //     </div>
// // //    )}

// // //    {/* ── Footer: status (left) + actions (right, dark CTA) ── */}
// // //    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
// // //     <StatusBadge status={project.status} />
// // //     {actions && <div className="flex items-center gap-2">{actions}</div>}
// // //    </div>
// // //   </div>
// // //  );
// // // }

// // /** @format */

// // import { useState } from "react";
// // import { Bookmark, ChevronDown } from "lucide-react";
// // import StatusBadge from "./StatusBadge";
// // import PlagiarismReport from "./PlagiarismReport";

// // /**
// //  * Shared project card — Student / Mentor / Admin dashboards.
// //  * Restyled to match a clean job-board aesthetic.
// //  *
// //  * Props:
// //  *  project  – populated Project document (includes plagiarismReport)
// //  *  actions  – optional JSX rendered in the card footer
// //  *  saved    – optional boolean for the bookmark state
// //  *  onSave   – optional handler for bookmark toggle
// //  */
// // export default function ProjectCard({
// //  project,
// //  actions,
// //  saved = false,
// //  onSave,
// // }) {
// //  const [expanded, setExpanded] = useState(false);

// //  const studentNames = project.students?.map((s) => s.name).join(", ") ?? "—";
// //  const mentorName = project.mentor?.name ?? "—";
// //  const hasReport = !!project.plagiarismReport?.highest_risk;

// //  // Relative time helper — "5 days ago", "1 day ago", "3 months ago"
// //  const timeAgo = (date) => {
// //   const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
// //   const intervals = [
// //    { label: "year", secs: 31536000 },
// //    { label: "month", secs: 2592000 },
// //    { label: "week", secs: 604800 },
// //    { label: "day", secs: 86400 },
// //    { label: "hour", secs: 3600 },
// //    { label: "minute", secs: 60 },
// //   ];
// //   for (const i of intervals) {
// //    const count = Math.floor(seconds / i.secs);
// //    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
// //   }
// //   return "just now";
// //  };

// //  // Initial / icon for the avatar circle (use mentor initial as fallback)
// //  const initial = (mentorName?.[0] ?? project.title?.[0] ?? "?").toUpperCase();

// //  // Tags: pull from project.tags if present, else fall back to status + mentor type
// //  const tags = project.tags?.length
// //   ? project.tags
// //   : [project.type, project.mode].filter(Boolean);

// //  return (
// //   <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow flex flex-col gap-4 font-inter">
// //    {/* ── Top row: avatar + bookmark ── */}
// //    <div className="flex items-start justify-between">
// //     <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
// //      {initial}
// //     </div>

// //     <button
// //      onClick={onSave}
// //      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
// //       saved
// //        ? "bg-slate-900 text-white"
// //        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// //      }`}>
// //      {saved ? "Saved" : "Save"}
// //      <Bookmark className="w-3 h-3" fill={saved ? "white" : "none"} />
// //     </button>
// //    </div>

// //    {/* ── Org + posted date ── */}
// //    <div className="flex items-center gap-2 text-xs">
// //     <span className="font-semibold text-slate-800">{mentorName}</span>
// //     <span className="text-slate-400">{timeAgo(project.createdAt)}</span>
// //    </div>

// //    {/* ── Title ── */}
// //    <h3 className="text-lg font-bold text-slate-900 leading-snug -mt-2">
// //     {project.title}
// //    </h3>

// //    {/* ── Tags ── */}
// //    {tags.length > 0 && (
// //     <div className="flex flex-wrap gap-2 -mt-1">
// //      {tags.map((t) => (
// //       <span
// //        key={t}
// //        className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
// //        {t}
// //       </span>
// //      ))}
// //     </div>
// //    )}

// //    {/* ── Description (light gray, secondary) ── */}
// //    {project.description && (
// //     <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
// //      {project.description}
// //     </p>
// //    )}

// //    {/* ── Meta block (collapsed visual rhythm) ── */}
// //    <div className="flex flex-col gap-1 text-xs">
// //     <div className="flex items-center gap-2 text-slate-500">
// //      <span className="font-medium text-slate-400 w-14 shrink-0">Students</span>
// //      <span className="text-slate-700 font-medium truncate">{studentNames}</span>
// //     </div>
// //     {project.reviewNote && (
// //      <div className="flex items-start gap-2 mt-1">
// //       <span className="font-medium text-slate-400 w-14 shrink-0">Note</span>
// //       <span className="text-slate-600 italic line-clamp-2">
// //        {project.reviewNote}
// //       </span>
// //      </div>
// //     )}
// //    </div>

// //    {/* ── Plagiarism Report ── */}
// //    {hasReport && (
// //     <div className="border-t border-slate-100 pt-3">
// //      <div className="flex items-center justify-between">
// //       <PlagiarismReport report={project.plagiarismReport} compact />
// //       <button
// //        onClick={() => setExpanded((v) => !v)}
// //        className="text-xs text-slate-500 hover:text-slate-900 ml-3 shrink-0 flex items-center gap-1">
// //        {expanded ? "Hide" : "Details"}
// //        <ChevronDown
// //         className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
// //        />
// //       </button>
// //      </div>

// //      {expanded && (
// //       <div className="mt-3">
// //        <PlagiarismReport report={project.plagiarismReport} />
// //       </div>
// //      )}
// //     </div>
// //    )}

// //    {/* ── Footer: status (left) + actions (right, dark CTA) ── */}
// //    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
// //     <StatusBadge status={project.status} />
// //     {actions && <div className="flex items-center gap-2">{actions}</div>}
// //    </div>
// //   </div>
// //  );
// // }

// /** @format */

// import { useState } from "react";
// import { Bookmark } from "lucide-react";
// import StatusBadge from "./StatusBadge";

// /**
//  * Shared project card — Student / Mentor / Admin dashboards.
//  * Restyled to match a clean job-board aesthetic.
//  *
//  * Props:
//  *  project  – populated Project document (includes plagiarismReport)
//  *  actions  – optional JSX rendered in the card footer
//  *  saved    – optional boolean for the bookmark state
//  *  onSave   – optional handler for bookmark toggle
//  */
// export default function ProjectCard({
//  project,
//  actions,
//  saved = false,
//  onSave,
// }) {
//  const studentNames = project.students?.map((s) => s.name).join(", ") ?? "—";
//  const mentorName = project.mentor?.name ?? "—";

//  // Relative time helper — "5 days ago", "1 day ago", "3 months ago"
//  const timeAgo = (date) => {
//   const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
//   const intervals = [
//    { label: "year", secs: 31536000 },
//    { label: "month", secs: 2592000 },
//    { label: "week", secs: 604800 },
//    { label: "day", secs: 86400 },
//    { label: "hour", secs: 3600 },
//    { label: "minute", secs: 60 },
//   ];
//   for (const i of intervals) {
//    const count = Math.floor(seconds / i.secs);
//    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
//   }
//   return "just now";
//  };

//  // Initial / icon for the avatar circle (use mentor initial as fallback)
//  const initial = (mentorName?.[0] ?? project.title?.[0] ?? "?").toUpperCase();

//  // Tags: pull from project.tags if present, else fall back to status + mentor type
//  const tags = project.tags?.length
//   ? project.tags
//   : [project.type, project.mode].filter(Boolean);

//  return (
//   <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow flex flex-col gap-4 font-inter">
//    {/* ── Top row: avatar + bookmark ── */}
//    <div className="flex items-start justify-between">
//     <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
//      {initial}
//     </div>

//     <button
//      onClick={onSave}
//      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
//       saved
//        ? "bg-slate-900 text-white"
//        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//      }`}>
//      {saved ? "Saved" : "Save"}
//      <Bookmark className="w-3 h-3" fill={saved ? "white" : "none"} />
//     </button>
//    </div>

//    {/* ── Org + posted date ── */}
//    <div className="flex items-center gap-2 text-xs">
//     <span className="font-semibold text-slate-800">{mentorName}</span>
//     <span className="text-slate-400">{timeAgo(project.createdAt)}</span>
//    </div>

//    {/* ── Title ── */}
//    <h3 className="text-lg font-bold text-slate-900 leading-snug -mt-2">
//     {project.title}
//    </h3>

//    {/* ── Tags ── */}
//    {tags.length > 0 && (
//     <div className="flex flex-wrap gap-2 -mt-1">
//      {tags.map((t) => (
//       <span
//        key={t}
//        className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
//        {t}
//       </span>
//      ))}
//     </div>
//    )}

//    {/* ── Description (light gray, secondary) ── */}
//    {project.description && (
//     <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
//      {project.description}
//     </p>
//    )}

//    {/* ── Meta block (collapsed visual rhythm) ── */}
//    <div className="flex flex-col gap-1 text-xs">
//     <div className="flex items-center gap-2 text-slate-500">
//      <span className="font-medium text-slate-400 w-14 shrink-0">Students</span>
//      <span className="text-slate-700 font-medium truncate">{studentNames}</span>
//     </div>
//     {project.reviewNote && (
//      <div className="flex items-start gap-2 mt-1">
//       <span className="font-medium text-slate-400 w-14 shrink-0">Note</span>
//       <span className="text-slate-600 italic line-clamp-2">
//        {project.reviewNote}
//       </span>
//      </div>
//     )}
//    </div>

//    {/* ── Footer: status (left) + actions (right, dark CTA) ── */}
//    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
//     <StatusBadge status={project.status} />
//     {actions && <div className="flex items-center gap-2">{actions}</div>}
//    </div>
//   </div>
//  );
// }

/** @format */

import { useNavigate } from "react-router-dom";
import { Bookmark, Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

/**
 * Shared project card — Student / Mentor / Admin dashboards.
 * Restyled with animations and gradient effects.
 *
 * Props:
 *  project  – populated Project document
 *  actions  – optional JSX rendered in the card footer
 *  saved    – optional boolean for the bookmark state
 *  onSave   – optional handler for bookmark toggle
 *  index    – optional number for staggered animation
 */
export default function ProjectCard({
 project,
 actions,
 saved = false,
 onSave,
 index = 0,
}) {
 const navigate = useNavigate();
 const studentNames = project.students?.map((s) => s.name).join(", ") ?? "—";
 const mentorName = project.mentor?.name ?? "—";

 // Relative time helper — "5 days ago", "1 day ago", "3 months ago"
 const timeAgo = (date) => {
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
 };

 // Initial / icon for the avatar circle (use mentor initial as fallback)
 const initial = (mentorName?.[0] ?? project.title?.[0] ?? "?").toUpperCase();

 // Tags: pull from project.tags if present, else fall back to status + mentor type
 const tags = project.tags?.length
  ? project.tags
  : [project.type, project.mode].filter(Boolean);

 // Status-based accent colors
 const accentGradient =
  project.status === "approved"
   ? "from-emerald-500/80 to-emerald-500/20"
   : project.status === "rejected"
     ? "from-red-500/80 to-red-500/20"
     : "from-indigo-500/80 to-indigo-500/20";

 return (
  <div
   onClick={() => navigate(`/projects/${project._id}`)}
   style={{
    animationDelay: `${index * 100}ms`,
    animationFillMode: "forwards",
   }}
   className="group relative block overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 opacity-0 animate-fade-in transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-indigo-500/5">
   {/* Animated gradient glow */}
   <div
    aria-hidden
    className={`pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-br opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-40 ${accentGradient}`}
   />

   {/* Shimmer sweep */}
   <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-slate-900/5 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
   />

   {/* Content */}
   <div className="relative z-10 flex flex-col gap-4">
    {/* ── Top row: avatar + bookmark ── */}
    <div className="flex items-start justify-between">
     <span
      className={`grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br ${accentGradient} text-white shadow-sm transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
      <Sparkles className="h-6 w-6" />
     </span>

     <button
      onClick={(e) => { e.stopPropagation(); onSave?.(e); }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
       saved
        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
      }`}>
      {saved ? "Saved" : "Save"}
      <Bookmark className="w-4 h-4" fill={saved ? "white" : "none"} />
     </button>
    </div>

    {/* ── Org + posted date ── */}
    <div className="flex items-center gap-2 text-sm">
     <span className="font-semibold text-slate-800 dark:text-slate-100">{mentorName}</span>
     <span className="text-slate-400 dark:text-slate-500">{timeAgo(project.createdAt)}</span>
    </div>

    {/* ── Title ── */}
    <h3 className="bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent leading-snug -mt-2">
     {project.title}
    </h3>

    {/* ── Tags ── */}
    {tags.length > 0 && (
     <div className="flex flex-wrap gap-2 -mt-1">
      {tags.map((t) => (
       <span
        key={t}
        className="rounded-full border border-slate-200/60 dark:border-slate-600/60 bg-slate-50/50 dark:bg-slate-700/50 px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors duration-300">
        {t}
       </span>
      ))}
     </div>
    )}

    {/* ── Description (light gray, secondary) ── */}
    {project.description && (
     <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
      {project.description}
     </p>
    )}

    {/* ── Meta block (collapsed visual rhythm) ── */}
    <div className="flex flex-col gap-1.5 text-sm">
     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <span className="font-medium text-slate-400 dark:text-slate-500 w-16 shrink-0">Students</span>
      <span className="text-slate-700 dark:text-slate-200 font-medium truncate">
       {studentNames}
      </span>
     </div>
     {project.reviewNote && (
      <div className="flex items-start gap-2 mt-1">
       <span className="font-medium text-slate-400 dark:text-slate-500 w-16 shrink-0">Note</span>
       <span className="text-slate-600 dark:text-slate-400 italic line-clamp-2">
        {project.reviewNote}
       </span>
      </div>
     )}
    </div>

    {/* ── Footer: status (left) + actions (right) ── */}
    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
     <StatusBadge status={project.status} />
     {actions && (
      <div
       className="flex items-center gap-2"
       onClick={(e) => e.stopPropagation()}>
       {actions}
      </div>
     )}
    </div>
   </div>

   {/* Corner accent line */}
   <div
    aria-hidden
    className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-linear-to-r from-indigo-500 to-transparent transition-all duration-700 group-hover:w-full"
   />
  </div>
 );
}
