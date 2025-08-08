'use client';

import { useEffect } from 'react';
import { TopicTabs } from '@/components/TopicTabs';
import { PromptCards } from '@/components/PromptCards';
import { InputArea } from '@/components/InputArea';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { topics, selectedTopicId, reorderPrompts, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId);

  const handleReorder = async (newOrder: any[]) => {
    if (selectedTopicId) {
      await reorderPrompts(selectedTopicId, newOrder);
    }
  };

  return (
    <div className="grid grid-cols-12 h-full">
      {/* Pane 1: Topics List */}
      <div className="col-span-3 h-full">
        <TopicTabs />
      </div>
      
      {/* Pane 2: Prompt Cards */}
      <div className="col-span-4 h-full bg-gray-50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-white">
            <h2 className="text-lg font-semibold">
              {selectedTopic ? selectedTopic.name : 'Select a Topic'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedTopic ? (
              <PromptCards
                prompts={selectedTopic.prompts}
                topicId={selectedTopic.id}
                onReorder={handleReorder}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a topic to view prompts</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pane 3: Input Area */}
      <div className="col-span-5 h-full">
        <InputArea />
      </div>
    </div>
  );
}
