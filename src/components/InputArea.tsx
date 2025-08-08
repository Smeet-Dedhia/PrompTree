'use client';

import { useState, useRef } from 'react';
import { Copy, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';

export function InputArea() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { topics, selectedTopicId, addPrompt } = useAppStore();

  const handleCopy = async () => {
    if (text.trim()) {
      try {
        await navigator.clipboard.writeText(text);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  const handleSaveToTopic = async () => {
    if (!text.trim() || !selectedTopicId) return;

    const title = text.split('\n')[0].slice(0, 50) + (text.split('\n')[0].length > 50 ? '...' : '');
    
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title,
      text: text.trim(),
    };

    await addPrompt(selectedTopicId, newPrompt);
    setText('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (dragData.type === 'prompt-card' && dragData.text) {
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const beforeCursor = text.slice(0, cursorPosition);
        const afterCursor = text.slice(cursorPosition);
        
        setText(beforeCursor + dragData.text + afterCursor);
        
        // Set cursor position after inserted text
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

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Input Area</h2>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!text.trim()}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={!text.trim()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleSaveToTopic}
              disabled={!text.trim() || !selectedTopicId}
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Topic
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder="Compose your prompt here... Drop prompt cards to insert them at the cursor position."
          className="w-full h-full resize-none border rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
