import { useState } from 'react';
import { commentService } from '../services/commentService';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { timeAgo, getErrorMessage } from '../utils/helpers';
import { Send, Pencil, Trash2, X, Check } from 'lucide-react';

function CommentItem({ comment, currentUser, onEdit, onDelete }) {
  const isOwner = currentUser?.id === comment.user_id;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [saving, setSaving] = useState(false);

  async function saveEdit() {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await commentService.update(comment.id, editText.trim());
      onEdit(comment.id, res.data);
      setEditing(false);
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-3 group">
      <UserAvatar user={comment.user} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800">{comment.user?.name}</span>
          <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
          {isOwner && !editing && (
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditing(true); setEditText(comment.comment); }} className="p-1 text-slate-400 hover:text-indigo-600">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(comment.id)} className="p-1 text-slate-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 text-slate-600 text-xs rounded-lg hover:bg-slate-100">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ taskId, initialComments = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await commentService.create(taskId, text.trim());
      setComments(prev => [res.data, ...prev]);
      setText('');
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  function handleEdit(commentId, updated) {
    setComments(prev => prev.map(c => c.id === commentId ? updated : c));
  }

  async function handleDelete(commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentService.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) {
      alert(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <form onSubmit={submit} className="flex gap-3">
        {user && <UserAvatar user={user} size="sm" />}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="absolute bottom-2.5 right-2.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            aria-label="Send comment"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
              : <Send className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
