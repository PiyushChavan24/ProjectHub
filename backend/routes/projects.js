/** @format */

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const pdfParse = require("pdf-parse");

const Project = require("../models/Project");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ── Multer — memory storage only (PDF buffer, never touches disk) ─────────────
const upload = multer({
 storage: multer.memoryStorage(),
 limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB cap
 fileFilter: (_req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Only PDF files are allowed"));
 },
});

// ── HF Space config ───────────────────────────────────────────────────────────
const HF_BASE = "https://piyushchavan24-hpcm-ml-engine.hf.space";

function hfHeaders() {
 const h = { "Content-Type": "application/json" };
 if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "hf_your_token_here") {
  h["Authorization"] = `Bearer ${process.env.HF_TOKEN}`;
 }
 return h;
}

// ── Step 1: extract plain text from a PDF buffer ──────────────────────────────
async function extractTextFromPDF(buffer) {
 const data = await pdfParse(buffer);
 const text = data.text?.trim();
 if (!text || text.length < 20) {
  throw new Error(
   "PDF appears to be empty or image-only — cannot extract text for analysis.",
  );
 }
 return text;
}

// ── Built-in baseline corpus ──────────────────────────────────────────────────
// Always included so compare_against is never empty (API requires ≥1 document).
// These are generic academic excerpts that cover common topics.
const BASELINE_CORPUS = [
 {
  id: "baseline-cs-001",
  title: "Introduction to Computer Science Concepts",
  text:
   "Computer science is the study of computation, information, and automation. It involves both theoretical and practical aspects of computing. Key areas include algorithms, data structures, programming languages, software engineering, artificial intelligence, computer networks, and database systems. Algorithms are step-by-step procedures for solving problems efficiently. Data structures organise and store data for efficient access and modification.",
 },
 {
  id: "baseline-ml-001",
  title: "Machine Learning and Artificial Intelligence Overview",
  text:
   "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. Deep learning uses neural networks with multiple layers to model complex patterns in data. Natural language processing allows computers to understand and generate human language. Computer vision enables machines to interpret and understand visual information from the world.",
 },
 {
  id: "baseline-web-001",
  title: "Web Development and Software Engineering",
  text:
   "Web development encompasses the building and maintenance of websites and web applications. Front-end development involves creating user interfaces using HTML, CSS, and JavaScript. Back-end development handles server-side logic, databases, and APIs. Software engineering applies engineering principles to software development including design patterns, testing methodologies, version control, and agile development practices.",
 },
 {
  id: "baseline-db-001",
  title: "Database Systems and Data Management",
  text:
   "A database management system is software that interacts with end users, applications, and the database itself to capture and analyse data. Relational databases store data in structured tables with relationships between them. SQL is used to query and manipulate relational data. NoSQL databases provide flexible schemas for storing unstructured or semi-structured data at scale.",
 },
 {
  id: "baseline-net-001",
  title: "Computer Networks and Security",
  text:
   "Computer networks enable communication and resource sharing between devices. The OSI model defines seven layers of network communication. TCP/IP is the foundational protocol suite of the internet. Network security involves protecting systems from unauthorised access, data breaches, and cyber attacks. Encryption, firewalls, and authentication mechanisms are used to secure network communications.",
 },
];

// ── Step 2: POST /compare — compare project text against all existing docs ────
async function runPlagiarismCheck(projectId, projectText, suspectDocs) {
 // Merge DB docs with baseline corpus; deduplicate by id
 const baselineIds = new Set(BASELINE_CORPUS.map((d) => d.id));
 const dbFiltered = suspectDocs.filter((d) => !baselineIds.has(d.id));
 const compareAgainst = [...BASELINE_CORPUS, ...dbFiltered];

 const payload = {
  project_id: projectId,
  project_text: projectText,
  compare_against: compareAgainst,
  use_layer4: true,
 };

 try {
  const { data } = await axios.post(`${HF_BASE}/compare`, payload, {
   headers: hfHeaders(),
   timeout: 180_000, // 3 min — HF cold-start can be slow
   maxContentLength: Infinity,
   maxBodyLength: Infinity,
  });

  console.log(
   "[Plagiarism API] raw response:",
   JSON.stringify(data).slice(0, 300),
  );
  return data; // { highest_risk, highest_score, total_comparisons, total_elapsed_seconds, ... }
 } catch (err) {
  const status = err.response?.status;
  const body = JSON.stringify(err.response?.data ?? err.message);
  console.error(`[Plagiarism API] ${status ?? "NETWORK"} —`, body);

  if (status === 401 || status === 403) {
   throw new Error("HF Space returned 401/403 — check your HF_TOKEN in .env.");
  }
  if (status === 422) {
   throw new Error(`Model rejected the request (422): ${body}`);
  }
  throw new Error(`Plagiarism API error (${status ?? "no response"}): ${body}`);
 }
}

// ── Helper: standard populate config ─────────────────────────────────────────
const POPULATE_OPTS = [
 { path: "students", select: "name email role" },
 { path: "mentor", select: "name email role" },
];

/**
 * Append a virtual `hasPdfData` boolean to every project in an array.
 * We do a single lean query selecting only _id + pdfData existence so
 * we never load the full binary into memory.
 */
async function attachPdfDataFlags(projects) {
 if (!projects.length) return projects;
 const ids = projects.map((p) => p._id ?? p.id);
 // Fetch only the _id + pdfData field (select:false so must be explicit)
 const rows = await require("../models/Project")
  .find({ _id: { $in: ids } })
  .select("+pdfData")
  .lean();

 const flagMap = {};
 for (const r of rows) {
  flagMap[r._id.toString()] = !!(r.pdfData && r.pdfData.length > 0);
 }

 return projects.map((p) => {
  const plain = p.toObject ? p.toObject() : { ...p };
  plain.hasPdfData = flagMap[plain._id?.toString()] ?? false;
  return plain;
 });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/mentors
// ─────────────────────────────────────────────────────────────────────────────
router.get("/users/mentors", authenticate, async (req, res) => {
 try {
  const mentors = await User.find({ role: "mentor" }).select("name email");
  res.json(mentors);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/students
// ─────────────────────────────────────────────────────────────────────────────
router.get("/users/students", authenticate, async (req, res) => {
 try {
  const students = await User.find({ role: "student" }).select("name email");
  res.json(students);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects  — student creates a project + PDF plagiarism check
// ─────────────────────────────────────────────────────────────────────────────
router.post(
 "/projects",
 authenticate,
 authorize("student"),
 upload.single("pdf"), // field name must be "pdf"
 async (req, res) => {
  try {
   // ── 1. Validate required fields ────────────────────────────────────────
   const { title, description, mentorId, coStudentEmails } = req.body;

   if (!title || !description || !mentorId) {
    return res
     .status(400)
     .json({ message: "title, description and mentorId are required" });
   }
   if (!req.file) {
    return res.status(400).json({ message: "A PDF file is required" });
   }

   // ── 2. Validate mentor ─────────────────────────────────────────────────
   const mentorDoc = await User.findOne({ _id: mentorId, role: "mentor" });
   if (!mentorDoc) {
    return res.status(404).json({ message: "Mentor not found" });
   }

   // ── 3. Resolve co-student emails → ObjectIds ───────────────────────────
   let coStudentIds = [];
   const emailList = coStudentEmails
    ? Array.isArray(coStudentEmails)
      ? coStudentEmails
      : JSON.parse(coStudentEmails)
    : [];

   if (emailList.length > 0) {
    const coStudents = await User.find({
     email: { $in: emailList.map((e) => e.toLowerCase()) },
     role: "student",
    }).select("_id email");

    if (coStudents.length !== emailList.length) {
     const found = coStudents.map((s) => s.email.toLowerCase());
     const missing = emailList.filter((e) => !found.includes(e.toLowerCase()));
     return res.status(404).json({
      message: `Student email(s) not found: ${missing.join(", ")}`,
     });
    }
    coStudentIds = coStudents.map((s) => s._id);
   }

   const allStudentIds = [
    ...new Set([req.user.id, ...coStudentIds.map(String)]),
   ];

   // ── 4a. Extract plain text from the PDF buffer ─────────────────────────
   let extractedText;
   try {
    extractedText = await extractTextFromPDF(req.file.buffer);
   } catch (pdfErr) {
    return res.status(400).json({ message: pdfErr.message });
   }

   // ── 4b. Build suspect corpus from all existing projects that have text ──
   const existingProjects = await Project.find(
    { extractedText: { $exists: true, $ne: null } },
    { _id: 1, title: 1, extractedText: 1 }, // lean select
   ).lean();

   const suspectDocs = existingProjects.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    text: p.extractedText,
   }));

   console.log(
    `[Plagiarism] comparing against ${suspectDocs.length} existing project(s)`,
   );

   // ── 4c. Run plagiarism check via POST /compare ─────────────────────────
   let plagiarismReport;
   try {
    // Use a temp string id before the doc is saved
    const tempId = `${req.user.id}-${Date.now()}`;
    const result = await runPlagiarismCheck(tempId, extractedText, suspectDocs);

    plagiarismReport = {
     highest_risk: result.highest_risk ?? "LOW",
     highest_score: result.highest_score ?? 0,
     total_comparisons: result.total_comparisons ?? suspectDocs.length,
     total_elapsed_seconds: result.total_elapsed_seconds ?? null,
     checkedAt: new Date(),
    };
   } catch (apiErr) {
    console.error("Plagiarism API error:", apiErr.message);
    return res.status(502).json({ message: apiErr.message });
   }

   // ── 5. Save project ────────────────────────────────────────────────────
   // pdfData stores the raw buffer so the download endpoint can serve it.
   // extractedText is kept for future plagiarism comparisons.
   const project = await Project.create({
    title,
    description,
    mentor: mentorId,
    students: allStudentIds,
    pdfFileName: req.file.originalname,
    pdfMimeType: req.file.mimetype,
    pdfData: req.file.buffer, // ← persisted binary (select:false)
    extractedText,
    plagiarismReport,
   });

   const populated = await project.populate(POPULATE_OPTS);
   res
    .status(201)
    .json({ message: "Project proposal submitted", project: populated });
  } catch (err) {
   console.error("Create project error:", err);
   if (err.name === "ValidationError") {
    return res.status(400).json({
     message: Object.values(err.errors)
      .map((e) => e.message)
      .join(", "),
    });
   }
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/approved  — public gallery (any authenticated role)
// Returns only projects where status === 'approved'.
// Supports optional ?search= query param for title / student-name filtering.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/projects/approved", authenticate, async (req, res) => {
 try {
  const projects = await Project.find({ status: "approved" })
   .select("-extractedText")        // exclude full PDF text (can be MBs per doc)
   .populate({ path: "students", select: "name email" })
   .populate({ path: "mentor", select: "name email" })
   .sort({ updatedAt: -1 })
   .lean();

  if (!projects.length) return res.json([]);

  // Inline pdfData flag — avoids loading binary data into memory
  const ids = projects.map((p) => p._id);
  const pdfFlags = await Project.find(
   { _id: { $in: ids }, pdfData: { $exists: true, $ne: null } },
   { _id: 1 },
  ).lean();
  const hasPdfSet = new Set(pdfFlags.map((p) => p._id.toString()));
  for (const p of projects) {
   p.hasPdfData = hasPdfSet.has(p._id.toString());
  }

  res.json(projects);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/student
// ─────────────────────────────────────────────────────────────────────────────
// router.get('/projects/student', authenticate, authorize('student'), async (req, res) => {
//   try {
//     const docs = await Project.find({ students: req.user.id })
//       .populate(POPULATE_OPTS)
//       .sort({ createdAt: -1 });
//     const projects = await attachPdfDataFlags(docs);
//     res.json(projects);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
router.get(
 "/projects/student",
 authenticate,
 authorize("student"),
 async (req, res) => {
  try {
   const projects = await Project.find({ students: req.user.id })
    .select("-extractedText -pdfData") // 1. exclude heavy fields
    .populate([
     { path: "students", select: "name email role" },
     { path: "mentor", select: "name email role" },
    ])
    .sort({ createdAt: -1 })
    .lean({ virtuals: true }); // 2. plain JS objects

   // 3. Single-query hasPdfData flag (no second round-trip)
   const ids = projects.map((p) => p._id);
   const pdfFlags = await Project.find(
    { _id: { $in: ids }, pdfData: { $exists: true, $ne: null } },
    { _id: 1 },
   ).lean();
   const hasPdfSet = new Set(pdfFlags.map((p) => p._id.toString()));

   for (const p of projects) {
    p.hasPdfData = hasPdfSet.has(p._id.toString());
   }

   res.json(projects);
  } catch (err) {
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/mentor
// ─────────────────────────────────────────────────────────────────────────────
router.get(
 "/projects/mentor",
 authenticate,
 authorize("mentor"),
 async (req, res) => {
  try {
   const docs = await Project.find({ mentor: req.user.id })
    .populate(POPULATE_OPTS)
    .sort({ createdAt: -1 });
   const projects = await attachPdfDataFlags(docs);
   res.json(projects);
  } catch (err) {
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/admin  — all projects (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
 "/projects/admin",
 authenticate,
 authorize("admin"),
 async (req, res) => {
  try {
   const projects = await Project.find()
    .select("-extractedText")
    .populate(POPULATE_OPTS)
    .sort({ createdAt: -1 })
    .lean();

   if (!projects.length) return res.json([]);

   const ids = projects.map((p) => p._id);
   const pdfFlags = await Project.find(
    { _id: { $in: ids }, pdfData: { $exists: true, $ne: null } },
    { _id: 1 },
   ).lean();
   const hasPdfSet = new Set(pdfFlags.map((p) => p._id.toString()));
   for (const p of projects) {
    p.hasPdfData = hasPdfSet.has(p._id.toString());
   }

   res.json(projects);
  } catch (err) {
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/saved  — saved projects for the current user
// ?idsOnly=true  → returns just the array of saved project IDs (lightweight)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/projects/saved", authenticate, async (req, res) => {
 try {
  const user = await User.findById(req.user.id).select("savedProjects").lean();
  const ids = user.savedProjects || [];

  // Lightweight path: only need IDs (used by dashboards for save-state indicators)
  if (req.query.idsOnly === "true") {
   return res.json(ids.map(String));
  }

  if (!ids.length) return res.json([]);

  const projects = await Project.find({ _id: { $in: ids } })
   .select("-pdfData -extractedText")
   .populate(POPULATE_OPTS)
   .sort({ createdAt: -1 })
   .lean();

  // Inline pdfData flag — avoids loading binary data (same pattern as /projects/student)
  const pdfFlags = await Project.find(
   { _id: { $in: ids }, pdfData: { $exists: true, $ne: null } },
   { _id: 1 },
  ).lean();
  const hasPdfSet = new Set(pdfFlags.map((p) => p._id.toString()));
  for (const p of projects) {
   p.hasPdfData = hasPdfSet.has(p._id.toString());
  }

  res.json(projects);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/:id  — single project detail (role-scoped)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/projects/:id", authenticate, async (req, res) => {
 try {
  const project = await Project.findById(req.params.id)
   .select("-extractedText -pdfData")
   .populate([
    { path: "students", select: "name email role" },
    { path: "mentor", select: "name email role" },
   ])
   .lean();

  if (!project) return res.status(404).json({ message: "Project not found" });

  const { id: userId, role } = req.user;
  const isStudent = project.students.some((s) => s._id.toString() === userId);
  const isMentor = project.mentor._id.toString() === userId;

  if (role === "student" && !isStudent)
   return res.status(403).json({ message: "Access denied" });
  if (role === "mentor" && !isMentor)
   return res.status(403).json({ message: "Access denied" });

  const pdfFlag = await Project.findOne(
   { _id: project._id, pdfData: { $exists: true, $ne: null } },
   { _id: 1 },
  ).lean();
  project.hasPdfData = !!pdfFlag;

  res.json(project);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/:id/download  — stream the stored PDF to the browser
// Accessible by: the project's students, its mentor, and admins
// ─────────────────────────────────────────────────────────────────────────────
router.get(
 "/projects/:id/download",
 authenticate,
 async (req, res) => {
  try {
   // Explicitly request the pdfData buffer (excluded from normal selects)
   const project = await Project.findById(req.params.id).select("+pdfData");

   if (!project) {
    return res.status(404).json({ message: "Project not found" });
   }

   // Role-based access check
   const { id: userId, role } = req.user;
   const isStudent = project.students.map(String).includes(userId);
   const isMentor  = project.mentor.toString() === userId;
   if (role === "student" && !isStudent)
    return res.status(403).json({ message: "Access denied" });
   if (role === "mentor" && !isMentor)
    return res.status(403).json({ message: "Access denied" });

   if (!project.pdfData || project.pdfData.length === 0) {
    // This happens for projects created before pdfData storage was wired up.
    // The frontend shows a "Re-submit needed" badge for these projects.
    return res.status(404).json({
     message: project.pdfFileName
      ? "PDF was uploaded but the file data was not persisted (legacy project). Please delete and re-submit to enable downloads."
      : "No PDF file has been uploaded for this project.",
     legacy: !!project.pdfFileName,
    });
   }

   // Build a safe, descriptive filename: "ProjectTitle_Report.pdf"
   const safeName = (project.pdfFileName || project.title)
    .replace(/[^a-zA-Z0-9\s_-]/g, "") // strip special chars
    .trim()
    .replace(/\s+/g, "_") // spaces → underscores
    .slice(0, 100); // cap at 100 chars

   const downloadName = `${safeName}_Report.pdf`;

   res.set({
    "Content-Type": project.pdfMimeType || "application/pdf",
    "Content-Disposition": `attachment; filename="${downloadName}"`,
    "Content-Length": project.pdfData.length,
    "Cache-Control": "no-store",
   });

   res.end(project.pdfData);
  } catch (err) {
   console.error("Download error:", err);
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/projects/:id/status  — mentor approves or rejects
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
 "/projects/:id/status",
 authenticate,
 authorize("mentor"),
 async (req, res) => {
  try {
   const { status, reviewNote = "" } = req.body;

   if (!["approved", "rejected"].includes(status)) {
    return res
     .status(400)
     .json({ message: "status must be 'approved' or 'rejected'" });
   }

   const project = await Project.findById(req.params.id);
   if (!project) return res.status(404).json({ message: "Project not found" });

   if (project.mentor.toString() !== req.user.id) {
    return res
     .status(403)
     .json({ message: "You are not the assigned mentor for this project" });
   }

   project.status = status;
   project.reviewNote = reviewNote;
   await project.save();

   const populated = await project.populate(POPULATE_OPTS);
   res.json({ message: `Project ${status}`, project: populated });
  } catch (err) {
   console.error("Update project status error:", err);
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/projects/:id  — student edits their own project
// Updatable fields: title, description, coStudentEmails
// NOT updatable: mentor, PDF/plagiarism report, status
// ─────────────────────────────────────────────────────────────────────────────
router.put(
 "/projects/:id",
 authenticate,
 authorize("student"),
 async (req, res) => {
  try {
   const project = await Project.findById(req.params.id);
   if (!project) return res.status(404).json({ message: "Project not found" });

   // Only a student who is already on the project may edit it
   if (!project.students.map(String).includes(req.user.id)) {
    return res
     .status(403)
     .json({ message: "You are not a contributor on this project" });
   }

   const { title, description, coStudentEmails } = req.body;

   if (title) project.title = title.trim();
   if (description) project.description = description.trim();

   // Re-resolve co-contributor list when provided
   if (Array.isArray(coStudentEmails)) {
    let coStudentIds = [];
    if (coStudentEmails.length > 0) {
     const coStudents = await User.find({
      email: { $in: coStudentEmails.map((e) => e.toLowerCase()) },
      role: "student",
     }).select("_id email");

     if (coStudents.length !== coStudentEmails.length) {
      const found = coStudents.map((s) => s.email.toLowerCase());
      const missing = coStudentEmails.filter(
       (e) => !found.includes(e.toLowerCase()),
      );
      return res
       .status(404)
       .json({ message: `Student email(s) not found: ${missing.join(", ")}` });
     }
     coStudentIds = coStudents.map((s) => s._id.toString());
    }
    // Always keep the original editor; merge + deduplicate
    project.students = [...new Set([req.user.id, ...coStudentIds])];
   }

   // Reset approval status to pending after an edit so mentor must re-review
   if (project.status !== "pending") project.status = "pending";

   await project.save();
   const populated = await project.populate(POPULATE_OPTS);
   res.json({ message: "Project updated", project: populated });
  } catch (err) {
   console.error("Edit project error:", err);
   if (err.name === "ValidationError") {
    return res.status(400).json({
     message: Object.values(err.errors)
      .map((e) => e.message)
      .join(", "),
    });
   }
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/projects/:id  — student (own project) OR mentor (assigned project)
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
 "/projects/:id",
 authenticate,
 authorize("student", "mentor"),
 async (req, res) => {
  try {
   const project = await Project.findById(req.params.id);
   if (!project) return res.status(404).json({ message: "Project not found" });

   const isStudent =
    req.user.role === "student" &&
    project.students.map(String).includes(req.user.id);
   const isMentor =
    req.user.role === "mentor" && project.mentor.toString() === req.user.id;

   if (!isStudent && !isMentor) {
    return res
     .status(403)
     .json({ message: "You do not have permission to delete this project" });
   }

   await project.deleteOne();
   res.json({ message: "Project deleted successfully" });
  } catch (err) {
   console.error("Delete project error:", err);
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mentor/students  — unique students linked to the logged-in mentor's projects
// ─────────────────────────────────────────────────────────────────────────────
router.get(
 "/mentor/students",
 authenticate,
 authorize("mentor"),
 async (req, res) => {
  try {
   // Find all projects assigned to this mentor and populate the students array
   const projects = await Project.find({ mentor: req.user.id })
    .populate({ path: "students", select: "name email role createdAt" })
    .lean();

   // Flatten + deduplicate students by _id
   const seen = new Set();
   const uniqueStudents = [];
   for (const p of projects) {
    for (const s of p.students ?? []) {
     const id = s._id.toString();
     if (!seen.has(id)) {
      seen.add(id);
      uniqueStudents.push(s);
     }
    }
   }

   res.json(uniqueStudents);
  } catch (err) {
   res.status(500).json({ message: err.message });
  }
 },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects/:id/save  — toggle save / unsave for any authenticated user
// ─────────────────────────────────────────────────────────────────────────────
router.post("/projects/:id/save", authenticate, async (req, res) => {
 try {
  const projectId = req.params.id;

  // Run existence check and optimistic pull in parallel
  const [exists, pullResult] = await Promise.all([
   Project.exists({ _id: projectId }),
   User.updateOne(
    { _id: req.user.id, savedProjects: projectId },
    { $pull: { savedProjects: projectId } },
   ),
  ]);

  if (!exists) return res.status(404).json({ message: "Project not found" });

  if (pullResult.modifiedCount > 0) {
   return res.json({ saved: false });
  }

  // Wasn't saved yet — add it
  await User.updateOne({ _id: req.user.id }, { $addToSet: { savedProjects: projectId } });
  res.json({ saved: true });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

// ── Multer error handler (file type / size violations) ────────────────────────
router.use((err, _req, res, _next) => {
 if (
  err instanceof multer.MulterError ||
  err.message === "Only PDF files are allowed"
 ) {
  return res.status(400).json({ message: err.message });
 }
 res.status(500).json({ message: err.message });
});

module.exports = router;
