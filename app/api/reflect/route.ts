import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { loadAgent } from '@/lib/reflections/core/agentLoader.js';
import { getProviderConfig } from '@/lib/reflections/config/providers.js';

export async function POST(req: Request) {
  try {
    const { agentName = 'marcus-aurelius', entry } = await req.json();
    
    const providerConfig = getProviderConfig();
    
    if (providerConfig.provider === 'ollama') {
      const baseURL = providerConfig.baseURL;
      try {
        const httpsAgent = baseURL.startsWith('https://') ? new https.Agent({
          rejectUnauthorized: false,
        }) : undefined;
        
        await axios.get(`${baseURL}/api/tags`, {
          timeout: 5000,
          httpsAgent,
        });
      } catch (connError) {
        throw new Error(`Cannot reach Ollama at ${baseURL}`);
      }
    } else if (providerConfig.provider === 'openrouter' && !providerConfig.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    const agent = await loadAgent(agentName);
    const reflection = await agent.process(entry);
    return NextResponse.json({ reflection });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Agent reflection failed: ${errorMessage}` }, { status: 500 });
  }
}
