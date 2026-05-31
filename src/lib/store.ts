import { create } from 'zustand';
import { AppState, Topic, Prompt } from '@/types';
import { loadTopics, saveTopic, deleteTopic as deleteTopicDB, savePrompt, deletePrompt as deletePromptDB } from './db';

export const useAppStore = create<AppState>((set, get) => ({
  topics: [],
  selectedTopicId: null,

  addTopic: async (name: string) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name,
      prompts: []
    };
    
    await saveTopic(newTopic);
    set(state => ({
      topics: [...state.topics, newTopic]
    }));
  },

  editTopic: async (id: string, name: string) => {
    const state = get();
    const updatedTopics = state.topics.map(topic =>
      topic.id === id ? { ...topic, name } : topic
    );
    
    const topicToUpdate = updatedTopics.find(t => t.id === id);
    if (topicToUpdate) {
      await saveTopic(topicToUpdate);
    }
    
    set({ topics: updatedTopics });
  },

  deleteTopic: async (id: string) => {
    await deleteTopicDB(id);
    set(state => ({
      topics: state.topics.filter(topic => topic.id !== id),
      selectedTopicId: state.selectedTopicId === id ? null : state.selectedTopicId
    }));
  },

  addPrompt: async (topicId: string, prompt: Prompt) => {
    const state = get();
    const updatedTopics = state.topics.map(topic =>
      topic.id === topicId
        ? { ...topic, prompts: [...topic.prompts, prompt] }
        : topic
    );
    
    await savePrompt({ ...prompt, topicId });
    set({ topics: updatedTopics });
  },

  editPrompt: async (topicId: string, promptId: string, updated: Prompt) => {
    const state = get();
    const updatedTopics = state.topics.map(topic =>
      topic.id === topicId
        ? {
            ...topic,
            prompts: topic.prompts.map(prompt =>
              prompt.id === promptId ? updated : prompt
            )
          }
        : topic
    );
    
    await savePrompt({ ...updated, topicId });
    set({ topics: updatedTopics });
  },

  deletePrompt: async (topicId: string, promptId: string) => {
    await deletePromptDB(promptId);
    set(state => ({
      topics: state.topics.map(topic =>
        topic.id === topicId
          ? { ...topic, prompts: topic.prompts.filter(p => p.id !== promptId) }
          : topic
      )
    }));
  },

  toggleStarPrompt: async (topicId: string, promptId: string) => {
    const state = get();
    let promptToUpdate: Prompt | undefined;
    
    const updatedTopics = state.topics.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          prompts: topic.prompts.map(prompt => {
            if (prompt.id === promptId) {
              promptToUpdate = { ...prompt, isStarred: !prompt.isStarred };
              return promptToUpdate;
            }
            return prompt;
          })
        };
      }
      return topic;
    });

    if (promptToUpdate) {
      await savePrompt({ ...promptToUpdate, topicId });
    }
    set({ topics: updatedTopics });
  },

  reorderPrompts: async (topicId: string, newOrder: Prompt[]) => {
    const state = get();
    const updatedTopics = state.topics.map(topic =>
      topic.id === topicId ? { ...topic, prompts: newOrder } : topic
    );
    
    // Save each prompt with updated order
    for (const prompt of newOrder) {
      await savePrompt({ ...prompt, topicId });
    }
    
    set({ topics: updatedTopics });
  },

  setSelectedTopic: (topicId: string | null) => {
    set({ selectedTopicId: topicId });
  },

  // Initialize store with data from IndexedDB
  initialize: async () => {
    let topics = await loadTopics();
    
    if (topics.length === 0) {
      const { SEED_TOPICS } = await import('./seeds');
      const seededTopics: Topic[] = [];
      
      for (const t of SEED_TOPICS) {
        const topicId = crypto.randomUUID();
        const prompts: Prompt[] = t.prompts.map(p => ({
          ...p,
          id: crypto.randomUUID(),
          topicId
        }));
        
        const newTopic: Topic = {
          id: topicId,
          name: t.name,
          prompts
        };
        
        await saveTopic(newTopic);
        for (const prompt of prompts) {
          await savePrompt({ ...prompt, topicId });
        }
        seededTopics.push(newTopic);
      }
      topics = seededTopics;
    }
    
    const selectedId = get().selectedTopicId;
    const nextSelectedId = selectedId || (topics.length > 0 ? topics[0].id : null);
    
    set({ topics, selectedTopicId: nextSelectedId });
  }
}));
