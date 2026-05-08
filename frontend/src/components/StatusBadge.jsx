const CONFIG = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300  ring-amber-200  dark:ring-amber-700'  },
  approved: { label: 'Approved', classes: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-300    ring-red-200    dark:ring-red-700'    },
};

export default function StatusBadge({ status }) {
  const { label, classes } = CONFIG[status] ?? CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
