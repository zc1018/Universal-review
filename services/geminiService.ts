import {
  INPUT_ANALYSIS_PROMPT,
  USER_PERSONA_GENERATION_PROMPT,
  EVALUATION_GENERATION_PROMPT,
  SUMMARY_PROMPT
} from '../constants';
import { ApiClient } from '../types';


// Helper for custom, OpenAI-compatible APIs like Kimi
const callCustomApi = async (client: Extract<ApiClient, {type: 'custom'}>, prompt: string, jsonOutput: boolean): Promise<string> => {
  try {
    const body = {
      model: client.model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      ...(jsonOutput && { response_format: { type: 'json_object' } })
    };

    const response = await fetch(client.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API 请求失败，状态码 ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error(`调用自定义模型 ${client.model} 时出错:`, error);
    throw new Error(`自定义 API 调用失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// Generic API call dispatcher
const callApi = async (client: ApiClient, prompt: string, jsonOutput = false): Promise<string> => {
  if (client.type === 'gemini') {
    const response = await client.client.models.generateContent({
      model: client.model,
      contents: prompt,
      config: jsonOutput ? { responseMimeType: "application/json" } : undefined,
    });
    return response.text;
  } else {
    return callCustomApi(client, prompt, jsonOutput);
  }
};

export const analyzeInput = async (client: ApiClient, content: string): Promise<string> => {
  const prompt = `${INPUT_ANALYSIS_PROMPT}\n\n待分析的内容如下:\n\n${content}`;
  return callApi(client, prompt);
};

export const generateUserPersona = async (client: ApiClient, analysis: string): Promise<string> => {
  const prompt = USER_PERSONA_GENERATION_PROMPT(analysis);
  const personaJson = await callApi(client, prompt, true);
  try {
    // Validate that it's parsable JSON
    JSON.parse(personaJson);
    return personaJson;
  } catch (e) {
    console.error("解析用户画像JSON失败:", personaJson);
    throw new Error("AI 返回了无效的用户画像格式。");
  }
};

export const generateEvaluation = async (client: ApiClient, persona: string, originalContent: string): Promise<string> => {
  const prompt = EVALUATION_GENERATION_PROMPT(persona, originalContent);
  return callApi(client, prompt);
};

export const summarizeEvaluations = async (client: ApiClient, comments: string[]): Promise<string> => {
  const prompt = SUMMARY_PROMPT(comments);
  return callApi(client, prompt);
};
