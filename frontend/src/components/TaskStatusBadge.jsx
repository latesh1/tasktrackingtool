import { STATUS_CONFIG } from '../utils/helpers';

export default function TaskStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
