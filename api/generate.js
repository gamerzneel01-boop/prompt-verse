// Prompt-Verse v5 — Vercel Serverless Function
// The OpenAI API key stays server-side in OPENAI_API_KEY.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = String(body.prompt || '').trim();
    const mode = String(body.mode || 'prompt');
    const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
    if (prompt.length > 12000) return res.status(413).json({ error: 'Prompt is too long. Keep it under 12,000 characters.' });

    const systemByMode = {
      prompt: 'You are Prompt-Verse, an expert prompt engineer. Transform the user\'s idea into a high-quality, ready-to-copy AI prompt. Preserve the user\'s intent. Add useful role, context, constraints, success criteria and output format. Return only the final prompt, with no preamble.',
      improve: 'You are Prompt-Verse, an expert prompt engineer. Improve the supplied prompt without changing its core intent. Add clarity, context, constraints, success criteria and output format. Return the optimized prompt first, then a short bullet list titled Improvements.',
      image: 'You are Prompt-Verse Image Prompt Builder. Turn the user\'s idea into a detailed production-ready image prompt. Include subject, environment, composition, lighting, camera/lens, style, materials/textures and aspect ratio when useful. Return only the final image prompt.',
      tool: 'You are Prompt-Verse, an expert AI assistant. Produce the best possible result for the requested specialized prompt-building task. Follow the user\'s requested format and keep the answer practical.'
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: systemByMode[mode] || systemByMode.prompt },
          { role: 'user', content: prompt }
        ],
        reasoning: { effort: 'low' },
        text: { verbosity: 'medium' },
        max_output_tokens: 1800
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI error:', data);
      return res.status(response.status).json({ error: data?.error?.message || 'AI request failed.' });
    }

    const output = data.output_text || (data.output || []).flatMap(x => x.content || []).map(x => x.text || '').join(' ').trim();
    if (!output) return res.status(502).json({ error: 'The AI returned an empty response.' });

    return res.status(200).json({ output, model });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error while generating the AI response.' });
  }
}
