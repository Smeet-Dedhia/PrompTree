'use client';

import { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';

export function InputArea() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedTopicId, addPrompt } = useAppStore();

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
    <div className="flex flex-col h-full bg-white border-l">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Prompt</h2>
          <Button
            size="sm"
            onClick={handleSaveToTopic}
            disabled={!text.trim() || !selectedTopicId}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
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
