'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { Prompt } from '@/types';

interface EditPromptDialogProps {
  topicId: string;
  prompt: Prompt;
  trigger: React.ReactNode;
}

export function EditPromptDialog({ topicId, prompt, trigger }: EditPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(prompt.title);
  const [text, setText] = useState(prompt.text);
  const editPrompt = useAppStore(state => state.editPrompt);

  useEffect(() => {
    setTitle(prompt.title);
    setText(prompt.text);
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && text.trim()) {
      await editPrompt(topicId, prompt.id, {
        ...prompt,
        title: title.trim(),
        text: text.trim(),
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Prompt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title..."
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter prompt content..."
              className="w-full min-h-[200px] rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-white transition-all duration-200 font-mono resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-2 border-gray-200 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !text.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
