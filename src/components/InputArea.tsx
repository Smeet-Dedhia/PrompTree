'use client';

import { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';
import { SaveLoadButtons } from './SaveLoadButtons';

export function InputArea() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedTopicId, addPrompt } = useAppStore();

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
    <div className="w-[90%] h-[70%] flex flex-col bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">New Prompt</h2>
          <div className="flex items-center gap-2">
            <SaveLoadButtons />
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
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
          </label>
          <Input
            type="text"
            placeholder="Enter a title for your prompt..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Content
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            placeholder="Compose your prompt here... Drop prompt cards to insert them at the cursor position."
            className="w-full h-full resize-none border rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}
