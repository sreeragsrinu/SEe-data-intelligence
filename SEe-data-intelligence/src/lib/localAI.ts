import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
let engine: MLCEngine | null = null;
let loading: Promise<MLCEngine> | null = null;
export const LOCAL_MODEL = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
export async function loadLocalModel(onProgress?: (text: string) => void) {
  if (engine) return engine;
  if (!loading) loading = CreateMLCEngine(LOCAL_MODEL, { initProgressCallback: (p) => onProgress?.(p.text) });
  try {
    engine = await loading;
    return engine;
  } catch (error) {
    loading = null;
    throw error;
  }
}
export async function askLocalModel(prompt: string, onProgress?: (text: string) => void) {
  const model = await loadLocalModel(onProgress);
  const result = await model.chat.completions.create({ messages: [
    { role: 'system', content: 'You are a careful data analyst. Use only supplied schema and metadata. Return concise explanations. If asked for SQL, return one SELECT statement only. Never invent results.' },
    { role: 'user', content: prompt }
  ], temperature: 0.1, max_tokens: 700 });
  return result.choices[0]?.message?.content ?? '';
}
