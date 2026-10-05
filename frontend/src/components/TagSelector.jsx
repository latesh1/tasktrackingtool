import { useState, useEffect } from 'react';
import { tagService } from '../services/tagService';
import TagBadge from './TagBadge';
import { Tag, Check, Plus } from 'lucide-react';

export default function TagSelector({ selectedTags = [], onChange }) {
  const [allTags, setAllTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    tagService.getAll().then(r => setAllTags(r.data || [])).catch(() => {});
  }, []);

  function toggleTag(tag) {
    const exists = selectedTags.find(t => t.id === tag.id);
    if (exists) {
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onChange([...selectedTags, tag]);
    }
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    setCreating(true);
    try {
      const res = await tagService.create({ name: newTagName.trim(), color: newTagColor });
      const newTag = res.data;
      setAllTags(prev => [...prev, newTag]);
      onChange([...selectedTags, newTag]);
      setNewTagName('');
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative">
      {/* Selected tags display */}
      <div
        className="min-h-[38px] px-3 py-2 flex flex-wrap gap-1 items-center border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors bg-white"
        onClick={() => setOpen(!open)}
      >
        {selectedTags.length === 0 ? (
          <span className="text-sm text-slate-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Add tags…
          </span>
        ) : (
          selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={(t) => { onChange(selectedTags.filter(x => x.id !== t.id)); }}
            />
          ))
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1 max-h-60 overflow-y-auto">
          {allTags.map(tag => {
            const selected = selectedTags.find(t => t.id === tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <TagBadge tag={tag} />
                {selected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            );
          })}

          <div className="border-t border-slate-100 pt-2 mt-1 flex items-center gap-2 px-1">
            <input
              type="color"
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="New tag name…"
              onKeyDown={e => { if (e.key === 'Enter') createTag(); }}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
            <button
              type="button"
              onClick={createTag}
              disabled={creating || !newTagName.trim()}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
