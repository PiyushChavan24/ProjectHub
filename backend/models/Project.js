const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // One or more student contributors (ObjectId refs to User)
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Single mentor assigned to the project
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A mentor must be assigned'],
    },
    // Optional: reason stored when a mentor rejects
    reviewNote: {
      type: String,
      default: '',
    },
    // PDF plagiarism report — stored after submission to the FastAPI model
    plagiarismReport: {
      highest_risk:       { type: String,  default: null },
      highest_score:      { type: Number,  default: null },
      total_comparisons:  { type: Number,  default: null },
      total_elapsed_seconds: { type: Number, default: null },
      // ISO timestamp of when the check was run
      checkedAt:          { type: Date,    default: null },
    },
    // Original PDF filename for reference
    pdfFileName: {
      type: String,
      default: null,
    },
    // Plain text extracted from the submitted PDF — used as corpus for future comparisons
    extractedText: {
      type: String,
      default: null,
      select: false,   // omit from normal queries to keep payloads small
    },
    // Raw PDF binary — stored so mentors/admins can download the original file.
    // select: false keeps it out of every normal .find() / .findById() call;
    // only the download endpoint explicitly requests it with .select('+pdfData').
    pdfData: {
      type: Buffer,
      default: null,
      select: false,
    },
    // MIME type recorded at upload time (always application/pdf for now)
    pdfMimeType: {
      type: String,
      default: 'application/pdf',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
