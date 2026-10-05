import { AlertCircle } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', description = '', icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        {Icon ? <Icon className="w-8 h-8 text-slate-400" /> : <AlertCircle className="w-8 h-8 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  );
}
