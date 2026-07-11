export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  provider?: string;
  category?: string;
  hasDailyLimit?: boolean;
  isTest?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  modelId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  selectedModelId: string;
  isLoading: boolean;
}