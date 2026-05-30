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
      
      <DialogContent className="sm:max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">Edit Prompt Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Prompt Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a recognizable title..."
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Prompt Body Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter prompt instruction body..."
              className="w-full min-h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none leading-relaxed"
            />
          </div>
          
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !text.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium px-5 rounded-xl border-none transition-all duration-200"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
