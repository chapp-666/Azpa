import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, X, Paperclip, Smile, ChevronDown, Check } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { availableModels, getDailyUsage } from '@/services/aiService';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

export const InputArea = () => {
  const [content, setContent] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const { sendMessage, cancelSending, isLoading, currentSessionId, selectedModelId, setSelectedModel } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  const currentModel = availableModels.find(m => m.id === selectedModelId);

  const groupedModels = availableModels.reduce((acc, model) => {
    const category = model.category || 'default';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelDropdown(false);
  };

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, currentSessionId]);

  const handleSend = () => {
    if (!isLoading && content.trim()) {
      sendMessage(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      if (isLoading) {
        cancelSending();
      } else {
        setContent('');
      }
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCancel = () => {
    cancelSending();
  };

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    handleResize();
  }, [content]);

  return (
    <div className="border-t border-azpa-border bg-azpa-sidebar/80 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto relative" ref={dropdownContainerRef}>
        {isLoading && (
          <div className="mb-3 flex items-center justify-center">
            <LoadingIndicator size="sm" />
          </div>
        )}
        <div className="bg-azpa-card border border-azpa-border rounded-xl">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-azpa-border/50">
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-azpa-hover/50 transition-colors"
              >
                <span className="text-xs text-azpa-textSecondary">{currentModel?.name || 'Azpa'}</span>
                <ChevronDown className={`w-3 h-3 text-azpa-textSecondary transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showModelDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-56 bg-azpa-card border border-azpa-border rounded-lg shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                  {Object.entries(groupedModels).map(([category, models]) => (
                    <div key={category}>
                      {category !== 'default' && (
                        <div className="px-3 py-2 bg-azpa-sidebar/50 border-b border-azpa-border">
                          <span className="text-xs font-medium text-azpa-textSecondary/70">
                            {category}
                          </span>
                        </div>
                      )}
                      {models.map((model) => {
                        const usage = model.hasDailyLimit ? getDailyUsage(model.id) : null;
                        return (
                          <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-azpa-hover transition-colors ${
                              model.id === selectedModelId ? 'bg-azpa-accent/5' : ''
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                model.id === selectedModelId ? 'bg-azpa-accent' : 'bg-transparent'
                              }`}
                            />
                            <span className={`text-sm truncate ${
                              model.id === selectedModelId 
                                ? 'text-azpa-accent' 
                                : model.isTest 
                                  ? 'text-azpa-textSecondary/50' 
                                  : 'text-azpa-text'
                            }`}>
                              {model.name}
                              {model.isTest && (
                                <span className="text-xs ml-1">（测试）</span>
                              )}
                            </span>
                            {usage !== null && (
                              <span className="text-xs text-azpa-textSecondary/50 ml-auto">
                                {usage}/10
                              </span>
                            )}
                            {model.id === selectedModelId && (
                              <Check className="w-3 h-3 text-azpa-accent" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-azpa-textSecondary/50">|</span>
            <span className="text-xs text-azpa-textSecondary/50">
              按 Enter 发送，Shift+Enter 换行
            </span>
          </div>
          <div className="flex items-end gap-2 px-4 py-3">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-azpa-hover transition-colors">
                <Paperclip className="w-5 h-5 text-azpa-textSecondary" />
              </button>
              <button className="p-2 rounded-lg hover:bg-azpa-hover transition-colors">
                <Smile className="w-5 h-5 text-azpa-textSecondary" />
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleResize}
                placeholder={isLoading ? 'AI正在思考...' : '输入消息...'}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-transparent text-azpa-text placeholder-azpa-textSecondary/50 resize-none focus:outline-none text-sm"
                rows={1}
              />
            </div>
            <div className="flex items-center gap-1">
              {isLoading ? (
                <button
                  onClick={handleCancel}
                  className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="取消发送"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!content.trim()}
                  className={`p-2.5 rounded-lg transition-all ${
                    content.trim()
                      ? 'bg-azpa-accent text-white hover:bg-azpa-accent/90'
                      : 'bg-azpa-hover text-azpa-textSecondary/50 cursor-not-allowed'
                  }`}
                  title="发送 (Enter)"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-azpa-textSecondary/30">
          Azpa AI · 由 AI 驱动
        </div>
      </div>
    </div>
  );
};