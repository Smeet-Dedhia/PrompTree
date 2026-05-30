'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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

export function AddTopicDialog() {
  const [open, setOpen] = useState(false);
  const [topicName, setTopicName] = useState('');
  const addTopic = useAppStore(state => state.addTopic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topicName.trim()) {
      await addTopic(topicName.trim());
      setTopicName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border border-indigo-200 bg-indigo-50/20 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition-all duration-150 font-medium rounded-xl h-9 hover:-translate-y-0.5 active:scale-98"
        >
          <Plus className="h-4 w-4 mr-1.5 flex-shrink-0" />
          Add Topic
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">Create New Topic</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Topic Title
            </label>
            <Input
              placeholder="Enter a descriptive topic category name..."
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-2.5 pt-3">
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
              disabled={!topicName.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium px-5 rounded-xl border-none transition-all duration-200"
            >
              Create Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
