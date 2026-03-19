import fs from 'fs';
import path from 'path';
import { getProviderConfig, systemPromptTemplate } from '../config/providers.js';
import { createProvider } from './LLMProvider.js';

class Agent {
  constructor(agentPath, configOverrides = {}) {
    this.agentPath = agentPath;
    this.agentName = path.basename(agentPath);
    this.provider = null;
    this.identity = null;
    this.soul = null;
    this.instructions = null;
    this.configOverrides = configOverrides;
  }

  async initialize() {
    try {
      // Initialize the LLM provider
      const providerConfig = getProviderConfig();
      this.provider = await createProvider({ ...providerConfig, ...this.configOverrides });
      console.log(`✓ LLM Provider initialized: ${this.provider.getInfo().provider}`);

      // Load agent identity files
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
    if (!this.identity || !this.provider) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }
    const systemPrompt = this.buildSystemPrompt();
    console.log(`→ Agent reflecting: ${this.agentName}`);
    const start = Date.now();
    try {
      const response = await this.provider.call(systemPrompt, userMessage);
      const elapsed = (Date.now() - start) / 1000;
      console.log(`✓ Agent finished: ${this.agentName} (${elapsed.toFixed(2)} s)`);
      return response;
    } catch (error) {
      const elapsed = (Date.now() - start) / 1000;
      console.log(`✗ Agent reflection failed: ${this.agentName} (${elapsed.toFixed(2)} s)`);
      throw new Error(`Agent reflection failed: ${error.message}`);
    }
  }

  getStatus() {
    const providerInfo = this.provider ? this.provider.getInfo() : { provider: 'not-initialized' };
    return {
      name: this.agentName,
      path: this.agentPath,
      initialized: !!(this.identity && this.provider),
      ...providerInfo,
    };
  }
}

export default Agent;