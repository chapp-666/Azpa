import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  onStartChat?: () => void;
}

export const EmptyState = ({ onStartChat }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 rounded-full bg-azpa-card flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-azpa-accent" />
      </div>
      <h2 className="text-2xl font-semibold text-azpa-text mb-3">开始新对话</h2>
      <p className="text-azpa-textSecondary max-w-md mb-6">
        与Azpa AI进行智能对话，获取专业的解答和创意灵感
      </p>
      {onStartChat && (
        <button
          onClick={onStartChat}
          className="px-6 py-3 bg-gradient-to-r from-azpa-accent to-blue-500 text-azpa-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          开始对话
        </button>
      )}
    </div>
  );
};