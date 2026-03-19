import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { ollamaConfig, systemPromptTemplate } from '../config/ollama.js';

class Agent {
  constructor(agentPath, configOverrides = {}) {
    this.agentPath = agentPath;
    this.agentName = path.basename(agentPath);
    this.config = { ...ollamaConfig, ...configOverrides };
    this.identity = null;
    this.soul = null;
    this.instructions = null;
  }

  async initialize() {
    try {
      const identityFile = path.join(this.agentPath, 'IDENTITY.md');
      const soulFile = path.join(this.agentPath, 'SOUL.md');
      const instructionsFile = path.join(this.agentPath, 'INSTRUCTIONS.md');
      if (!fs.existsSync(identityFile)) {
        throw new Error(`Missing IDENTITY.md in ${this.agentPath}`);
      }
      if (!fs.existsSync(soulFile)) {
        throw new Error(`Missing SOUL.md in ${this.agentPath}`);
      }
      if (!fs.existsSync(instructionsFile)) {
        throw new Error(`Missing INSTRUCTIONS.md in ${this.agentPath}`);
      }
      this.identity = fs.readFileSync(identityFile, 'utf-8');
      this.soul = fs.readFileSync(soulFile, 'utf-8');
      this.instructions = fs.readFileSync(instructionsFile, 'utf-8');
      console.log(`✓ Agent initialized: ${this.agentName}`);
    } catch (error) {
      throw new Error(`Failed to load identity files: ${error.message}`);
    }
  }

  buildSystemPrompt() {
    return systemPromptTemplate
      .replace('{identity}', this.identity)
      .replace('{soul}', this.soul)
      .replace('{instructions}', this.instructions);
  }

  async process(userMessage) {
    if (!this.identity) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }
    const systemPrompt = this.buildSystemPrompt();
    console.log(`→ Agent reflecting: ${this.agentName}`);
    const start = Date.now();
    try {
      const response = await this.callOllama(systemPrompt, userMessage);
      const elapsed = (Date.now() - start) / 1000;
      console.log(`✓ Agent finished: ${this.agentName} (${elapsed.toFixed(2)} s)`);
      return response;
    } catch (error) {
      const elapsed = (Date.now() - start) / 1000;
      console.log(`✗ Agent reflection failed: ${this.agentName} (${elapsed.toFixed(2)} s)`);
      throw new Error(`Agent reflection failed: ${error.message}`);
    }
  }

  async callOllama(systemPrompt, userMessage) {
    try {
      const axiosConfig = {
        timeout: this.config.timeout,
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

  getStatus() {
    return {
      name: this.agentName,
      path: this.agentPath,
      model: this.config.model,
      endpoint: this.config.baseURL,
      initialized: !!this.identity,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    };
  }
}

export default Agent;
