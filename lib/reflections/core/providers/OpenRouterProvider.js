import axios from 'axios';
import { LLMProvider } from '../LLMProvider.js';

/**
 * OpenRouter LLM Provider
 * Communicates with OpenRouter API for access to various LLM models
 */
export class OpenRouterProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.validate();
  }

  validate() {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter provider requires apiKey configuration');
    }
    if (!this.config.model) {
      throw new Error('OpenRouter provider requires model configuration');
    }
    if (!this.config.baseURL) {
      throw new Error('OpenRouter provider requires baseURL configuration');
    }
  }

  async call(systemPrompt, userMessage) {
    try {
      const response = await axios.post(
        `${this.config.baseURL}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout || 60000,
        }
      );

      if (response.data.error) {
        throw new Error(`OpenRouter API error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
      }

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error('Invalid response from OpenRouter: no choices returned');
      }

      const choice = response.data.choices[0];
      if (!choice.message) {
        throw new Error(`Invalid response from OpenRouter: no message in choice. Got: ${JSON.stringify(choice)}`);
      }

      const content = choice.message.content;
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error(`No content in OpenRouter response. Full choice: ${JSON.stringify(choice)}`);
      }

      return content.trim();
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error(
          'OpenRouter authentication failed. Check your OPENROUTER_API_KEY. ' +
          'Get an API key at: https://openrouter.ai'
        );
      }

      if (error.response?.status === 429) {
        throw new Error(
          'OpenRouter rate limit exceeded. Please wait before trying again.'
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          'Cannot connect to OpenRouter. Check your internet connection.'
        );
      }

      throw error;
    }
  }

  getInfo() {
    return {
      ...super.getInfo(),
      endpoint: this.config.baseURL,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    };
  }
}

export default OpenRouterProvider;
