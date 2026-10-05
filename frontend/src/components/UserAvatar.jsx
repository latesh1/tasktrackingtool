import { getInitials } from '../utils/helpers';

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UserAvatar({ user, size = 'sm' }) {
  if (!user) return null;

  const sizeClass = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size] || 'w-7 h-7 text-xs';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold select-none shrink-0 ${getAvatarColor(user.name)} ${sizeClass}`}
      title={user.name}
    >
      {getInitials(user.name)}
    </div>
  );
}
