import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page, total, per_page } = pagination;
  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, current_page - Math.floor(maxVisible / 2));
  let endPage = Math.min(last_page, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        {startPage > 1 && (
          <>
            <PageButton page={1} current={current_page} onClick={onPageChange} />
            {startPage > 2 && <span className="text-slate-400 text-xs px-1">…</span>}
          </>
        )}

        {pages.map(page => (
          <PageButton key={page} page={page} current={current_page} onClick={onPageChange} />
        ))}

        {endPage < last_page && (
          <>
            {endPage < last_page - 1 && <span className="text-slate-400 text-xs px-1">…</span>}
            <PageButton page={last_page} current={current_page} onClick={onPageChange} />
          </>
        )}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

function PageButton({ page, current, onClick }) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={`w-8 h-8 text-xs font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {page}
    </button>
  );
}
