'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, HelpCircle, FilePlus2, Quote, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';
import { SaveLoadButtons } from './SaveLoadButtons';
import { cn } from '@/lib/utils';

export function InputArea() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [compiledCopied, setCompiledCopied] = useState(false);

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
        
        setText(beforeCursor + insertText + afterCursor);
        
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = cursorPosition + insertText.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
          }
        }, 0);
      }
    };

    window.addEventListener('insert-prompt', handleInsert);
    return () => {
      window.removeEventListener('insert-prompt', handleInsert);
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

  const handleSaveToTopic = async () => {
    if (!text.trim() || !selectedTopicId) return;

    const promptTitle = title.trim() || text.split('\n')[0].slice(0, 50) + (text.split('\n')[0].length > 50 ? '...' : '');
    
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: promptTitle,
      text: text.trim(),
    };

    await addPrompt(selectedTopicId, newPrompt);
    setText('');
    setTitle('');
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
        
        setText(beforeCursor + dragData.text + afterCursor);
        
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = cursorPosition + dragData.text.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
            textareaRef.current.focus();
          }
        }, 0);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
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

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm custom-shadow flex flex-col overflow-hidden h-[680px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FilePlus2 className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Prompt Composer</h2>
            </div>
            
            <Button
              size="sm"
              onClick={handleSaveToTopic}
              disabled={!text.trim() || !selectedTopicId}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/10 px-4 rounded-xl border-none transition-all duration-200 hover:-translate-y-0.5"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save to {selectedTopic ? selectedTopic.name : 'Topic'}
            </Button>
          </div>
          
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Workspace Operations</span>
            <SaveLoadButtons />
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-5 flex flex-col min-h-0 bg-slate-50/10 overflow-y-auto space-y-4">
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
        
        <div className="flex-1 flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prompt Content
            </label>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono">
              <Quote className="h-2.5 w-2.5 text-slate-500" />
              <span>Supports Drag & Click-to-Insert</span>
            </div>
          </div>
          
          <div className="flex-1 relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-200 flex flex-col min-h-[160px]">
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
                "w-full flex-1 resize-none p-4 text-sm font-mono focus:outline-none bg-transparent leading-relaxed transition-all duration-200 min-h-[140px]",
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
          </div>
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
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Click any card on the board to insert it directly.</span>
          </div>
          <span className="font-mono">{text.length} chars</span>
        </div>

      </div>
    </div>
  );
}
