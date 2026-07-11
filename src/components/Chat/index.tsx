import { useChatStore } from '@/store/chatStore';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { EmptyState } from '@/components/common/EmptyState';
import { MoreHorizontal, RefreshCw, Sun, Moon, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const Chat = () => {
  const { getCurrentSession, createNewSession, clearCurrentSession, isDarkMode, toggleDarkMode } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);

  const currentSession = getCurrentSession();

  const handleClear = () => {
    clearCurrentSession();
    setShowMenu(false);
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col">
        <EmptyState onStartChat={createNewSession} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="border-b border-azpa-border bg-azpa-sidebar/50 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-azpa-accent/20 flex items-center justify-center">
            <span className="text-azpa-accent font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-azpa-text">{currentSession.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          <button className="p-2 rounded-lg hover:bg-azpa-hover transition-colors">
            <RefreshCw className="w-4 h-4 text-azpa-textSecondary" />
          </button>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-azpa-hover transition-colors"
            title={isDarkMode ? '切换白天模式' : '切换夜间模式'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-azpa-textSecondary" />
            ) : (
              <Moon className="w-4 h-4 text-azpa-textSecondary" />
            )}
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-azpa-hover transition-colors relative"
          >
            <MoreHorizontal className="w-4 h-4 text-azpa-textSecondary" />
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-azpa-card border border-azpa-border rounded-lg shadow-xl py-1 z-10">
                <button
                  onClick={handleClear}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-azpa-textSecondary hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  清空对话
                </button>
              </div>
            )}
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={currentSession.messages} />
      </div>
      
      <InputArea />
    </div>
  );
};