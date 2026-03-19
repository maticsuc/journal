import https from 'https';
import axios from 'axios';
import { LLMProvider } from '../LLMProvider.js';

/**
 * Ollama LLM Provider
 * Communicates with local or remote Ollama instances
 */
export class OllamaProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.validate();
  }

  validate() {
    if (!this.config.baseURL) {
      throw new Error('Ollama provider requires baseURL configuration');
    }
    if (!this.config.model) {
      throw new Error('Ollama provider requires model configuration');
    }
  }

  async call(systemPrompt, userMessage) {
    try {
      const axiosConfig = {
        timeout: this.config.timeout || 60000,
      };

      // Handle HTTPS endpoints with TLS certificate verification control
      if (this.config.baseURL.startsWith('https://')) {
        const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '1';
        axiosConfig.httpsAgent = new https.Agent({
          rejectUnauthorized: rejectUnauthorized,
          keepAlive: true,
        });
      }

      const response = await axios.post(
        `${this.config.baseURL}/api/generate`,
        {
          model: this.config.model,
          prompt: userMessage,
          system: systemPrompt,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          top_k: this.config.topK,
          stream: false,
        },
        axiosConfig
      );

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }

      return response.data.response.trim();
    } catch (error) {
      console.error(`Ollama Error: ${error.message}`);

      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to Ollama at ${this.config.baseURL}. ` +
          `Make sure Ollama is running: ollama serve`
        );
      }
      if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.message?.includes('certificate') || error.message?.includes('TLS')) {
        throw new Error(
          `TLS certificate error connecting to ${this.config.baseURL}. ` +
          `Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 for self-signed certificates. ` +
          `Error: ${error.message}`
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

export default OllamaProvider;
