'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Folder, FolderOpen, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveLoadButtons } from './SaveLoadButtons';

export function TopicTabs() {
  const { topics, selectedTopicId, setSelectedTopic, editTopic, deleteTopic, addTopic, addPrompt } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [hoveredTopicId, setHoveredTopicId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleAddTopic = async () => {
    if (newTopicName.trim()) {
      await addTopic(newTopicName.trim());
      setNewTopicName('');
      setShowAddOverlay(false);
    }
  };

  const handleDropText = async (e: React.DragEvent, targetTopicId: string, topicName: string) => {
    e.preventDefault();
    setHoveredTopicId(null);
    
    try {
      const droppedText = e.dataTransfer.getData('text/plain');
      if (droppedText && droppedText.trim()) {
        const textValue = droppedText.trim();
        const titleValue = textValue.split('\n')[0].slice(0, 50) + (textValue.split('\n')[0].length > 50 ? '...' : '');
        
        const newPrompt = {
          id: crypto.randomUUID(),
          title: titleValue,
          text: textValue,
          tags: ['dragged'],
          createdAt: Date.now()
        };
        
        await addPrompt(targetTopicId, newPrompt);
        setToastMessage(`Saved selection as new card in topic "${topicName}"!`);
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to handle drop text:', err);
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
            const isDragTarget = hoveredTopicId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => !isEditing && setSelectedTopic(topic.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (hoveredTopicId !== topic.id) {
                    setHoveredTopicId(topic.id);
                  }
                }}
                onDragLeave={() => setHoveredTopicId(null)}
                onDrop={(e) => handleDropText(e, topic.id, topic.name)}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent',
                  isSelected 
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100/50 shadow-sm text-indigo-900 font-medium' 
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900',
                  isDragTarget && 'bg-indigo-50/80 border-indigo-300 scale-102 ring-2 ring-indigo-100 shadow-sm z-10'
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
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/20 relative flex flex-col gap-3 flex-shrink-0">
        {showAddOverlay && (
          <div className="absolute bottom-28 left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Create Topic</h4>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Topic name..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTopic();
                  if (e.key === 'Escape') setShowAddOverlay(false);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all duration-150"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setShowAddOverlay(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopicName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setShowAddOverlay(!showAddOverlay);
            setNewTopicName('');
          }}
          className="w-full border border-indigo-200 bg-indigo-50/20 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition-all duration-150 font-medium rounded-xl h-9 hover:-translate-y-0.5 active:scale-98"
        >
          <Plus className="h-4 w-4 mr-1.5 flex-shrink-0" />
          Add Topic
        </Button>

        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup Workspace</span>
          <SaveLoadButtons />
        </div>
      </div>

      {toastMessage && (
        <div className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-between animate-in fade-in slide-in-from-bottom-3 duration-250 z-50">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white p-0.5 rounded transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
