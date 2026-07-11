interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator = ({ size = 'md' }: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} border-2 border-azpa-accent border-t-transparent rounded-full animate-spin`}
      />
      <span className="text-azpa-textSecondary text-sm">思考中...</span>
    </div>
  );
};

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 bg-azpa-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-azpa-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-azpa-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};