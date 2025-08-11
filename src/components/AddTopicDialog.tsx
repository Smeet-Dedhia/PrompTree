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
          className="w-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic Name
            </label>
            <Input
              placeholder="Enter topic name..."
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              autoFocus
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
              disabled={!topicName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Add Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
