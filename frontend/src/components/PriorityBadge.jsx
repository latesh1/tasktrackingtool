import { PRIORITY_CONFIG } from '../utils/helpers';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
