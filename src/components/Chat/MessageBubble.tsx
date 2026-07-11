import { useState } from 'react';
import { Copy, Check, Trash2, ThumbsUp, Share2, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { TypingIndicator } from '@/components/common/LoadingIndicator';

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onRemove?: (id: string) => void;
}

export const MessageBubble = ({ message, onCopy, onRemove }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message.content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full animate-slide-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`relative box-content ${
            isUser ? 'bg-azpa-accent/15 text-azpa-text' : 'bg-azpa-card text-azpa-text'
          } rounded-2xl px-4 py-3 border ${
            isUser ? 'border-azpa-accent/30' : 'border-azpa-border'
          }`}
        >
          {message.isLoading ? (
            <div className="flex items-center h-8">
              <TypingIndicator />
            </div>
          ) : (
            <div className="markdown-body text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {!isUser && !message.isLoading && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-azpa-border/50">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-azpa-hover transition-colors"
                title="复制"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-azpa-textSecondary hover:text-azpa-text" />
                )}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-azpa-hover transition-colors"
                title="点赞"
              >
                <ThumbsUp className="w-4 h-4 text-azpa-textSecondary hover:text-azpa-accent" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-azpa-hover transition-colors"
                title="分享"
              >
                <Share2 className="w-4 h-4 text-azpa-textSecondary hover:text-azpa-text" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-azpa-hover transition-colors"
                title="收藏"
              >
                <Bookmark className="w-4 h-4 text-azpa-textSecondary hover:text-azpa-accent" />
              </button>
              <div className="flex-1" />
              <span className="text-xs text-azpa-textSecondary/50 ml-auto">
                Azpa
              </span>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};