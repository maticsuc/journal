import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Agent from './Agent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadAgent(agentName, configOverrides = {}) {
  const agentPath = path.join(__dirname, `../agents/${agentName}`);
  if (!fs.existsSync(agentPath)) {
    throw new Error(`Agent not found: ${agentName} (looked in ${agentPath})`);
  }
  const agent = new Agent(agentPath, configOverrides);
  await agent.initialize();
  return agent;
}

export function listAgents() {
  const agentsDir = path.join(__dirname, '../agents');
  if (!fs.existsSync(agentsDir)) {
    return [];
  }
  return fs.readdirSync(agentsDir)
    .filter(file => {
      const fullPath = path.join(agentsDir, file);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();
}

export async function loadDefaultAgent(configOverrides = {}) {
  return loadAgent('marcus-aurelius', configOverrides);
}

export default { loadAgent, listAgents, loadDefaultAgent };
