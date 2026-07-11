import { useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { useChatStore, availableModels } from '@/store/chatStore';

export const ModelSelector = () => {
  const { selectedModelId, setSelectedModel } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = availableModels.find(m => m.id === selectedModelId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-azpa-card border border-azpa-border rounded-lg hover:border-azpa-accent/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-azpa-accent/10 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-azpa-accent" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-azpa-text font-medium">
            {currentModel?.name || '选择模型'}
          </p>
          <p className="text-xs text-azpa-textSecondary/70">
            {currentModel?.description?.substring(0, 25)}...
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-azpa-textSecondary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-azpa-card border border-azpa-border rounded-lg shadow-xl overflow-hidden z-10">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-azpa-hover transition-colors ${
                model.id === selectedModelId ? 'bg-azpa-accent/5' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  model.id === selectedModelId
                    ? 'bg-azpa-accent/20'
                    : 'bg-azpa-hover'
                }`}
              >
                <Cpu
                  className={`w-4 h-4 ${
                    model.id === selectedModelId ? 'text-azpa-accent' : 'text-azpa-textSecondary'
                  }`}
                />
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium ${
                    model.id === selectedModelId ? 'text-azpa-accent' : 'text-azpa-text'
                  }`}
                >
                  {model.name}
                </p>
                <p className="text-xs text-azpa-textSecondary">
                  {model.description}
                </p>
              </div>
              {model.id === selectedModelId && (
                <div className="w-2 h-2 rounded-full bg-azpa-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};