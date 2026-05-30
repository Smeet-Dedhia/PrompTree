'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, GripVertical, FileText, Search, Star, Copy, Check, Globe, Plus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { EditPromptDialog } from './EditPromptDialog';
import { Prompt } from '@/types';
import { createDragData } from '@/lib/dndHandlers';
import { cn } from '@/lib/utils';

interface PromptCardsProps {
  topicId: string;
}

export function PromptCards({ topicId }: PromptCardsProps) {
  const { topics, toggleStarPrompt, deletePrompt, addPrompt } = useAppStore();
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'recent' | 'title' | 'length' | 'starred'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Add States
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickText, setQuickText] = useState('');
  const [quickTags, setQuickTags] = useState('');

  useEffect(() => {
    setSearchQuery('');
    setSelectedTag(null);
    setShowQuickAdd(false);
  }, [topicId]);

  const handleDelete = async (promptTopicId: string, promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(promptTopicId, promptId);
    }
  };

  const handleCopy = (e: React.MouseEvent, promptId: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(promptId);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleQuickInsert = (text: string) => {
    window.dispatchEvent(new CustomEvent('insert-prompt', { detail: text }));
  };

  const parseTags = (str: string): string[] => {
    return str
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  };

  const handleQuickSave = async () => {
    if (!quickText.trim() || !topicId) return;

    const titleValue = quickTitle.trim() || quickText.split('\n')[0].slice(0, 50) + (quickText.split('\n')[0].length > 50 ? '...' : '');

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: titleValue,
      text: quickText.trim(),
      tags: parseTags(quickTags),
      createdAt: Date.now(),
    };

    await addPrompt(topicId, newPrompt);
    setQuickTitle('');
    setQuickText('');
    setQuickTags('');
    setShowQuickAdd(false);
  };

  // Compile unique tags for display filter
  const getAllUniqueTags = () => {
    const tagsSet = new Set<string>();
    
    if (globalSearch) {
      topics.forEach(topic => {
        topic.prompts.forEach(prompt => {
          prompt.tags?.forEach(tag => tagsSet.add(tag));
        });
      });
    } else {
      const currentTopic = topics.find(t => t.id === topicId);
      currentTopic?.prompts.forEach(prompt => {
        prompt.tags?.forEach(tag => tagsSet.add(tag));
      });
    }

    return Array.from(tagsSet);
  };

  const uniqueTags = getAllUniqueTags();

  // Compile active list of prompts based on selected topic and search criteria
  const getFilteredPrompts = () => {
    let sourceList: (Prompt & { originTopicName: string; originTopicId: string })[] = [];

    if (globalSearch) {
      topics.forEach(topic => {
        topic.prompts.forEach(prompt => {
          sourceList.push({
            ...prompt,
            originTopicName: topic.name,
            originTopicId: topic.id
          });
        });
      });
    } else {
      const currentTopic = topics.find(t => t.id === topicId);
      if (currentTopic) {
        currentTopic.prompts.forEach(prompt => {
          sourceList.push({
            ...prompt,
            originTopicName: currentTopic.name,
            originTopicId: currentTopic.id
          });
        });
      }
    }

    // Apply Starred filter
    if (showStarredOnly) {
      sourceList = sourceList.filter(p => p.isStarred);
    }

    // Apply Tag filter
    if (selectedTag) {
      sourceList = sourceList.filter(p => p.tags?.includes(selectedTag));
    }

    // Apply Search Query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      sourceList = sourceList.filter(
        p => p.title.toLowerCase().includes(query) || p.text.toLowerCase().includes(query)
      );
    }

    // Apply Sorting
    sourceList.sort((a, b) => {
      if (sortMode === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortMode === 'length') {
        return b.text.length - a.text.length;
      }
      if (sortMode === 'starred') {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      // 'recent' sorting (newest first)
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return sourceList;
  };

  const filteredList = getFilteredPrompts();

  return (
    <div className="space-y-4">
      
      {/* Search and Filters Dashboard Control Center */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={globalSearch ? "Search all prompts globally..." : "Search prompts in this topic..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all duration-150"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setGlobalSearch(!globalSearch)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 active:scale-95",
              globalSearch 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs" 
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Search All Topics</span>
          </button>
          
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 active:scale-95",
              showStarredOnly 
                ? "bg-amber-50 border-amber-200 text-amber-700 shadow-xs" 
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", showStarredOnly && "fill-amber-500 text-amber-500")} />
            <span>Starred Only</span>
          </button>

          {/* Quick Add Prompt Button */}
          <button
            onClick={() => {
              setShowQuickAdd(!showQuickAdd);
              setQuickTitle('');
              setQuickText('');
              setQuickTags('');
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 active:scale-95",
              showQuickAdd 
                ? "bg-violet-50 border-violet-200 text-violet-700 shadow-xs" 
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Quick Add</span>
          </button>
          
          {(searchQuery || globalSearch || showStarredOnly || selectedTag) && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md ml-auto">
              Found {filteredList.length} match{filteredList.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>

        {/* Sort & Tag Filter Pills Row */}
        <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Sort & Tags Filter</span>
            
            {/* Sort Dropdown Selector */}
            <div className="flex items-center gap-1.5">
              <span>Sort:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="recent">Recent Created</option>
                <option value="title">Title (A-Z)</option>
                <option value="length">Length (Size)</option>
                <option value="starred">Starred First</option>
              </select>
            </div>
          </div>

          {/* Clickable Tag Filter Pills */}
          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                  selectedTag === null
                    ? "bg-indigo-650 text-indigo-700 bg-indigo-50 border-indigo-200"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200/60"
                )}
              >
                All Tags
              </button>
              {uniqueTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                    selectedTag === tag
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200/60"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Inline Quick Add form */}
      {showQuickAdd && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Add Prompt</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Prompt title (optional)..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all duration-150"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)..."
                value={quickTags}
                onChange={(e) => setQuickTags(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all duration-150"
              />
            </div>
            <textarea
              placeholder="Write prompt instructions here..."
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all duration-150 resize-none font-mono"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickSave}
                disabled={!quickText.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompts Cards Board */}
      <div className="space-y-3.5">
        {filteredList.length === 0 ? (
          <div className="w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h4 className="font-semibold text-slate-700 text-sm mb-1">
              {searchQuery || showStarredOnly || selectedTag ? "No matching prompts found" : "No prompts inside this topic"}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {searchQuery || showStarredOnly || selectedTag 
                ? "Try clearing filters, searching globally, or modifying your search query." 
                : "Create prompt template cards in the workspace composer on the right."}
            </p>
            {(searchQuery || showStarredOnly || selectedTag) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setShowStarredOnly(false);
                  setSelectedTag(null);
                }}
                className="mt-4 border border-slate-200 rounded-xl px-4 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          filteredList.map((prompt, index) => {
            const isCopied = copiedId === prompt.id;
            const isStarred = prompt.isStarred;

            return (
              <div
                key={prompt.id}
                onClick={() => handleQuickInsert(prompt.text)}
                title="Click to insert at editor cursor"
                className={cn(
                  "group relative bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] custom-shadow-hover hover:-translate-y-0.5",
                  "border-l-4",
                  isStarred ? "border-l-amber-400" : "border-l-indigo-500"
                )}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(
                    createDragData('prompt-card', prompt.id, prompt.text, prompt.title)
                  ));
                  window.dispatchEvent(new CustomEvent('prompt-drag-start', { detail: prompt.text }));
                }}
                onDragEnd={() => {
                  window.dispatchEvent(new CustomEvent('prompt-drag-end'));
                }}
              >
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 bg-white border border-slate-200 rounded-md shadow-sm z-10 flex items-center">
                  <GripVertical className="h-3.5 w-3.5 text-slate-400" />
                </div>

                <div className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {prompt.title}
                        </h3>
                        {globalSearch && (
                          <span className="text-[9px] font-medium bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                            {prompt.originTopicName}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 font-mono mt-1.5 whitespace-pre-wrap">
                        {prompt.text}
                      </p>

                      {/* Render tag badges */}
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {prompt.tags.map(tag => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(selectedTag === tag ? null : tag);
                              }}
                              className={cn(
                                "text-[9px] font-semibold border px-2 py-0.5 rounded-full transition-colors",
                                selectedTag === tag
                                  ? "bg-indigo-650 text-indigo-750 bg-indigo-50 border-indigo-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
                              )}
                              title={`Filter by tag #${tag}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => await toggleStarPrompt(prompt.originTopicId, prompt.id)}
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-150",
                          isStarred 
                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
                            : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                        )}
                        title={isStarred ? "Unstar prompt" : "Star prompt"}
                      >
                        <Star className={cn("h-3.5 w-3.5", isStarred && "fill-amber-500")} />
                      </Button>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-155">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleCopy(e, prompt.id, prompt.text)}
                          className={cn(
                            "h-8 w-8 rounded-lg transition-colors duration-150",
                            isCopied ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          )}
                          title="Copy text to clipboard"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 animate-in zoom-in-50" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>

                        <EditPromptDialog
                          topicId={prompt.originTopicId}
                          prompt={prompt}
                          trigger={
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-lg"
                              title="Edit prompt details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(prompt.originTopicId, prompt.id)}
                          className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                          title="Delete prompt template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-450 font-medium">
                    <span className="font-mono text-[9px] bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded text-slate-500">
                      Index #{index + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>{Math.ceil(prompt.text.length / 4)} tokens</span>
                      <span className="text-slate-300">•</span>
                      <span>{prompt.text.trim() ? prompt.text.trim().split(/\s+/).length : 0} words</span>
                      <span className="text-slate-300">•</span>
                      <span>{prompt.text.length} chars</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
