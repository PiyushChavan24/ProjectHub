/** @format */

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, User, Users, Calendar, Clock, FileDown } from "lucide-react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import PlagiarismReport from "../components/PlagiarismReport";
import DownloadPDFButton from "../components/DownloadPDFButton";
import { useProject } from "../hooks/useProjects";
import { downloadPlagiarismReportPDF } from "../utils/reportPdf";

function InfoCard({ icon: Icon, label, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, error } = useProject(id);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="w-full px-8 pt-24 pb-10 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-xl w-2/3" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-32 bg-slate-200 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="h-28 bg-slate-200 rounded-2xl" />
                <div className="h-28 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="p-5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Project detail */}
        {!loading && project && (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-7">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <StatusBadge status={project.status} />
                    {project.plagiarismReport?.highest_risk && (
                      <span className="text-xs text-slate-400 font-medium">
                        Plagiarism: {project.plagiarismReport.highest_risk}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted {formatDate(project.createdAt)}
                    </span>
                    {project.updatedAt !== project.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Updated {formatDate(project.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <DownloadPDFButton
                  projectId={project._id}
                  projectTitle={project.title}
                  hasPdf={!!project.pdfFileName}
                  hasPdfData={project.hasPdfData}
                  size="md"
                />
              </div>
            </div>

            {/* Body grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column — description + plagiarism + review note */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                    Description
                  </h2>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>

                {/* Plagiarism report */}
                {project.plagiarismReport?.highest_risk && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Plagiarism Analysis
                      </h2>
                      <button
                        onClick={() => downloadPlagiarismReportPDF(project)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Download Report
                      </button>
                    </div>
                    <PlagiarismReport
                      report={project.plagiarismReport}
                      pdfFileName={project.pdfFileName}
                    />
                  </div>
                )}

                {/* Review note */}
                {project.reviewNote && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
                      Mentor Feedback
                    </h2>
                    <p className="text-sm text-amber-900 leading-relaxed italic">
                      "{project.reviewNote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Right column — mentor, students, pdf */}
              <div className="space-y-4">
                {/* Mentor */}
                <InfoCard icon={User} label="Mentor">
                  <div>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {project.mentor?.name ?? "—"}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                      {project.mentor?.email ?? ""}
                    </p>
                  </div>
                </InfoCard>

                {/* Students */}
                <InfoCard icon={Users} label="Contributors">
                  <ul className="space-y-2.5">
                    {project.students?.map((s) => (
                      <li key={s._id} className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {s.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{s.email}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>

                {/* PDF */}
                {project.pdfFileName && (
                  <InfoCard icon={FileText} label="Submission">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono break-all">
                      {project.pdfFileName}
                    </p>
                  </InfoCard>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
