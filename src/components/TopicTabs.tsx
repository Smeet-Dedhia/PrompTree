'use client';

import { useState } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddTopicDialog } from './AddTopicDialog';
import { cn } from '@/lib/utils';

export function TopicTabs() {
  const { topics, selectedTopicId, setSelectedTopic, editTopic, deleteTopic } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEditStart = (topicId: string, currentName: string) => {
    setEditingId(topicId);
    setEditName(currentName);
  };

  const handleEditSave = async () => {
    if (editingId && editName.trim()) {
      await editTopic(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic? All prompts will be lost.')) {
      await deleteTopic(topicId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Topics</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={cn(
              'flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b',
              selectedTopicId === topic.id && 'bg-blue-50 border-blue-200'
            )}
            onClick={() => setSelectedTopic(topic.id)}
          >
            {editingId === topic.id ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button size="sm" onClick={handleEditSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleEditCancel}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-sm text-gray-500">
                    {topic.prompts.length} prompt{topic.prompts.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(topic.id, topic.name);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(topic.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <AddTopicDialog />
      </div>
    </div>
  );
}
