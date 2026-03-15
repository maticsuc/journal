// Ollama Configuration
// Customize these settings to match your Ollama setup

export const ollamaConfig = {
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen3.5:35b',
  timeout: parseInt(process.env.OLLAMA_TIMEOUT, 10) || 60000,
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS, 10) || 500,
  topP: parseFloat(process.env.OLLAMA_TOP_P) || 0.9,
  topK: parseInt(process.env.OLLAMA_TOP_K, 10) || 40,
};

// System prompt that will be combined with identity files
// This sets the stage for the agent's persona
export const systemPromptTemplate = `You are {identity}.

{soul}

{instructions}

Now, receive a journal entry and provide a thoughtful reflection in your voice.`;