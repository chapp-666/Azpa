import { Plus, Trash2, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatSession } from '@/types';

interface GroupedSession {
  date: string;
  sessions: ChatSession[];
}

const groupSessionsByDate = (sessions: ChatSession[]): GroupedSession[] => {
  const groups: Record<string, ChatSession[]> = {};
  
  sessions.forEach(session => {
    const date = session.updatedAt;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateLabel: string;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateLabel = '昨天';
    } else {
      dateLabel = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(session);
  });
  
  return Object.entries(groups)
    .map(([date, sessions]) => ({ date, sessions }))
    .sort((a, b) => {
      const dateOrder = ['今天', '昨天'];
      const aIndex = dateOrder.indexOf(a.date);
      const bIndex = dateOrder.indexOf(b.date);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
};

export const ChatList = () => {
  const { sessions, currentSessionId, selectSession, deleteSession, createNewSession } = useChatStore();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const groupedSessions = groupSessionsByDate(sessions);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个对话吗？')) {
      deleteSession(id);
      setExpandedMenu(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <button
        onClick={createNewSession}
        className="flex items-center gap-2 px-3 py-2.5 mb-3 bg-azpa-accent/10 hover:bg-azpa-accent/20 text-azpa-accent border border-azpa-accent/30 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">开始新对话</span>
      </button>
      
      <div className="flex-1 overflow-y-auto space-y-1">
        {groupedSessions.map((group) => (
          <div key={group.date}>
            <div className="px-3 py-2 text-xs font-medium text-azpa-textSecondary/50">
              {group.date}
            </div>
            {group.sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  currentSessionId === session.id
                    ? 'bg-azpa-card border border-azpa-border'
                    : 'hover:bg-azpa-hover'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    currentSessionId === session.id
                      ? 'bg-azpa-accent/20'
                      : 'bg-azpa-card'
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 ${
                      currentSessionId === session.id ? 'text-azpa-accent' : 'text-azpa-textSecondary'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      currentSessionId === session.id ? 'text-azpa-text font-medium' : 'text-azpa-textSecondary'
                    }`}
                  >
                    {session.title}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMenu(expandedMenu === session.id ? null : session.id);
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-azpa-hover transition-colors relative"
                >
                  <MoreHorizontal className="w-4 h-4 text-azpa-textSecondary" />
                  {expandedMenu === session.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-azpa-card border border-azpa-border rounded-lg shadow-xl py-1 z-10">
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-azpa-textSecondary hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除对话
                      </button>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};