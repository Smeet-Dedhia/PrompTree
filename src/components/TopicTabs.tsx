'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { AddTopicDialog } from './AddTopicDialog';
import { cn } from '@/lib/utils';
import { Folder, FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react';

export function TopicTabs() {
  const { topics, selectedTopicId, setSelectedTopic, editTopic, deleteTopic } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = async (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editName.trim()) {
      await editTopic(id, editName.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the topic "${name}"? All prompts inside this topic will be permanently deleted.`)) {
      await deleteTopic(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm custom-shadow overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">
          Topics
        </h3>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          {topics.length} Total
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 min-h-[300px]">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
            <Folder className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium">No topics created yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Click &quot;Add Topic&quot; to start categories</p>
          </div>
        ) : (
          topics.map((topic) => {
            const isSelected = selectedTopicId === topic.id;
            const isEditing = editingId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => !isEditing && setSelectedTopic(topic.id)}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent',
                  isSelected 
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100/50 shadow-sm text-indigo-900 font-medium' 
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4 text-indigo-600 flex-shrink-0 stroke-[2.2]" />
                  ) : (
                    <Folder className="h-4 w-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0 stroke-[1.8]" />
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(e, topic.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 font-normal"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate text-sm tracking-tight">{topic.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {isEditing ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => handleSaveEdit(e, topic.id)}
                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-150">
                        <button
                          onClick={(e) => handleStartEdit(e, topic.id, topic.name)}
                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Rename Topic"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, topic.id, topic.name)}
                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors',
                        isSelected 
                          ? 'bg-indigo-100/60 text-indigo-700' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      )}>
                        {topic.prompts.length}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/20">
        <AddTopicDialog />
      </div>
    </div>
  );
}
