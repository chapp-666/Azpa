import { Menu, X, Settings, Trash2, Search, Key } from 'lucide-react';
import { useState } from 'react';
import { ChatList } from './ChatList';
import { ApiKeySettings } from '@/components/Settings/ApiKeySettings';
import { useChatStore } from '@/store/chatStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { clearCurrentSession, getCurrentSession } = useChatStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const currentSession = getCurrentSession();
  const hasMessages = currentSession?.messages.length > 0;

  const handleClear = () => {
    if (confirmClear) {
      clearCurrentSession();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-azpa-sidebar border border-azpa-border lg:hidden"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-azpa-text" />
        ) : (
          <Menu className="w-5 h-5 text-azpa-text" />
        )}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-azpa-sidebar border-r border-azpa-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 border-b border-azpa-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azpa-accent to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-azpa-text">Azpa</h1>
              <p className="text-xs text-azpa-textSecondary">AI对话助手</p>
            </div>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-azpa-textSecondary/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索对话..."
              className="w-full pl-10 pr-4 py-2 bg-azpa-card border border-azpa-border rounded-lg text-sm text-azpa-text placeholder-azpa-textSecondary/50 focus:outline-none focus:border-azpa-accent/50"
            />
          </div>
          
          
        </div>

        <div className="flex-1 p-3 overflow-hidden">
          <ChatList />
        </div>

        <div className="p-3 border-t border-azpa-border space-y-2">
          {hasMessages && (
            <button
              onClick={handleClear}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                confirmClear
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-azpa-card text-azpa-textSecondary hover:text-red-400 hover:bg-red-500/10 border border-transparent'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">
                {confirmClear ? '确认清空?' : '清空对话'}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-azpa-card text-azpa-textSecondary hover:text-azpa-text transition-colors border border-transparent hover:border-azpa-border"
          >
            <Key className="w-4 h-4" />
            <span className="text-sm">API Key</span>
          </button>
        </div>
      </aside>

      {showSettings && <ApiKeySettings onClose={() => setShowSettings(false)} />}
    </>
  );
};