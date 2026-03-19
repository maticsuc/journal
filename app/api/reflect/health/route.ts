import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET() {
  try {
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    const httpsAgent = baseURL.startsWith('https://') ? new https.Agent({
      rejectUnauthorized: false,
    }) : undefined;
    
    await axios.get(`${baseURL}/api/tags`, {
      timeout: 5000,
      httpsAgent,
    });
    
    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json({ available: false }, { status: 503 });
  }
}
