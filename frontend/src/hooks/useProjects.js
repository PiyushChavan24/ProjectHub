import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Student hooks ─────────────────────────────────────────────────────────────

export function useStudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/projects/student', { headers: authHeader() });
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, loading, error, refresh: fetch };
}

export function useMentorList() {
  const [mentors, setMentors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/users/mentors', { headers: authHeader() });
        setMentors(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { mentors, loading, error };
}

export function useStudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/users/students', { headers: authHeader() });
        setStudents(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { students, loading, error };
}

/**
 * createProject — sends a multipart/form-data request so the PDF
 * buffer reaches the backend as req.file (multer memoryStorage).
 *
 * payload: { title, description, mentorId, coStudentEmails: string[], pdfFile: File }
 */
export async function createProject({ title, description, mentorId, coStudentEmails = [], pdfFile }) {
  const form = new FormData();
  form.append('title',       title);
  form.append('description', description);
  form.append('mentorId',    mentorId);

  // Serialize array so Express req.body can parse it
  coStudentEmails.forEach((email) => form.append('coStudentEmails', email));

  // Append the actual File object — multer reads it as req.file
  form.append('pdf', pdfFile, pdfFile.name);

  const { data } = await axios.post('/api/projects', form, {
    headers: {
      ...authHeader(),
      // Let the browser set Content-Type with the correct boundary
    },
    // Report upload + analysis progress (can take 30–120 s on cold HF start)
    timeout: 180_000,
  });
  return data;
}

// ── Mentor hooks ──────────────────────────────────────────────────────────────

export function useMentorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/projects/mentor', { headers: authHeader() });
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, loading, error, refresh: fetch };
}

export async function reviewProject(projectId, status, reviewNote = '') {
  const { data } = await axios.patch(
    `/api/projects/${projectId}/status`,
    { status, reviewNote },
    { headers: authHeader() }
  );
  return data;
}

// ── Mentor / Admin: download the stored PDF for a project ────────────────────
/**
 * Fetches the PDF as a binary blob and triggers a browser "Save As" dialog.
 * @param {string} projectId   – MongoDB _id of the project
 * @param {string} projectTitle – used to construct the downloaded filename
 */
export async function downloadProjectPDF(projectId, projectTitle) {
  const response = await axios.get(`/api/projects/${projectId}/download`, {
    headers:      authHeader(),
    responseType: 'blob',          // ← critical: treat response as binary
    timeout:      60_000,
  });

  // Build a safe filename that mirrors what the backend sends
  const safeName = (projectTitle || 'Project')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 100);

  const filename = `${safeName}_Report.pdf`;

  // Create a temporary object-URL, click it, then revoke it
  const blobUrl = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  );
  const anchor = document.createElement('a');
  anchor.href     = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

// ── Student: edit a project (title, description, co-contributors) ─────────────
export async function updateProject(projectId, { title, description, coStudentEmails = [] }) {
  const { data } = await axios.put(
    `/api/projects/${projectId}`,
    { title, description, coStudentEmails },
    { headers: authHeader() }
  );
  return data;
}

// ── Student / Mentor: delete a project ───────────────────────────────────────
export async function deleteProject(projectId) {
  const { data } = await axios.delete(`/api/projects/${projectId}`, { headers: authHeader() });
  return data;
}

// ── Mentor: fetch unique students assigned to the mentor's projects ───────────
export function useMentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/mentor/students', { headers: authHeader() });
      setStudents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { students, loading, error, refresh: fetch };
}

// ── Single project detail ─────────────────────────────────────────────────────

export function useProject(id) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`/api/projects/${id}`, { headers: authHeader() });
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return { project, loading, error };
}

// ── Gallery: all approved projects (any authenticated role) ───────────────────
export function useApprovedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/projects/approved', { headers: authHeader() });
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { projects, loading, error, refresh: fetch };
}

// ── Saved projects ────────────────────────────────────────────────────────────

// Lightweight hook for dashboards: fetches only IDs, not full project data
export function useSavedIds() {
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    axios
      .get('/api/projects/saved?idsOnly=true', { headers: authHeader() })
      .then(({ data }) => setSavedIds(new Set(data)))
      .catch(() => {});
  }, []);

  const toggleSave = async (projectId) => {
    try {
      const { data } = await axios.post(`/api/projects/${projectId}/save`, {}, { headers: authHeader() });
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) next.add(projectId);
        else next.delete(projectId);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return { savedIds, toggleSave };
}

export function useSavedProjects() {
  const [projects, setProjects] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/projects/saved', { headers: authHeader() });
      setProjects(data);
      setSavedIds(new Set(data.map((p) => p._id)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleSave = async (projectId) => {
    try {
      const { data } = await axios.post(`/api/projects/${projectId}/save`, {}, { headers: authHeader() });
      if (data.saved) {
        setSavedIds((prev) => new Set([...prev, projectId]));
      } else {
        setSavedIds((prev) => { const next = new Set(prev); next.delete(projectId); return next; });
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return { projects, savedIds, loading, error, toggleSave, refresh: fetch };
}

// ── Admin hooks ───────────────────────────────────────────────────────────────

export function useAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/projects/admin', {
        headers: authHeader(),
        signal,
      });
      setProjects(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || 'Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { projects, loading, error, refresh: () => load() };
}
