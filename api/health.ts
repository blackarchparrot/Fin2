import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const hasValidKey = Boolean(apiKey && apiKey !== 'your_openrouter_api_key_here');
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'healthy',
      app: 'FinPilot AI',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      costPolicy: 'Zero-Cost Inference Only',
      aiProvider: 'OpenRouter (OpenAI-compatible)',
      configuredModel: model,
      hasServerApiKey: hasValidKey,
      mode: hasValidKey ? 'live-openrouter-free' : 'demo-deterministic-sandbox',
    })
  );
}
