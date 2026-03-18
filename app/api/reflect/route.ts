import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { loadAgent } from '@/lib/reflections/core/agentLoader.js';

export async function POST(req: Request) {
  try {
    const { agentName = 'marcus-aurelius', entry } = await req.json();
    
    // Test connectivity to Ollama endpoint first
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    console.log(`[Reflect] Testing connectivity to ${baseURL}`);
    
    try {
      const httpsAgent = baseURL.startsWith('https://') ? new https.Agent({
        rejectUnauthorized: false,
      }) : undefined;
      
      const testResponse = await axios.get(`${baseURL}/api/tags`, {
        timeout: 5000,
        httpsAgent,
      });
      console.log('[Reflect] ✓ Connectivity test passed');
    } catch (connError) {
      console.error('[Reflect] ✗ Connectivity test failed:', connError instanceof Error ? connError.message : connError);
      throw new Error(`Cannot reach Ollama at ${baseURL}. ${connError instanceof Error ? connError.message : ''}`);
    }
    
    const agent = await loadAgent(agentName);
    const reflection = await agent.process(entry);
    return NextResponse.json({ reflection });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Reflect API Error]', errorMessage);
    console.error('[Ollama Config]', {
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL,
    });
    return NextResponse.json({ error: `Agent reflection failed: ${errorMessage}` }, { status: 500 });
  }
}
