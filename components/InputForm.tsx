import React from 'react';
import { ModelConfig } from '../types';

interface InputFormProps {
  content: string;
  setContent: (value: string) => void;
  userCount: number;
  setUserCount: (value: number) => void;
  selectedModelId: string;
  setSelectedModelId: (value: string) => void;
  modelConfigs: ModelConfig[];
  onModelConfigChange: (modelId: string, field: 'apiKey' | 'apiUrl', value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  selectedConfig?: ModelConfig;
  onOpenModelManager: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  content,
  setContent,
  userCount,
  setUserCount,
  selectedModelId,
  setSelectedModelId,
  modelConfigs,
  onModelConfigChange,
  onGenerate,
  isLoading,
  selectedConfig,
  onOpenModelManager,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-lg font-medium text-slate-700 mb-2">
          待评估内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此处粘贴您的产品描述、报告或任何其他内容..."
          className="w-full h-48 p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-200 resize-y"
          disabled={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label htmlFor="userCount" className="block text-lg font-medium text-slate-700 mb-2">
            虚拟用户数量
          </label>
          <input
            type="number"
            id="userCount"
            value={userCount}
            onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            max="10"
            className="w-full p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-200"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="modelName" className="block text-lg font-medium text-slate-700 mb-2">
            选择 LLM 模型
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="modelName"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="flex-grow w-full p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-200 bg-white"
              disabled={isLoading}
            >
              {modelConfigs.map(config => (
                <option key={config.id} value={config.id}>{config.name}</option>
              ))}
            </select>
            <button
              onClick={onOpenModelManager}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="管理模型"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {selectedConfig && !selectedConfig.isDefault && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
           <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-slate-700 mb-1">
              API URL
            </label>
            <input
              type="text"
              id="apiUrl"
              value={selectedConfig.apiUrl || ''}
              onChange={(e) => onModelConfigChange(selectedConfig.id, 'apiUrl', e.target.value)}
              placeholder="例如: https://api.example.com/v1/chat/completions"
              className="w-full p-3 border border-slate-300 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={selectedConfig.apiKey || ''}
              onChange={(e) => onModelConfigChange(selectedConfig.id, 'apiKey', e.target.value)}
              placeholder="输入您的 API Key"
              className="w-full p-3 border border-slate-300 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !content.trim()}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? '生成中...' : '生成评价报告'}
        </button>
      </div>
    </div>
  );
};
