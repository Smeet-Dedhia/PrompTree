'use client';

import { useState } from 'react';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { EditPromptDialog } from './EditPromptDialog';
import { Prompt } from '@/types';
import { createDragData } from '@/lib/dndHandlers';
import { cn } from '@/lib/utils';

interface PromptCardsProps {
  prompts: Prompt[];
  topicId: string;
  onReorder: (newOrder: Prompt[]) => void;
}

export function PromptCards({ prompts, topicId, onReorder }: PromptCardsProps) {
  const deletePrompt = useAppStore(state => state.deletePrompt);

  const handleDelete = async (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(topicId, promptId);
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p>No prompts yet</p>
          <p className="text-sm">Drag text from the input area to create prompts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="group relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/json', JSON.stringify(
              createDragData('prompt-card', prompt.id, prompt.text, prompt.title)
            ));
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{prompt.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {prompt.text}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditPromptDialog
                topicId={topicId}
                prompt={prompt}
                trigger={
                  <Button size="sm" variant="ghost">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(prompt.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
}
