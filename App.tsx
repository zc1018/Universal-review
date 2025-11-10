import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { ModelManager } from './components/ModelManager';
import { analyzeInput, generateUserPersona, generateEvaluation, summarizeEvaluations } from './services/geminiService';
import { FINAL_REPORT_TEMPLATE } from './constants';
import { AppState, ModelConfig, ApiClient } from './types';

const INITIAL_MODEL_CONFIGS: ModelConfig[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (默认)', isDefault: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', isDefault: true },
  { id: 'kimi-k2-0711-preview', name: 'Kimi K2 (自定义)', isDefault: false, apiUrl: 'https://api.moonshot.cn/v1/chat/completions', apiKey: '' },
];


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    contentToEvaluate: '',
    userCount: 3,
    selectedModelId: 'gemini-2.5-flash',
    modelConfigs: INITIAL_MODEL_CONFIGS,
    isLoading: false,
    progressMessage: '',
    result: null,
    error: '',
  });
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);

  const handleModelConfigChange = (modelId: string, field: 'apiKey' | 'apiUrl', value: string) => {
    setAppState(prev => ({
      ...prev,
      modelConfigs: prev.modelConfigs.map(config => 
        config.id === modelId ? { ...config, [field]: value } : config
      ),
    }));
  };

  const handleAddModel = (newModel: Omit<ModelConfig, 'isDefault'>) => {
    if (appState.modelConfigs.some(m => m.id === newModel.id)) {
      alert(`模型 ID "${newModel.id}" 已存在。请使用唯一的ID。`);
      return;
    }
    const modelToAdd: ModelConfig = { ...newModel, isDefault: false };
    setAppState(prev => ({
      ...prev,
      modelConfigs: [...prev.modelConfigs, modelToAdd],
      selectedModelId: modelToAdd.id, // Auto-select the new model
    }));
    setIsModelManagerOpen(false);
  };

  const handleUpdateModel = (updatedModel: ModelConfig) => {
    setAppState(prev => ({
      ...prev,
      modelConfigs: prev.modelConfigs.map(m => m.id === updatedModel.id ? updatedModel : m),
    }));
    setIsModelManagerOpen(false);
  };

  const handleDeleteModel = (modelIdToDelete: string) => {
    setAppState(prev => {
      const newModelConfigs = prev.modelConfigs.filter(m => m.id !== modelIdToDelete);
      let newSelectedModelId = prev.selectedModelId;
      // If the deleted model was the selected one, fall back to the first default model
      if (prev.selectedModelId === modelIdToDelete) {
        newSelectedModelId = newModelConfigs.find(m => m.isDefault)?.id || '';
      }
      return {
        ...prev,
        modelConfigs: newModelConfigs,
        selectedModelId: newSelectedModelId,
      };
    });
    setIsModelManagerOpen(false);
  };

  const handleGenerate = useCallback(async () => {
    const selectedConfig = appState.modelConfigs.find(c => c.id === appState.selectedModelId);
    if (!selectedConfig) {
      setAppState(prev => ({ ...prev, error: '未找到选定的模型配置。' }));
      return;
    }
    
    let apiClient: ApiClient;

    if (selectedConfig.isDefault) {
      if (!process.env.API_KEY) {
        setAppState(prev => ({ ...prev, error: 'Gemini 模型的 API 密钥未配置。' }));
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      apiClient = { type: 'gemini', client: ai, model: selectedConfig.id };
    } else {
      if (!selectedConfig.apiKey || !selectedConfig.apiUrl) {
        setAppState(prev => ({ ...prev, error: '自定义模型的 API URL 和 API Key 不能为空。' }));
        return;
      }
      apiClient = { type: 'custom', model: selectedConfig.id, apiKey: selectedConfig.apiKey, apiUrl: selectedConfig.apiUrl };
    }

    setAppState(prev => ({ ...prev, isLoading: true, result: null, error: '' }));

    try {
      // 步骤 1: 分析输入
      setAppState(prev => ({ ...prev, progressMessage: '正在分析输入内容...' }));
      const analysisResult = await analyzeInput(apiClient, appState.contentToEvaluate);

      const personas: string[] = [];
      const comments: string[] = [];

      // 步骤 2: 循环生成用户画像和评价
      for (let i = 0; i < appState.userCount; i++) {
        setAppState(prev => ({ ...prev, progressMessage: `正在生成用户画像 ${i + 1}/${appState.userCount}...` }));
        const persona = await generateUserPersona(apiClient, analysisResult);
        personas.push(persona);

        setAppState(prev => ({ ...prev, progressMessage: `用户 ${i + 1}/${appState.userCount} 正在进行评估...` }));
        const evaluation = await generateEvaluation(apiClient, persona, appState.contentToEvaluate);
        comments.push(evaluation);
      }

      // 步骤 3: 汇总
      setAppState(prev => ({ ...prev, progressMessage: '正在汇总所有评价...' }));
      const summary = await summarizeEvaluations(apiClient, comments);

      // 步骤 4: 格式化最终报告
      setAppState(prev => ({ ...prev, progressMessage: '正在格式化最终报告...' }));
      const finalReport = FINAL_REPORT_TEMPLATE(analysisResult, summary, comments, personas);
      
      setAppState(prev => ({ ...prev, result: { report: finalReport }, isLoading: false, progressMessage: '' }));

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : '发生未知错误。';
      setAppState(prev => ({ ...prev, error: `生成评价失败： ${errorMessage}`, isLoading: false, progressMessage: '' }));
    }
  }, [appState.contentToEvaluate, appState.userCount, appState.selectedModelId, appState.modelConfigs]);

  const selectedConfig = appState.modelConfigs.find(c => c.id === appState.selectedModelId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 md:p-10">
          <p className="text-center text-slate-500 mb-8">
            输入任何内容（例如产品描述、报告、服务对话），并指定需要多少虚拟用户对其进行评估。AI将创建独特的用户画像，并从他们的角度提供反馈。
          </p>
          
          <InputForm
            content={appState.contentToEvaluate}
            setContent={(content) => setAppState(prev => ({ ...prev, contentToEvaluate: content }))}
            userCount={appState.userCount}
            setUserCount={(count) => setAppState(prev => ({ ...prev, userCount: count }))}
            selectedModelId={appState.selectedModelId}
            setSelectedModelId={(id) => setAppState(prev => ({...prev, selectedModelId: id}))}
            modelConfigs={appState.modelConfigs}
            onModelConfigChange={handleModelConfigChange}
            onGenerate={handleGenerate}
            isLoading={appState.isLoading}
            selectedConfig={selectedConfig}
            onOpenModelManager={() => setIsModelManagerOpen(true)}
          />

          {appState.error && (
            <div className="mt-6 bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg text-center">
              <p><strong>错误：</strong> {appState.error}</p>
            </div>
          )}

          {appState.isLoading && <Loader message={appState.progressMessage} />}

          {appState.result && (
            <div className="mt-10">
              <ResultDisplay report={appState.result.report} />
            </div>
          )}
        </div>
      </main>
      <ModelManager
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
        models={appState.modelConfigs}
        onAddModel={handleAddModel}
        onUpdateModel={handleUpdateModel}
        onDeleteModel={handleDeleteModel}
      />
    </div>
  );
};

export default App;
