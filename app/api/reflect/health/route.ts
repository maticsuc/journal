import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET() {
  try {
    const provider = process.env.LLM_PROVIDER || 'ollama';
    
    if (provider === 'openrouter') {
      // Check OpenRouter configuration
      if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json({ 
          available: false, 
          reason: 'OPENROUTER_API_KEY not configured' 
        }, { status: 503 });
      }
      
      if (!process.env.OPENROUTER_MODEL) {
        return NextResponse.json({ 
          available: false, 
          reason: 'OPENROUTER_MODEL not configured' 
        }, { status: 503 });
      }
      
      // Validate with a simple API call
      try {
        await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: process.env.OPENROUTER_MODEL,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 10,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        return NextResponse.json({ available: true, provider: 'openrouter' });
      } catch (error: any) {
        if (error.response?.status === 401) {
          return NextResponse.json({ 
            available: false, 
            reason: 'OpenRouter API key invalid' 
          }, { status: 503 });
        }
        throw error;
      }
    } else {
      // Check Ollama configuration
      const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      
      const httpsAgent = baseURL.startsWith('https://') ? new https.Agent({
        rejectUnauthorized: false,
      }) : undefined;
      
      await axios.get(`${baseURL}/api/tags`, {
        timeout: 5000,
        httpsAgent,
      });
      
      return NextResponse.json({ available: true, provider: 'ollama' });
    }
  } catch (error) {
    console.error('Health check failed:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ available: false }, { status: 503 });
  }
}
