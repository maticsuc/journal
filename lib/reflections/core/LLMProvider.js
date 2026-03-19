/**
 * Abstract base class for LLM providers
 */
export class LLMProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Call the LLM provider with the given prompts
   * @param {string} systemPrompt - The system prompt
   * @param {string} userMessage - The user message
   * @returns {Promise<string>} The LLM response
   */
  async call(systemPrompt, userMessage) {
    throw new Error('call() must be implemented by subclass');
  }

  /**
   * Validate that the provider is properly configured
   */
  validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Get provider info for logging/debugging
   */
  getInfo() {
    return {
      provider: this.config.provider || 'unknown',
      model: this.config.model || 'unknown',
    };
  }
}

/**
 * Create a provider instance based on configuration
 * @param {Object} config - Provider configuration
 * @returns {LLMProvider} Provider instance
 */
export async function createProvider(config) {
  if (!config || !config.provider) {
    throw new Error('Provider configuration must include a "provider" field');
  }

  if (config.provider === 'ollama') {
    const { OllamaProvider } = await import('./providers/OllamaProvider.js');
    return new OllamaProvider(config);
  } else if (config.provider === 'openrouter') {
    const { OpenRouterProvider } = await import('./providers/OpenRouterProvider.js');
    return new OpenRouterProvider(config);
  } else {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export default { LLMProvider, createProvider };
