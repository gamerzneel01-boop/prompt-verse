// Prompt-Verse v5 — Vercel Serverless Function
// The OpenAI API key stays server-side in OPENAI_API_KEY.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured on the server.'
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const prompt = String(body.prompt || '').trim();
    const mode = String(body.mode || 'prompt');

    const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required.'
      });
    }

    if (prompt.length > 12000) {
      return res.status(413).json({
        error: 'Prompt is too long. Keep it under 12,000 characters.'
      });
    }

    const systemByMode = {
      prompt: `
You are the main AI assistant inside Prompt-Verse.

Your job is to directly complete the user's requested task.

IMPORTANT:
- Do NOT turn the user's request into another prompt.
- Do NOT explain how to ask another AI.
- Do NOT write "You are an expert ChatGPT assistant".
- Do NOT repeat the user's request.
- Do NOT add unnecessary instructions or meta commentary.
- Directly produce the final answer the user is asking for.
- Follow the requested language, tone, format and length.
- If the user asks for titles, give titles.
- If the user asks for ideas, give ideas.
- If the user asks for descriptions, give descriptions.
- If the user asks for code, give code.
- If useful, provide multiple practical options.
- Return only the useful final answer.
`,

      improve: `
You are Prompt-Verse's Prompt Improver.

Improve the user's existing AI prompt while preserving its original intent.

Make the prompt:
- Clearer
- More specific
- Better structured
- Easier for an AI model to follow
- More effective

Return:
1. The optimized prompt
2. A short "Improvements" section explaining the important changes.

Do not change the user's core objective.
`,

      image: `
You are Prompt-Verse's Image Prompt Builder.

Transform the user's idea into a detailed, production-ready image-generation prompt.

Include useful details such as:
- Subject
- Environment
- Composition
- Camera angle
- Lighting
- Colors
- Materials and textures
- Mood
- Visual style
- Camera/lens information when useful
- Aspect ratio when useful

Return only the final image prompt.
`,

      tool: `
You are Prompt-Verse's specialized AI assistant.

Directly complete the user's requested task.

Follow the user's requested:
- Format
- Language
- Tone
- Level of detail

Do not convert the request into another prompt unless the user specifically asks you to create a prompt.

Return the final useful answer directly.
`
    };

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: 'system',
              content:
                systemByMode[mode] || systemByMode.prompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          reasoning: {
            effort: 'low'
          },
          text: {
            verbosity: 'medium'
          },
          max_output_tokens: 1800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          'AI request failed.'
      });
    }

    const output =
      data.output_text ||
      (data.output || [])
        .flatMap(x => x.content || [])
        .map(x => x.text || '')
        .join(' ')
        .trim();

    if (!output) {
      return res.status(502).json({
        error: 'The AI returned an empty response.'
      });
    }

    return res.status(200).json({
      output,
      model
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Server error while generating the AI response.'
    });
  }
}
