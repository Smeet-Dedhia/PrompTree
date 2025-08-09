'use client';

import { useAppStore } from '@/lib/store';
import { AddTopicDialog } from './AddTopicDialog';
import { cn } from '@/lib/utils';

export function TopicTabs() {
  const { topics, selectedTopicId, setSelectedTopic } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Topics</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={cn(
                'flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors',
                selectedTopicId === topic.id && 'bg-blue-50 border border-blue-200'
              )}
              onClick={() => setSelectedTopic(topic.id)}
            >
              <div className="flex-1">
                <div className="font-medium">{topic.name}</div>
                <div className="text-sm text-gray-500">
                  {topic.prompts.length} prompt{topic.prompts.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <AddTopicDialog />
      </div>
    </div>
  );
}
