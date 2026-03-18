import { NextResponse } from 'next/server';
import { loadAgent } from '@/lib/reflections/core/agentLoader.js';

export async function POST(req: Request) {
  try {
    const { agentName = 'marcus-aurelius', entry } = await req.json();
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
