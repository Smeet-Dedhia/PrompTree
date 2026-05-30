'use client';

import { useEffect } from 'react';
import { TopicTabs } from '@/components/TopicTabs';
import { PromptCards } from '@/components/PromptCards';
import { InputArea } from '@/components/InputArea';
import { useAppStore } from '@/lib/store';
import { Sparkles, Terminal, Trees } from 'lucide-react';

export default function Home() {
  const { topics, selectedTopicId, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Trees className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                PromptTree
              </span>
              <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full border border-violet-100 uppercase tracking-wider">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Manage and compose prompts with drag-and-drop hierarchy
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200">
            <Terminal className="h-3.5 w-3.5 text-indigo-500" />
            <span>Ready</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden w-full">
        
        <aside className="w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-4">
            <TopicTabs />
          </div>
        </aside>
        
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/20">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="font-semibold text-slate-800 text-lg">
                {selectedTopic ? selectedTopic.name : 'Select a Topic'}
              </h2>
            </div>
            {selectedTopic && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {selectedTopic.prompts.length} prompt{selectedTopic.prompts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            {selectedTopic ? (
              <div className="max-w-3xl mx-auto w-full">
                <PromptCards
                  topicId={selectedTopic.id}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="max-w-sm text-center p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm glass-panel flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base mb-1">No Topic Selected</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Select an existing topic from the sidebar or create a new one to begin managing prompts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <section className="w-[500px] border-l border-slate-200 bg-slate-50/50 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-6 flex-1 flex flex-col justify-center min-h-[500px]">
            <InputArea />
          </div>
        </section>
        
      </div>
    </div>
  );
}
