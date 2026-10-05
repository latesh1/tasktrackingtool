import { useState, useRef } from 'react';
import { Upload, File, X, Paperclip } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

const ALLOWED_TYPES = [
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/zip', 'text/plain', 'text/csv', 'application/json',
];

export default function FileUploader({ onUpload, loading = false }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }
    onUpload(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
        dragOver
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {loading ? (
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      ) : (
        <>
          <Upload className="w-6 h-6 text-slate-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">Drop file here or <span className="text-indigo-600">browse</span></p>
            <p className="text-xs text-slate-400 mt-0.5">Max 10 MB · PDF, Word, Excel, Images, ZIP…</p>
          </div>
        </>
      )}
    </div>
  );
}

export function AttachmentList({ attachments, onDelete, canDelete }) {
  return (
    <div className="space-y-2">
      {attachments.map(att => (
        <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
          <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{att.file_name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(att.file_size)} · {att.file_type}</p>
          </div>
          <a
            href={att.download_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
          >
            Download
          </a>
          {canDelete && (
            <button
              onClick={() => onDelete(att.id)}
              className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete attachment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
