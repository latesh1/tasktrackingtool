export default function LoadingSpinner({ size = 'md', fullscreen = false, text = '' }) {
  const sizeClass = {
    xs: 'w-3 h-3 border-[2px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-[3px]',
    xl: 'w-14 h-14 border-4',
  }[size] || 'w-7 h-7 border-2';

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-full border-indigo-200 border-t-indigo-600 animate-spin ${sizeClass}`}
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
