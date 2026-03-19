export const ollamaConfig = {
  provider: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen3.5:35b',
  timeout: parseInt(process.env.OLLAMA_TIMEOUT, 10) || 60000,
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS, 10) || 500,
  topP: parseFloat(process.env.OLLAMA_TOP_P) || 0.9,
  topK: parseInt(process.env.OLLAMA_TOP_K, 10) || 40,
};

export const openrouterConfig = {
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-70b-instruct',
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: parseInt(process.env.OPENROUTER_TIMEOUT, 10) || 60000,
  temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS, 10) || 1500,
  topP: parseFloat(process.env.OPENROUTER_TOP_P) || 0.9,
};

export function getProviderConfig() {
  const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
  
  if (provider === 'openrouter') {
    if (!openrouterConfig.apiKey) {
      throw new Error('OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env');
    }
    return openrouterConfig;
  } else if (provider === 'ollama') {
    return ollamaConfig;
  } else {
    throw new Error(`Unknown LLM provider: ${provider}. Use 'ollama' or 'openrouter'.`);
  }
}

export const systemPromptTemplate = `You are {identity}.

{soul}

{instructions}

Now, receive a journal entry and provide a thoughtful reflection in your voice.`;
