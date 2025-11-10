import React, { useState, useEffect } from 'react';
import { ModelConfig } from '../types';

type ModelManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  models: ModelConfig[];
  onAddModel: (model: Omit<ModelConfig, 'isDefault'>) => void;
  onUpdateModel: (model: ModelConfig) => void;
  onDeleteModel: (modelId: string) => void;
};

const EMPTY_MODEL: Omit<ModelConfig, 'isDefault'> = {
  id: '',
  name: '',
  apiUrl: '',
  apiKey: ''
};

export const ModelManager: React.FC<ModelManagerProps> = ({
  isOpen,
  onClose,
  models,
  onAddModel,
  onUpdateModel,
  onDeleteModel,
}) => {
  const [editingModel, setEditingModel] = useState<ModelConfig | Omit<ModelConfig, 'isDefault' | 'isDefault'> | null>(null);

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      setEditingModel(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    if ('isDefault' in editingModel) {
      // This is an existing model being updated
      onUpdateModel(editingModel);
    } else {
      // This is a new model being added
      if (!editingModel.id || !editingModel.name) {
        alert("模型 ID 和名称不能为空。");
        return;
      }
      onAddModel(editingModel);
    }
    setEditingModel(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingModel) return;
    const { name, value } = e.target;
    setEditingModel(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleAddNew = () => {
    setEditingModel(EMPTY_MODEL);
  };
  
  const handleEdit = (model: ModelConfig) => {
    setEditingModel(JSON.parse(JSON.stringify(model))); // Deep copy
  };

  const handleDelete = (modelId: string) => {
    if (window.confirm("确定要删除此模型配置吗？")) {
      onDeleteModel(modelId);
    }
  }

  const renderForm = () => {
    if (!editingModel) return null;

    const isEditingExisting = 'isDefault' in editingModel;

    return (
      <form onSubmit={handleSave} className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">{isEditingExisting ? '编辑模型' : '添加新模型'}</h3>
        <div>
          <label htmlFor="modelId" className="block text-sm font-medium text-slate-600">模型 ID (唯一标识)</label>
          <input
            type="text"
            id="modelId"
            name="id"
            value={editingModel.id}
            onChange={handleInputChange}
            placeholder="例如 gpt-4-custom"
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            required
            disabled={isEditingExisting}
          />
        </div>
        <div>
          <label htmlFor="modelName" className="block text-sm font-medium text-slate-600">模型名称 (显示名)</label>
          <input
            type="text"
            id="modelName"
            name="name"
            value={editingModel.name}
            onChange={handleInputChange}
            placeholder="例如 My Custom GPT"
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            required
          />
        </div>
         <div>
          <label htmlFor="apiUrl" className="block text-sm font-medium text-slate-600">API URL</label>
          <input
            type="text"
            id="apiUrl"
            name="apiUrl"
            value={editingModel.apiUrl || ''}
            onChange={handleInputChange}
            placeholder="https://api.example.com/v1/chat/completions"
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
         <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-slate-600">API Key</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={editingModel.apiKey || ''}
            onChange={handleInputChange}
            placeholder="输入您的 API Key"
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => setEditingModel(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">取消</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-500 border border-transparent rounded-md hover:bg-teal-600">保存</button>
        </div>
      </form>
    );
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">模型管理</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <div className="mt-4 space-y-2">
          {models.map(model => (
            <div key={model.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200/80">
              <div>
                <span className="font-semibold text-slate-700">{model.name}</span>
                <span className="text-xs text-slate-500 ml-2 bg-slate-200 px-2 py-0.5 rounded-full">{model.isDefault ? '默认' : '自定义'}</span>
              </div>
              {!model.isDefault && (
                <div className="space-x-2">
                  <button onClick={() => handleEdit(model)} className="text-sm text-teal-600 hover:text-teal-800 font-medium">编辑</button>
                  <button onClick={() => handleDelete(model.id)} className="text-sm text-red-600 hover:text-red-800 font-medium">删除</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!editingModel && (
           <div className="mt-6">
            <button onClick={handleAddNew} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
              添加新模型
            </button>
          </div>
        )}
        
        {renderForm()}
      </div>
    </div>
  );
};
