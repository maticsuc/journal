import { NextResponse } from 'next/server';
import { loadAgent } from '@/lib/reflections/core/agentLoader.js';

export async function POST(req: Request) {
  try {
    const { agentName = 'marcus-aurelius', entry } = await req.json();
    const agent = await loadAgent(agentName);
    const reflection = await agent.process(entry);
    return NextResponse.json({ reflection });
  } catch (error) {
    return NextResponse.json({ error: 'Agent reflection failed.' }, { status: 500 });
  }
}
