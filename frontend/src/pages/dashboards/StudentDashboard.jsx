/** @format */

// /** @format */

// // import { useState } from 'react';
// // import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
// // import { useAuth } from '../../context/AuthContext';
// // import Navbar from '../../components/Navbar';
// // import ProjectCard from '../../components/ProjectCard';
// // import ProposeProjectModal from '../../components/ProposeProjectModal';
// // import EditProjectModal from '../../components/EditProjectModal';
// // import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
// // import { useStudentProjects } from '../../hooks/useProjects';

// // export default function StudentDashboard() {
// //   const { auth } = useAuth();

// //   // ── Live project data ──────────────────────────────────────────────────────
// //   const { projects, loading, error, refresh } = useStudentProjects();

// //   // ── Modal state ────────────────────────────────────────────────────────────
// //   const [showPropose, setShowPropose]   = useState(false);
// //   const [editTarget,  setEditTarget]    = useState(null); // project to edit
// //   const [deleteTarget, setDeleteTarget] = useState(null); // project to delete

// //   // ── Derived stats ──────────────────────────────────────────────────────────
// //   const pending  = projects.filter((p) => p.status === 'pending').length;
// //   const approved = projects.filter((p) => p.status === 'approved').length;
// //   const rejected = projects.filter((p) => p.status === 'rejected').length;

// //   // ── Handlers ───────────────────────────────────────────────────────────────
// //   const handleCreated = () => refresh();

// //   const handleUpdated = (updatedProject) => {
// //     // Refresh full list so the card shows the latest data
// //     refresh();
// //   };

// //   const handleDeleted = (deletedId) => {
// //     refresh();
// //   };

// //   // ── Render ─────────────────────────────────────────────────────────────────
// //   return (
// //     <div className="min-h-screen bg-slate-50">
// //       <Navbar />

// //       <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

// //         {/* ── Page header ── */}
// //         <div className="flex items-start justify-between flex-wrap gap-4">
// //           <div>
// //             <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
// //             <p className="text-slate-500 mt-1">
// //               Welcome back, <span className="font-medium text-slate-700">{auth.user.name}</span>!
// //               Manage your project proposals below.
// //             </p>
// //           </div>
// //           <button
// //             onClick={() => setShowPropose(true)}
// //             className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors"
// //           >
// //             <Plus className="w-4 h-4" />
// //             Propose Project
// //           </button>
// //         </div>

// //         {/* ── Stats row ── */}
// //         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
// //           {[
// //             { label: 'Total Projects',   value: projects.length, icon: '🗂️', color: 'bg-indigo-50  border-indigo-200'  },
// //             { label: 'Awaiting Review',  value: pending,         icon: '⏳', color: 'bg-amber-50   border-amber-200'   },
// //             { label: 'Approved',         value: approved,        icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
// //             { label: 'Rejected',         value: rejected,        icon: '❌', color: 'bg-red-50     border-red-200'     },
// //           ].map((s) => (
// //             <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
// //               <div className="text-2xl mb-1">{s.icon}</div>
// //               <div className="text-2xl font-bold text-slate-800">{s.value}</div>
// //               <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* ── Project grid ── */}
// //         {loading ? (
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {[1, 2, 3, 4].map((i) => (
// //               <div key={i} className="h-52 bg-white rounded-2xl border border-slate-200 animate-pulse" />
// //             ))}
// //           </div>
// //         ) : error ? (
// //           <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
// //             {error}
// //           </div>
// //         ) : projects.length === 0 ? (
// //           /* ── Empty state ── */
// //           <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-14 flex flex-col items-center text-center">
// //             <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
// //               <FolderOpen className="w-8 h-8 text-indigo-400" />
// //             </div>
// //             <h3 className="text-slate-700 font-semibold text-lg">No projects yet</h3>
// //             <p className="text-slate-400 text-sm mt-1 max-w-xs">
// //               Click &quot;Propose Project&quot; to submit your first project for mentor review.
// //             </p>
// //             <button
// //               onClick={() => setShowPropose(true)}
// //               className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
// //             >
// //               <Plus className="w-4 h-4" />
// //               Propose Project
// //             </button>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {projects.map((p) => (
// //               <ProjectCard
// //                 key={p._id}
// //                 project={p}
// //                 actions={
// //                   <>
// //                     {/* Edit — only while pending (approved/rejected already reviewed) */}
// //                     <button
// //                       onClick={() => setEditTarget(p)}
// //                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
// //                     >
// //                       <Pencil className="w-3.5 h-3.5" />
// //                       Edit
// //                     </button>

// //                     {/* Delete */}
// //                     <button
// //                       onClick={() => setDeleteTarget(p)}
// //                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
// //                     >
// //                       <Trash2 className="w-3.5 h-3.5" />
// //                       Delete
// //                     </button>

// //                     {/* Status hint on the right */}
// //                     {p.status === 'approved' && (
// //                       <span className="ml-auto text-xs text-emerald-600 font-medium">
// //                         ✓ Approved
// //                       </span>
// //                     )}
// //                     {p.status === 'rejected' && (
// //                       <span className="ml-auto text-xs text-red-500 font-medium">
// //                         ✕ Rejected
// //                       </span>
// //                     )}
// //                   </>
// //                 }
// //               />
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* ── Modals ── */}
// //       {showPropose && (
// //         <ProposeProjectModal
// //           onClose={() => setShowPropose(false)}
// //           onCreated={handleCreated}
// //         />
// //       )}

// //       {editTarget && (
// //         <EditProjectModal
// //           project={editTarget}
// //           onClose={() => setEditTarget(null)}
// //           onUpdated={handleUpdated}
// //         />
// //       )}

// //       {deleteTarget && (
// //         <ConfirmDeleteModal
// //           project={deleteTarget}
// //           onClose={() => setDeleteTarget(null)}
// //           onDeleted={handleDeleted}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import Navbar from "../../components/Navbar";
// import ProjectCard from "../../components/ProjectCard";
// import ProposeProjectModal from "../../components/ProposeProjectModal";
// import EditProjectModal from "../../components/EditProjectModal";
// import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
// import { useStudentProjects } from "../../hooks/useProjects";

// export default function StudentDashboard() {
//  const { auth } = useAuth();

//  // ── Live project data ──────────────────────────────────────────────────────
//  const { projects, loading, error, refresh } = useStudentProjects();

//  // ── Modal state ────────────────────────────────────────────────────────────
//  const [showPropose, setShowPropose] = useState(false);
//  const [editTarget, setEditTarget] = useState(null); // project to edit
//  const [deleteTarget, setDeleteTarget] = useState(null); // project to delete

//  // ── Derived stats ──────────────────────────────────────────────────────────
//  const pending = projects.filter((p) => p.status === "pending").length;
//  const approved = projects.filter((p) => p.status === "approved").length;
//  const rejected = projects.filter((p) => p.status === "rejected").length;

//  // ── Handlers ───────────────────────────────────────────────────────────────
//  const handleCreated = () => refresh();

//  const handleUpdated = (updatedProject) => {
//   // Refresh full list so the card shows the latest data
//   refresh();
//  };

//  const handleDeleted = (deletedId) => {
//   refresh();
//  };

//  // ── Render ─────────────────────────────────────────────────────────────────
//  return (
//   <div className="min-h-screen bg-slate-50">
//    <Navbar />

//    {/* Added pt-24 for top padding to account for fixed navbar */}
//    <div className="max-w-6xl mx-auto px-6 pt-24 pb-8 space-y-8">
//     {/* ── Page header ── */}
//     <div className="flex items-start justify-between flex-wrap gap-4">
//      <div>
//       <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
//       <p className="text-slate-500 mt-1">
//        Welcome back,{" "}
//        <span className="font-medium text-slate-700">{auth.user.name}</span>!
//        Manage your project proposals below.
//       </p>
//      </div>
//      <button
//       onClick={() => setShowPropose(true)}
//       className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors">
//       <Plus className="w-4 h-4" />
//       Propose Project
//      </button>
//     </div>

//     {/* ── Stats row ── */}
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//      {[
//       {
//        label: "Total Projects",
//        value: projects.length,
//        icon: "🗂️",
//        color: "bg-indigo-50  border-indigo-200",
//       },
//       {
//        label: "Awaiting Review",
//        value: pending,
//        icon: "⏳",
//        color: "bg-amber-50   border-amber-200",
//       },
//       {
//        label: "Approved",
//        value: approved,
//        icon: "✅",
//        color: "bg-emerald-50 border-emerald-200",
//       },
//       {
//        label: "Rejected",
//        value: rejected,
//        icon: "❌",
//        color: "bg-red-50     border-red-200",
//       },
//      ].map((s) => (
//       <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
//        <div className="text-2xl mb-1">{s.icon}</div>
//        <div className="text-2xl font-bold text-slate-800">{s.value}</div>
//        <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
//       </div>
//      ))}
//     </div>

//     {/* ── Project grid ── */}
//     {loading ? (
//      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {[1, 2, 3, 4].map((i) => (
//        <div
//         key={i}
//         className="h-52 bg-white rounded-2xl border border-slate-200 animate-pulse"
//        />
//       ))}
//      </div>
//     ) : error ? (
//      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
//       {error}
//      </div>
//     ) : projects.length === 0 ? (
//      /* ── Empty state ── */
//      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-14 flex flex-col items-center text-center">
//       <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
//        <FolderOpen className="w-8 h-8 text-indigo-400" />
//       </div>
//       <h3 className="text-slate-700 font-semibold text-lg">No projects yet</h3>
//       <p className="text-slate-400 text-sm mt-1 max-w-xs">
//        Click &quot;Propose Project&quot; to submit your first project for mentor
//        review.
//       </p>
//       <button
//        onClick={() => setShowPropose(true)}
//        className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
//        <Plus className="w-4 h-4" />
//        Propose Project
//       </button>
//      </div>
//     ) : (
//      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {projects.map((p) => (
//        <ProjectCard
//         key={p._id}
//         project={p}
//         actions={
//          <>
//           {/* Edit — only while pending (approved/rejected already reviewed) */}
//           <button
//            onClick={() => setEditTarget(p)}
//            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
//            <Pencil className="w-3.5 h-3.5" />
//            Edit
//           </button>

//           {/* Delete */}
//           <button
//            onClick={() => setDeleteTarget(p)}
//            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
//            <Trash2 className="w-3.5 h-3.5" />
//            Delete
//           </button>

//           {/* Status hint on the right */}
//           {p.status === "approved" && (
//            <span className="ml-auto text-xs text-emerald-600 font-medium">
//             ✓ Approved
//            </span>
//           )}
//           {p.status === "rejected" && (
//            <span className="ml-auto text-xs text-red-500 font-medium">
//             ✕ Rejected
//            </span>
//           )}
//          </>
//         }
//        />
//       ))}
//      </div>
//     )}
//    </div>

//    {/* ── Modals ── */}
//    {showPropose && (
//     <ProposeProjectModal
//      onClose={() => setShowPropose(false)}
//      onCreated={handleCreated}
//     />
//    )}

//    {editTarget && (
//     <EditProjectModal
//      project={editTarget}
//      onClose={() => setEditTarget(null)}
//      onUpdated={handleUpdated}
//     />
//    )}

//    {deleteTarget && (
//     <ConfirmDeleteModal
//      project={deleteTarget}
//      onClose={() => setDeleteTarget(null)}
//      onDeleted={handleDeleted}
//     />
//    )}
//   </div>
//  );
// }

/** @format */

import { useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import ProjectCard from "../../components/ProjectCard";
import ProposeProjectModal from "../../components/ProposeProjectModal";
import EditProjectModal from "../../components/EditProjectModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { useStudentProjects, useSavedIds } from "../../hooks/useProjects";

export default function StudentDashboard() {
 const { auth } = useAuth();

 // ── Live project data ──────────────────────────────────────────────────────
 const { projects, loading, error, refresh } = useStudentProjects();
 const { savedIds, toggleSave } = useSavedIds();

 // ── Modal state ────────────────────────────────────────────────────────────
 const [showPropose, setShowPropose] = useState(false);
 const [editTarget, setEditTarget] = useState(null); // project to edit
 const [deleteTarget, setDeleteTarget] = useState(null); // project to delete

 // ── Derived stats ──────────────────────────────────────────────────────────
 const pending = projects.filter((p) => p.status === "pending").length;
 const approved = projects.filter((p) => p.status === "approved").length;
 const rejected = projects.filter((p) => p.status === "rejected").length;

 // ── Handlers ───────────────────────────────────────────────────────────────
 const handleCreated = () => refresh();

 const handleUpdated = (updatedProject) => {
  // Refresh full list so the card shows the latest data
  refresh();
 };

 const handleDeleted = (deletedId) => {
  refresh();
 };

 // ── Render ─────────────────────────────────────────────────────────────────
 return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
   <Navbar />

   <div className="w-full px-8 pt-24 pb-8 space-y-8">
    {/* ── Page header ── */}
    <div className="flex items-start justify-between flex-wrap gap-4">
     <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Projects</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">
       Welcome back,{" "}
       <span className="font-medium text-slate-700 dark:text-slate-200">{auth.user.name}</span>!
       Manage your project proposals below.
      </p>
     </div>
     <button
      onClick={() => setShowPropose(true)}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors">
      <Plus className="w-4 h-4" />
      Propose Project
     </button>
    </div>

    {/* ── Stats row ── */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
     {[
      { label: "Total Projects",  value: projects.length, icon: "🗂️", color: "bg-indigo-50  dark:bg-indigo-900/30 border-indigo-200  dark:border-indigo-800"  },
      { label: "Awaiting Review", value: pending,          icon: "⏳", color: "bg-amber-50   dark:bg-amber-900/30  border-amber-200   dark:border-amber-800"   },
      { label: "Approved",        value: approved,         icon: "✅", color: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800" },
      { label: "Rejected",        value: rejected,         icon: "❌", color: "bg-red-50     dark:bg-red-900/30    border-red-200     dark:border-red-800"     },
     ].map((s) => (
      <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
       <div className="text-2xl mb-1">{s.icon}</div>
       <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
       <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{s.label}</div>
      </div>
     ))}
    </div>

    {/* ── Project grid ── */}
    {loading ? (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
       <div
        key={i}
        className="h-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse"
       />
      ))}
     </div>
    ) : error ? (
     <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
      {error}
     </div>
    ) : projects.length === 0 ? (
     /* ── Empty state ── */
     <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
       <FolderOpen className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-lg">No projects yet</h3>
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs">
       Click &quot;Propose Project&quot; to submit your first project for mentor
       review.
      </p>
      <button
       onClick={() => setShowPropose(true)}
       className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
       <Plus className="w-4 h-4" />
       Propose Project
      </button>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
       <ProjectCard
        key={p._id}
        project={p}
        saved={savedIds.has(p._id)}
        onSave={() => toggleSave(p._id)}
        actions={
         <>
          {/* Edit — only while pending (approved/rejected already reviewed) */}
          <button
           onClick={() => setEditTarget(p)}
           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
           <Pencil className="w-3.5 h-3.5" />
           Edit
          </button>

          {/* Delete */}
          <button
           onClick={() => setDeleteTarget(p)}
           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
           <Trash2 className="w-3.5 h-3.5" />
           Delete
          </button>

          {/* Status hint on the right */}
          {p.status === "approved" && (
           <span className="ml-auto text-xs text-emerald-600 font-medium">
            ✓ Approved
           </span>
          )}
          {p.status === "rejected" && (
           <span className="ml-auto text-xs text-red-500 font-medium">
            ✕ Rejected
           </span>
          )}
         </>
        }
       />
      ))}
     </div>
    )}
   </div>

   {/* ── Modals ── */}
   {showPropose && (
    <ProposeProjectModal
     onClose={() => setShowPropose(false)}
     onCreated={handleCreated}
    />
   )}

   {editTarget && (
    <EditProjectModal
     project={editTarget}
     onClose={() => setEditTarget(null)}
     onUpdated={handleUpdated}
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
