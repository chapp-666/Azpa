import { create } from 'zustand';
import { ChatSession, Message } from '@/types';
import { loadSessions, saveSessions, generateId } from '@/utils/storage';
import { generateReply, availableModels, incrementDailyUsage } from '@/services/aiService';

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  selectedModelId: string;
  isLoading: boolean;
  pendingMessage: Message | null;
  cancelToken: (() => void) | null;
  isDarkMode: boolean;

  loadChats: () => void;
  createNewSession: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  setSelectedModel: (modelId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  cancelSending: () => void;
  clearCurrentSession: () => void;
  getCurrentSession: () => ChatSession | null;
  toggleDarkMode: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  selectedModelId: 'deepseek-v4-flash',
  isLoading: false,
  pendingMessage: null,
  cancelToken: null,
  isDarkMode: true,

  loadChats: () => {
    const sessions = loadSessions();
    set({ sessions });
    if (sessions.length > 0) {
      set({ currentSessionId: sessions[0].id });
    } else {
      get().createNewSession();
    }
  },

  createNewSession: () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '新对话',
      modelId: get().selectedModelId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const sessions = [newSession, ...get().sessions];
    set({ sessions, currentSessionId: newSession.id });
    saveSessions(sessions);
  },

  selectSession: (id: string) => {
    set({ currentSessionId: id });
  },

  deleteSession: (id: string) => {
    const sessions = get().sessions.filter(s => s.id !== id);
    set({ sessions });
    if (get().currentSessionId === id) {
      if (sessions.length > 0) {
        set({ currentSessionId: sessions[0].id });
      } else {
        get().createNewSession();
      }
    }
    saveSessions(sessions);
  },

  setSelectedModel: (modelId: string) => {
    set({ selectedModelId: modelId });
    const currentSession = get().getCurrentSession();
    if (currentSession) {
      const sessions = get().sessions.map(s =>
        s.id === currentSession.id ? { ...s, modelId } : s
      );
      set({ sessions });
      saveSessions(sessions);
    }
  },

  sendMessage: async (content: string) => {
    const { sessions, currentSessionId, selectedModelId, isLoading } = get();
    
    if (isLoading || !currentSessionId || !content.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex === -1) return;

    const updatedSession: ChatSession = {
      ...sessions[sessionIndex],
      messages: [...sessions[sessionIndex].messages, userMessage, loadingMessage],
      updatedAt: new Date(),
      modelId: selectedModelId,
    };

    if (updatedSession.title === '新对话') {
      updatedSession.title = content.trim().substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    set({ 
      sessions: updatedSessions, 
      isLoading: true,
      pendingMessage: loadingMessage,
    });
    saveSessions(updatedSessions);

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    set({ cancelToken: cancel });

    try {
      const reply = await generateReply(
        updatedSession.messages,
        selectedModelId,
        (progressContent) => {
          if (cancelled) return;
          const newSessions = get().sessions.map(s => {
            if (s.id !== currentSessionId) return s;
            return {
              ...s,
              messages: s.messages.map(m =>
                m.id === loadingMessage.id
                  ? { ...m, content: progressContent }
                  : m
              ),
            };
          });
          set({ sessions: newSessions });
        }
      );

      if (!cancelled) {
        const finalSessions = get().sessions.map(s => {
          if (s.id !== currentSessionId) return s;
          return {
            ...s,
            messages: s.messages.map(m =>
              m.id === loadingMessage.id ? reply : m
            ),
            updatedAt: new Date(),
          };
        });
        set({ sessions: finalSessions });
        saveSessions(finalSessions);
        
        incrementDailyUsage(selectedModelId);
      }
    } finally {
      set({ 
        isLoading: false, 
        pendingMessage: null,
        cancelToken: null,
      });
    }
  },

  cancelSending: () => {
    const { cancelToken, sessions, currentSessionId, pendingMessage } = get();
    
    if (cancelToken && pendingMessage && currentSessionId) {
      cancelToken();
      
      const updatedSessions = sessions.map(s => {
        if (s.id !== currentSessionId) return s;
        return {
          ...s,
          messages: s.messages.filter(m => m.id !== pendingMessage.id),
        };
      });
      
      set({ 
        sessions: updatedSessions, 
        isLoading: false,
        pendingMessage: null,
        cancelToken: null,
      });
      saveSessions(updatedSessions);
    }
  },

  clearCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    if (!currentSessionId) return;

    const updatedSessions = sessions.map(s => {
      if (s.id !== currentSessionId) return s;
      return {
        ...s,
        title: '新对话',
        messages: [],
        updatedAt: new Date(),
      };
    });

    set({ sessions: updatedSessions });
    saveSessions(updatedSessions);
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return sessions.find(s => s.id === currentSessionId) || null;
  },

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      document.documentElement.classList.toggle('light-mode', newMode);
      return { isDarkMode: newMode };
    });
  },
}));

export { availableModels };