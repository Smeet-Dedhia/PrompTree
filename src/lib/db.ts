import Dexie, { Table } from 'dexie';
import { Topic, Prompt } from '@/types';

export class PromptTreeDB extends Dexie {
  topics!: Table<Topic>;
  prompts!: Table<Prompt>;

  constructor() {
    super('PromptTreeDB');
    this.version(1).stores({
      topics: 'id, name',
      prompts: 'id, topicId, title'
    });
  }
}

export const db = new PromptTreeDB();

export const loadTopics = async (): Promise<Topic[]> => {
  const topics = await db.topics.toArray();
  const prompts = await db.prompts.toArray();
  
  return topics.map(topic => ({
    ...topic,
    prompts: prompts.filter(p => p.topicId === topic.id)
  }));
};

export const saveTopic = async (topic: Topic): Promise<void> => {
  await db.topics.put(topic);
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  await db.topics.delete(topicId);
  await db.prompts.where('topicId').equals(topicId).delete();
};

export const savePrompt = async (prompt: Prompt & { topicId: string }): Promise<void> => {
  await db.prompts.put(prompt);
};

export const deletePrompt = async (promptId: string): Promise<void> => {
  await db.prompts.delete(promptId);
};
