import { GoogleGenAI } from '@google/genai';

export interface EvaluationResult {
  report: string;
}

export interface ModelConfig {
  id: string; // e.g., 'gemini-2.5-flash'
  name: string; // e.g., 'Gemini 2.5 Flash'
  isDefault: boolean; // Is it a default model without custom config?
  apiUrl?: string;
  apiKey?: string;
}

export interface AppState {
  contentToEvaluate: string;
  userCount: number;
  selectedModelId: string;
  modelConfigs: ModelConfig[];
  isLoading: boolean;
  progressMessage: string;
  result: EvaluationResult | null;
  error: string;
}

// Type for the API configuration passed to the service layer
export type ApiClient = 
  | { type: 'gemini'; client: GoogleGenAI; model: string }
  | { type: 'custom'; model: string; apiKey: string; apiUrl: string };
