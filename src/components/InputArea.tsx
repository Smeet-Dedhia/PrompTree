'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, HelpCircle, FilePlus2, Quote, Sparkles, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';
import { cn } from '@/lib/utils';

const formatTruncatedLine = (line: string): string => {
  const trimmed = line.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/);
  if (words.length > 8) {
    const firstFew = words.slice(0, 3).join(' ');
    const lastFew = words.slice(-3).join(' ');
    return `${firstFew} ... ${lastFew}`;
  }
  return line;
};

export function InputArea() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [compiledCopied, setCompiledCopied] = useState(false);
  const [composerCopied, setComposerCopied] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [draggingCardText, setDraggingCardText] = useState('');
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const { selectedTopicId, addPrompt, topics } = useAppStore();
  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  useEffect(() => {
    const handleInsert = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        const insertText = customEvent.detail;
        const currentText = textRef.current;

        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const beforeCursor = currentText.slice(0, cursorPosition);
        const afterCursor = currentText.slice(cursorPosition);

        let spacing = '';
        if (beforeCursor.trim()) {
          if (beforeCursor.endsWith('\n\n')) {
            spacing = '';
          } else if (beforeCursor.endsWith('\n')) {
            spacing = '\n';
          } else {
            spacing = '\n\n';
          }
        }

        const newInsertion = spacing + insertText;
        setText(beforeCursor + newInsertion + afterCursor);

        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = cursorPosition + newInsertion.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
          }
        }, 0);
      }
    };

    const handleDragStart = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setIsDraggingCard(true);
      if (customEvent.detail) {
        setDraggingCardText(customEvent.detail);
      }
    };

    const handleDragEnd = () => {
      setIsDraggingCard(false);
      setDraggingCardText('');
      setHoveredLineIndex(null);
    };

    window.addEventListener('insert-prompt', handleInsert);
    window.addEventListener('prompt-drag-start', handleDragStart);
    window.addEventListener('prompt-drag-end', handleDragEnd);
    return () => {
      window.removeEventListener('insert-prompt', handleInsert);
      window.removeEventListener('prompt-drag-start', handleDragStart);
      window.removeEventListener('prompt-drag-end', handleDragEnd);
    };
  }, []);

  const getVariables = (str: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(str)) !== null) {
      matches.add(match[1].trim());
    }
    return Array.from(matches);
  };

  const variables = getVariables(text);

  const handleVarChange = (name: string, value: string) => {
    setVarValues(prev => ({ ...prev, [name]: value }));
  };

  const compilePrompt = (): string => {
    let compiled = text;
    variables.forEach(v => {
      const replacement = varValues[v] || `{{${v}}}`;
      compiled = compiled.replaceAll(`{{${v}}}`, replacement);
    });
    return compiled;
  };

  const handleCopyCompiled = () => {
    const compiled = compilePrompt();
    navigator.clipboard.writeText(compiled);
    setCompiledCopied(true);
    setTimeout(() => setCompiledCopied(false), 1500);
  };

  const handleCopyComposer = () => {
    navigator.clipboard.writeText(text);
    setComposerCopied(true);
    setTimeout(() => setComposerCopied(false), 1500);
  };

  const parseTags = (str: string): string[] => {
    return str
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  };

  const handleSaveToTopic = async () => {
    if (!text.trim() || !selectedTopicId) return;

    const promptTitle = title.trim() || text.split('\n')[0].slice(0, 50) + (text.split('\n')[0].length > 50 ? '...' : '');

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: promptTitle,
      text: text.trim(),
      tags: parseTags(tagsText),
      createdAt: Date.now(),
    };

    await addPrompt(selectedTopicId, newPrompt);
    setText('');
    setTitle('');
    setTagsText('');
    setVarValues({});
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));

      if (dragData.type === 'prompt-card' && dragData.text) {
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const beforeCursor = text.slice(0, cursorPosition);
        const afterCursor = text.slice(cursorPosition);

        let spacing = '';
        if (beforeCursor.trim()) {
          if (beforeCursor.endsWith('\n\n')) {
            spacing = '';
          } else if (beforeCursor.endsWith('\n')) {
            spacing = '\n';
          } else {
            spacing = '\n\n';
          }
        }

        const newInsertion = spacing + dragData.text;
        setText(beforeCursor + newInsertion + afterCursor);

        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = cursorPosition + newInsertion.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
          }
        }, 0);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  const handleDropAtLine = (lineIndex: number) => {
    if (!draggingCardText) return;

    const currentLines = text.split('\n');
    const beforeSpacing = (lineIndex > 0 && currentLines[lineIndex - 1] !== '') ? '\n' : '';
    const afterSpacing = '\n';

    currentLines[lineIndex] = beforeSpacing + draggingCardText + afterSpacing;
    setText(currentLines.join('\n'));

    setIsDraggingCard(false);
    setDraggingCardText('');
    setHoveredLineIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentenceCount = text.trim() ? text.trim().split(/[.!?]+/).filter(Boolean).length : 0;
  const tokenEstimate = Math.ceil(text.length / 4);

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl shadow-sm custom-shadow flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FilePlus2 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Prompt Composer</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                disabled={!text.trim()}
                onClick={() => {
                  if (text.trim().length <= 50) {
                    setText('');
                    setTitle('');
                    setTagsText('');
                    setVarValues({});
                  } else {
                    setShowClearConfirm(true);
                  }
                }}
                className="h-9 px-3 rounded-xl border border-rose-250 bg-rose-50/45 text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 hover:-translate-y-0.5 font-medium text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>Clear</span>
              </Button>

              {showClearConfirm && (
                <div className="absolute top-11 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <p className="text-[11px] font-semibold text-slate-850 mb-2.5 leading-relaxed">
                    Clear composer draft? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowClearConfirm(false)}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setText('');
                        setTitle('');
                        setTagsText('');
                        setVarValues({});
                        setShowClearConfirm(false);
                      }}
                      className="h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-750 text-[10px] text-white font-semibold shadow-xs border-none"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="absolute -top-1 left-4 w-2.5 h-2.5 bg-white border-l border-t border-slate-200 rotate-45" />
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={!text.trim()}
              onClick={handleCopyComposer}
              className={cn(
                "h-9 px-3 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 font-medium text-xs",
                composerCopied
                  ? "bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100/85"
                  : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {composerCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span>Copy Content</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleSaveToTopic}
              disabled={!text.trim() || !selectedTopicId}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/10 px-4 rounded-xl border-none h-9 transition-all duration-200 hover:-translate-y-0.5 text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save to {selectedTopic ? selectedTopic.name : 'Topic'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col min-h-0 bg-slate-50/10 overflow-y-auto space-y-4">
        {/* Title Input at Top */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Prompt Title <span className="text-[10px] font-normal text-slate-400">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="Give your prompt a reference title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-150"
          />
        </div>

        {/* Monospace Text Area in Middle */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prompt Content
            </label>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono">
              <Quote className="h-2.5 w-2.5 text-slate-500" />
              <span>Supports Drag & Click-to-Insert</span>
            </div>
          </div>

          <div className="flex-1 relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-200 flex flex-col min-h-[140px]">
            {isDraggingCard ? (
              <div
                className="w-full flex-1 overflow-y-auto p-4 text-sm font-mono leading-relaxed bg-indigo-50/10 rounded-xl flex flex-col min-h-[120px]"
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-indigo-100/50 flex-shrink-0 select-none">
                  <div className="h-5.5 w-5.5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[10px] font-sans font-bold text-indigo-850 uppercase tracking-wider">
                    Snap & Drop: Place card content on empty lines only
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1.5 overflow-y-auto">
                  {text.split('\n').map((line, index) => {
                    const isEmpty = line === '';

                    return (
                      <div
                        key={index}
                        className="flex items-stretch min-h-[30px] group/line relative"
                      >
                        <div className="w-8 select-none text-slate-400 text-[10px] font-mono flex items-center justify-end pr-2.5 border-r border-slate-200/50 flex-shrink-0 font-semibold">
                          {index + 1}
                        </div>

                        {isEmpty ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (hoveredLineIndex !== index) {
                                setHoveredLineIndex(index);
                              }
                            }}
                            onDragLeave={() => {
                              setHoveredLineIndex(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropAtLine(index);
                            }}
                            className={cn(
                              "flex-1 ml-3 my-0.5 rounded-lg border border-dashed text-xs flex items-center px-3.5 transition-all duration-150 relative cursor-copy",
                              hoveredLineIndex === index
                                ? "border-emerald-500 bg-emerald-50/65 text-emerald-800 ring-2 ring-emerald-100 shadow-xs scale-[1.01]"
                                : "border-indigo-250 bg-indigo-50/15 text-indigo-500 hover:border-indigo-350 hover:bg-indigo-50/30"
                            )}
                          >
                            {hoveredLineIndex === index ? (
                              <div className="flex items-center gap-2 font-sans font-bold">
                                <span className="w-1.5 h-4 bg-emerald-600 animate-pulse rounded-xs" />
                                <span className="text-emerald-700">↳ Drop to Place Content Here</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 font-sans font-medium opacity-85 select-none text-[10px]">
                                <span className="w-1 h-3 bg-indigo-400 rounded-xs animate-pulse" />
                                <span>Empty line - Place content here</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 pl-3 py-1 font-mono text-xs text-slate-400 italic break-all whitespace-pre-wrap select-none opacity-80">
                            {formatTruncatedLine(line)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  placeholder={
                    selectedTopicId
                      ? "Compose your template here. Tip: Use double curly braces, e.g. {{user_name}}, to create dynamic text inputs instantly!"
                      : "Please select a topic from the sidebar before composing."
                  }
                  disabled={!selectedTopicId}
                  className={cn(
                    "w-full flex-1 resize-none p-4 text-sm font-mono focus:outline-none bg-transparent leading-relaxed transition-all duration-200 min-h-[120px]",
                    !selectedTopicId && "cursor-not-allowed opacity-60"
                  )}
                />

                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-indigo-50/90 backdrop-blur-xs transition-all duration-200 opacity-0 scale-98",
                    isDragOver && "opacity-100 scale-100 border-indigo-500"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-sm animate-bounce">
                    <Quote className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-indigo-900">Drop prompt card to insert text</p>
                  <p className="text-[10px] text-indigo-500 mt-0.5">Will be appended at cursor position</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags Input at Bottom of Prompt Text Box */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tags <span className="text-[10px] font-normal text-slate-400">(comma-separated, optional)</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. system, coding, few-shot"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-150"
          />
        </div>

        {variables.length > 0 && (
          <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 space-y-3.5 flex-shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
              <div className="flex items-center gap-1.5 text-indigo-800">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Dynamic Variables Form</h3>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCompiled}
                className={cn(
                  "h-7 text-[10px] px-2.5 rounded-lg border transition-all duration-150 hover:-translate-y-0.5 font-medium",
                  compiledCopied
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                )}
              >
                {compiledCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    <span>Copied Compiled!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    <span>Copy Compiled Prompt</span>
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[160px] overflow-y-auto pr-1">
              {variables.map(v => (
                <div key={v} className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase truncate">
                    {v.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    placeholder={`Value for {{${v}}}`}
                    value={varValues[v] || ''}
                    onChange={(e) => handleVarChange(v, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-600">Tokens:</span>
              <span className="font-mono text-slate-800 bg-indigo-50/50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{tokenEstimate}</span>
              <button
                type="button"
                onClick={() => setShowTokenInfo(!showTokenInfo)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                title="Token estimation details"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-600">Words:</span>
              <span className="font-mono text-slate-800">{wordCount}</span>
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-600">Sentences:</span>
              <span className="font-mono text-slate-800">{sentenceCount}</span>
            </span>
          </div>

          <span className="font-mono text-slate-500 font-semibold">{text.length} chars</span>

          {showTokenInfo && (
            <div className="absolute bottom-12 left-2.5 right-2.5 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-slate-600 leading-relaxed text-[11px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                <span className="font-bold text-slate-850 uppercase tracking-wider text-[10px]">About Token Estimation</span>
                <button
                  onClick={() => setShowTokenInfo(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mb-1.5 text-slate-500">
                Tokens are the basic processing units for LLMs. In English text, a token is roughly equivalent to **4 characters** or about **0.75 words**.
              </p>
              <p className="font-medium text-indigo-600 bg-indigo-50/50 p-2 rounded-lg font-mono text-[10px]">
                Formula: Math.ceil(characters / 4)
              </p>
              <div className="absolute -bottom-1.5 left-16 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
