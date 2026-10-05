import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-4">{message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
