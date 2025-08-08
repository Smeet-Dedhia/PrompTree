export interface Prompt {
  id: string;
  title: string;
  text: string;
  topicId?: string;
}

export interface Topic {
  id: string;
  name: string;
  prompts: Prompt[];
}

export interface AppState {
  topics: Topic[];
  selectedTopicId: string | null;
  addTopic: (name: string) => void;
  editTopic: (id: string, name: string) => void;
  deleteTopic: (id: string) => void;
  addPrompt: (topicId: string, prompt: Prompt) => void;
  editPrompt: (topicId: string, promptId: string, updated: Prompt) => void;
  deletePrompt: (topicId: string, promptId: string) => void;
  reorderPrompts: (topicId: string, newOrder: Prompt[]) => void;
  setSelectedTopic: (topicId: string | null) => void;
  initialize: () => Promise<void>;
}
