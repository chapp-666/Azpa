import { useState, useEffect } from 'react';
import { Key, Save, Trash2, Check, ChevronDown } from 'lucide-react';
import { saveApiKey, getSavedApiKey, removeApiKey, apiProviders } from '@/services/aiService';

interface ApiKeySettingsProps {
  onClose: () => void;
}

export const ApiKeySettings = ({ onClose }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('deepseek');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  useEffect(() => {
    const saved = getSavedApiKey(selectedProvider);
    if (saved) {
      setApiKey('*'.repeat(saved.length));
      setHasKey(true);
    } else {
      setApiKey('');
      setHasKey(false);
    }
  }, [selectedProvider]);

  const handleSave = () => {
    if (apiKey && apiKey.trim()) {
      saveApiKey(apiKey.trim(), selectedProvider);
      setIsSaved(true);
      setHasKey(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleReset = () => {
    removeApiKey(selectedProvider);
    setApiKey('');
    setHasKey(false);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const currentProvider = apiProviders.find(p => p.id === selectedProvider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-azpa-sidebar border border-azpa-border rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-azpa-border">
          <h2 className="text-lg font-medium text-azpa-text">API Key 设置</h2>
          <button
            onClick={onClose}
            className="text-azpa-textSecondary hover:text-azpa-text transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-azpa-text mb-2">
              选择服务商
            </label>
            <div className="relative">
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-azpa-card border border-azpa-border rounded-lg text-sm text-azpa-text hover:border-azpa-accent/30 transition-colors"
              >
                <span>{currentProvider?.name || '选择服务商'}</span>
                <ChevronDown className={`w-4 h-4 text-azpa-textSecondary transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showProviderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-azpa-card border border-azpa-border rounded-lg shadow-xl overflow-hidden z-10">
                  {apiProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setShowProviderDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-azpa-hover transition-colors ${
                        provider.id === selectedProvider ? 'bg-azpa-accent/5' : ''
                      }`}
                    >
                      <span className={`text-sm ${provider.id === selectedProvider ? 'text-azpa-accent' : 'text-azpa-text'}`}>
                        {provider.name}
                      </span>
                      {provider.id === selectedProvider && (
                        <Check className="w-4 h-4 text-azpa-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-azpa-text mb-2">
              {currentProvider?.name} API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-azpa-textSecondary/50" />
              <input
                type="password"
                value={apiKey}
                onChange={handleKeyChange}
                placeholder={`输入您的 ${currentProvider?.name} API Key`}
                className="w-full pl-10 pr-4 py-3 bg-azpa-card border border-azpa-border rounded-lg text-sm text-azpa-text placeholder-azpa-textSecondary/50 focus:outline-none focus:border-azpa-accent/50"
              />
            </div>
            <p className="mt-2 text-xs text-azpa-textSecondary/70">
              您的 API Key 将安全存储在本地浏览器中。
            </p>
          </div>

          <div className="p-4 bg-azpa-card rounded-lg">
            <p className="text-xs text-azpa-textSecondary">
              获取 API Key：访问{' '}
              <a
                href={selectedProvider === 'deepseek' ? 'https://platform.deepseek.com/api_keys' : 'https://bailian.console.aliyun.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-azpa-accent hover:underline"
              >
                {currentProvider?.name} 平台
              </a>{' '}
              申请您的 API Key。
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-azpa-border">
            <button
              onClick={handleReset}
              disabled={!hasKey}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                hasKey
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-azpa-textSecondary/50 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">重置</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                apiKey.trim()
                  ? 'bg-azpa-accent text-white hover:bg-azpa-accent/90'
                  : 'bg-azpa-hover text-azpa-textSecondary/50 cursor-not-allowed'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">已保存</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="text-sm">保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};