import { AIModel, Message } from '@/types';
import { generateId } from '@/utils/storage';

export interface ApiProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKeyEnv: string;
  apiKeyStorageKey: string;
}

export const apiProviders: ApiProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    apiKeyEnv: 'VITE_DEEPSEEK_API_KEY',
    apiKeyStorageKey: 'deepseek_api_key',
  },
  {
    id: 'aliyun',
    name: '阿里云百炼',
    baseUrl: import.meta.env.VITE_ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
    apiKeyEnv: 'VITE_ALIYUN_API_KEY',
    apiKeyStorageKey: 'aliyun_api_key',
  },
];

export const availableModels: AIModel[] = [
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek-V4 Flash',
    description: '极速版本，响应更快，适合日常对话',
    maxTokens: 128000,
    provider: 'deepseek',
    category: 'default',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek-V4 Pro',
    description: '专业版本，擅长复杂问题解答和创意写作',
    maxTokens: 128000,
    provider: 'deepseek',
    category: 'default',
    hasDailyLimit: true,
  },
  {
    id: 'deepseek-v3.2',
    name: 'DeepSeek-V3.2',
    description: 'DeepSeek V3.2 版本，测试中',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
    isTest: true,
  },
  {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek-V3.2 Exp',
    description: 'DeepSeek V3.2 实验版本',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    description: 'DeepSeek V3 基础版本',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
  {
    id: 'qwen3.7-max-preview',
    name: '通义千问 3.7 Max Preview',
    description: '阿里云通义千问 3.7 Max 预览版，每日限10次',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
    hasDailyLimit: true,
  },
  {
    id: 'qwen3.5-flash',
    name: '通义千问 3.5 Flash',
    description: '阿里云通义千问 3.5，高性能对话模型',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
  {
    id: 'qwen3.5-plus',
    name: '通义千问 3.5 Plus',
    description: '阿里云通义千问 3.5 Plus，增强版',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
  {
    id: 'kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'Kimi K2.6 模型，长文本处理能力强',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Kimi K2.5 模型，优秀的推理能力',
    maxTokens: 128000,
    provider: 'aliyun',
    category: '阿里专供',
  },
];

const getProviderByModel = (modelId: string): ApiProvider => {
  const model = availableModels.find(m => m.id === modelId);
  return apiProviders.find(p => p.id === model?.provider) || apiProviders[0];
};

const getApiKey = (modelId: string): string => {
  const provider = getProviderByModel(modelId);
  return localStorage.getItem(provider.apiKeyStorageKey) || import.meta.env[provider.apiKeyEnv] || '';
};

const getBaseUrl = (modelId: string): string => {
  const provider = getProviderByModel(modelId);
  return provider.baseUrl;
};

export const saveApiKey = (key: string, providerId: string): void => {
  const provider = apiProviders.find(p => p.id === providerId);
  if (provider) {
    localStorage.setItem(provider.apiKeyStorageKey, key);
  }
};

export const getSavedApiKey = (providerId: string): string => {
  const provider = apiProviders.find(p => p.id === providerId);
  return provider ? localStorage.getItem(provider.apiKeyStorageKey) || '' : '';
};

export const removeApiKey = (providerId: string): void => {
  const provider = apiProviders.find(p => p.id === providerId);
  if (provider) {
    localStorage.removeItem(provider.apiKeyStorageKey);
  }
};

const DAILY_LIMIT = 10;

export const getDailyUsage = (modelId: string): number => {
  const today = new Date().toISOString().split('T')[0];
  const key = `daily_usage_${modelId}_${today}`;
  const usage = localStorage.getItem(key);
  return usage ? parseInt(usage, 10) : 0;
};

export const incrementDailyUsage = (modelId: string): void => {
  const today = new Date().toISOString().split('T')[0];
  const key = `daily_usage_${modelId}_${today}`;
  const current = getDailyUsage(modelId);
  localStorage.setItem(key, (current + 1).toString());
};

export const checkDailyLimit = (modelId: string): boolean => {
  const model = availableModels.find(m => m.id === modelId);
  if (!model?.hasDailyLimit) return true;
  return getDailyUsage(modelId) < DAILY_LIMIT;
};

export const generateReply = async (
  messages: Message[],
  modelId: string,
  onProgress?: (content: string) => void
): Promise<Message> => {
  const apiKey = getApiKey(modelId);
  const baseUrl = getBaseUrl(modelId);
  
  if (!apiKey) {
    const errorMessage = '网络错误，请稍后重试';
    
    return new Promise((resolve) => {
      onProgress?.(errorMessage);
      setTimeout(() => {
        resolve({
          id: generateId(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        });
      }, 100);
    });
  }

  if (!checkDailyLimit(modelId)) {
    const errorMessage = '今日使用次数已达上限，请明日再试';
    
    return new Promise((resolve) => {
      onProgress?.(errorMessage);
      setTimeout(() => {
        resolve({
          id: generateId(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        });
      }, 100);
    });
  }

  try {
    const provider = getProviderByModel(modelId);
    const isAliyun = provider.id === 'aliyun';
    
    const requestBody: Record<string, unknown> = {
      model: modelId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
      max_tokens: 4096,
    };

    if (!isAliyun) {
      requestBody.thinking = { type: 'enabled' };
      requestBody.reasoning_effort = 'high';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || '';
            fullContent += delta;
            onProgress?.(fullContent);
          } catch {
            continue;
          }
        }
      }
    }

    return {
      id: generateId(),
      role: 'assistant',
      content: fullContent,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('API error:', error);
    
    const errorMessage = '网络错误，请稍后重试';
    
    return new Promise((resolve) => {
      onProgress?.(errorMessage);
      setTimeout(() => {
        resolve({
          id: generateId(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        });
      }, 100);
    });
  }
};