import { useState } from 'react';
import { UserPlus, Edit3, UserMinus, ShieldCheck, Users, FolderKanban, Settings2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProjectCard from '../../components/ProjectCard';
import StatusBadge from '../../components/StatusBadge';
import DownloadPDFButton from '../../components/DownloadPDFButton';
import AddUserModal         from '../../components/admin/AddUserModal';
import EditUserModal        from '../../components/admin/EditUserModal';
import ConfirmDeleteUserModal from '../../components/admin/ConfirmDeleteUserModal';
import { useAdminUsers }   from '../../hooks/useAdminUsers';
import { useAdminProjects, useSavedIds } from '../../hooks/useProjects';

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  student: 'bg-blue-100   text-blue-700',
  mentor:  'bg-green-100  text-green-700',
  admin:   'bg-purple-100 text-purple-700',
};

function RiskBadge({ risk }) {
  if (!risk) return <span className="text-slate-400 text-xs italic">—</span>;
  const r   = risk.toUpperCase();
  const cls =
    r === 'LOW'      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' :
    r === 'MEDIUM'   ? 'bg-amber-100   text-amber-700   ring-amber-200'   :
    r === 'HIGH'     ? 'bg-red-100     text-red-700     ring-red-200'     :
    r === 'CRITICAL' ? 'bg-red-200     text-red-900     ring-red-300'     :
                       'bg-slate-100   text-slate-600   ring-slate-200';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${cls}`}>{risk}</span>
  );
}

const TABS = [
  { id: 'overview',   label: 'Overview',        Icon: ShieldCheck     },
  { id: 'users',      label: 'User Management', Icon: Users           },
  { id: 'projects',   label: 'Projects',        Icon: FolderKanban    },
  { id: 'settings',   label: 'Settings',        Icon: Settings2       },
];

const SETTINGS = [
  { key: 'Maintenance Mode',   value: 'Disabled' },
  { key: 'User Registration',  value: 'Enabled'  },
  { key: 'Max Users Per Role', value: '500'       },
  { key: 'JWT Expiry',         value: '7 days'    },
  { key: 'Default Role',       value: 'Student'   },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { auth } = useAuth();

  // ── Data hooks ───────────────────────────────────────────────────────────
  const { users,   setUsers,   loading: loadingUsers,    error: userError    } = useAdminUsers();
  const { projects,            loading: loadingProjects, error: projectError } = useAdminProjects();
  const { savedIds, toggleSave } = useSavedIds();

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState('overview');
  const [riskFilter,  setRiskFilter]  = useState('ALL');

  // ── Modal state ──────────────────────────────────────────────────────────
  const [showAddUser,    setShowAddUser]    = useState(false);
  const [editTarget,     setEditTarget]     = useState(null); // user to edit
  const [deleteTarget,   setDeleteTarget]   = useState(null); // user to delete

  // ── Derived stats ─────────────────────────────────────────────────────────
  const studentCount = users.filter((u) => u.role === 'student').length;
  const mentorCount  = users.filter((u) => u.role === 'mentor').length;
  const adminCount   = users.filter((u) => u.role === 'admin').length;
  const highRisk     = projects.filter((p) =>
    ['HIGH', 'CRITICAL'].includes(p.plagiarismReport?.highest_risk?.toUpperCase())
  ).length;
  const pendingProjects = projects.filter((p) => p.status === 'pending').length;

  const filteredProjects =
    riskFilter === 'ALL'
      ? projects
      : projects.filter((p) => p.plagiarismReport?.highest_risk?.toUpperCase() === riskFilter);

  // ── User CRUD callbacks ───────────────────────────────────────────────────
  const handleUserCreated = (newUser) => setUsers((prev) => [newUser, ...prev]);
  const handleUserUpdated = (updated) =>
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
  const handleUserDeleted = (id) =>
    setUsers((prev) => prev.filter((u) => u._id !== id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="w-full px-8 pt-24 pb-8 space-y-6">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, <span className="font-medium text-slate-700 dark:text-slate-200">{auth.user.name}</span>! Full system access and control.
          </p>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',       value: users.length,    icon: '👥', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
            { label: 'Total Projects',    value: projects.length, icon: '🗂️', color: 'bg-blue-50   dark:bg-blue-900/20   border-blue-200   dark:border-blue-800'   },
            { label: 'Pending Reviews',   value: pendingProjects, icon: '📋', color: 'bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-800'  },
            { label: 'High-Risk Reports', value: highRisk,        icon: '🚨', color: 'bg-red-50    dark:bg-red-900/20    border-red-200    dark:border-red-800'    },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: Overview
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">User Breakdown</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Students', count: studentCount, color: 'bg-blue-500',   bg: 'bg-blue-50   dark:bg-blue-900/20'   },
                  { label: 'Mentors',  count: mentorCount,  color: 'bg-green-500',  bg: 'bg-green-50  dark:bg-green-900/20'  },
                  { label: 'Admins',   count: adminCount,   color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{row.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">{row.count} / {users.length}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${row.bg}`}>
                      <div
                        className={`h-2 rounded-full ${row.color} transition-all duration-500`}
                        style={{ width: users.length ? `${(row.count / users.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project overview table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Projects Snapshot</h2>
              </div>
              {loadingProjects ? (
                <div className="p-6 space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}
                </div>
              ) : projects.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">No projects submitted yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                      <tr>
                        {['Title', 'Status', 'Risk'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {projects.slice(0, 8).map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100 truncate max-w-40">{p.title}</td>
                          <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-5 py-3"><RiskBadge risk={p.plagiarismReport?.highest_risk} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {projects.length > 8 && (
                    <div className="px-5 py-3 text-xs text-center text-indigo-600 dark:text-indigo-400 border-t border-slate-100 dark:border-slate-700">
                      <button onClick={() => setActiveTab('projects')} className="hover:underline">
                        View all {projects.length} projects →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: User Management
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Users</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} registered account{users.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Error */}
            {userError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">{userError}</div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="p-6 space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                      <tr>
                        {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group">
                          {/* User */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm
                                ${u.role === 'admin'   ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' :
                                  u.role === 'mentor'  ? 'bg-green-100  dark:bg-green-900/40  text-green-700  dark:text-green-400'  :
                                                         'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'}`}
                              >
                                {u.name?.[0]?.toUpperCase() ?? '?'}
                              </div>
                              <span className="font-medium text-slate-800 dark:text-slate-100">{u.name}</span>
                              {u._id === auth.user.id && (
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-medium">you</span>
                              )}
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-50 truncate">{u.email}</td>
                          {/* Role */}
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>
                              {u.role}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                              : '—'}
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditTarget(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => u._id !== auth.user.id && setDeleteTarget(u)}
                                disabled={u._id === auth.user.id}
                                title={u._id === auth.user.id ? "Can't delete your own account" : `Delete ${u.name}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: Projects (full cards + Download PDF)
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Filter by risk:</span>
              {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    riskFilter === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  {r}
                </button>
              ))}
              {riskFilter !== 'ALL' && (
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                  {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse" />)}
              </div>
            ) : projectError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">{projectError}</div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
                <p className="text-4xl mb-3">🗂️</p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {riskFilter === 'ALL' ? 'No projects submitted yet.' : `No ${riskFilter} risk projects.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((p) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    saved={savedIds.has(p._id)}
                    onSave={() => toggleSave(p._id)}
                    actions={
                      <DownloadPDFButton
                        projectId={p._id}
                        projectTitle={p.title}
                        hasPdf={!!p.pdfFileName}
                        hasPdfData={!!p.hasPdfData}
                      />
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: Settings
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">System Settings</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Platform-wide configuration</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {SETTINGS.map((s) => (
                <div key={s.key} className="px-6 py-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.key}</p>
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button className="w-full text-sm bg-slate-800 dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2.5 rounded-lg transition-colors font-medium">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onCreated={handleUserCreated}
        />
      )}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUserUpdated}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
}
