import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Fetch all users ───────────────────────────────────────────────────────────
export function useAdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/admin/users', {
        headers: authHeader(),
        signal,
      });
      setUsers(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.response?.data?.message || 'Failed to load users');
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

  return { users, setUsers, loading, error, refresh: () => load() };
}

// ── Mutations (called from modal handlers) ────────────────────────────────────

export async function createAdminUser({ name, email, password, role }) {
  const { data } = await axios.post(
    '/api/admin/users',
    { name, email, password, role },
    { headers: authHeader() }
  );
  return data; // { message, user }
}

export async function updateAdminUser(userId, { name, email, role }) {
  const { data } = await axios.put(
    `/api/admin/users/${userId}`,
    { name, email, role },
    { headers: authHeader() }
  );
  return data; // { message, user }
}

export async function deleteAdminUser(userId) {
  const { data } = await axios.delete(
    `/api/admin/users/${userId}`,
    { headers: authHeader() }
  );
  return data; // { message }
}
