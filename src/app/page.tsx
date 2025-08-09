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
    <div className="flex flex-row w-full h-screen bg-gray-50" style={{ width: '100vw', height: '100vh', display: 'flex', paddingLeft: '10%', paddingRight: '10%' }}>
      {/* Pane 1: Topics List */}
      <div className="border-r border-gray-200 bg-white" style={{ height: '90vh', flex: '0 0 10%', justifyItems: 'center' }}>
        <div className="h-full flex items-center justify-center p-4">
          <div className="w-full max-w-xs">
            <TopicTabs />
          </div>
        </div>
      </div>
      
      {/* Pane 2: Prompt Cards */}
      <div className="bg-gray-50" style={{ height: '90vh', flex: '0 0 35%', justifyItems: 'center' }}>
        <div className="h-full flex flex-col">
          <div className="m-4 mb-2 p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="text-center text-lg font-semibold">
              {selectedTopic ? selectedTopic.name : 'Select a Topic'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 pt-0">
            {selectedTopic ? (
              <div className="w-full max-w-md">
                <PromptCards
                  prompts={selectedTopic.prompts}
                  topicId={selectedTopic.id}
                  onReorder={handleReorder}
                />
              </div>
            ) : (
              <div className="w-full max-w-md p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <p>Select a topic to view prompts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pane 3: Input Area */}
      <div className="border-l border-gray-200 bg-white" style={{ height: '90vh', flex: '0 0 35%', justifyItems: 'center' }}>
        <div className="h-full flex items-center justify-center p-4">
          <InputArea />
        </div>
      </div>
    </div>
  );
}
