import { Router, Request, Response } from 'express';

const router = Router();

// In-memory cache: text → base64 audio  (clears on server restart, saves credits during a session)
const audioCache = new Map<string, Buffer>();

const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — clear American English
const ELEVENLABS_MODEL = 'eleven_turbo_v2'; // fastest + cheapest, still great quality

// GET /api/tts?text=hello+world
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const text = (req.query.text as string || '').trim();
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  if (text.length > 300) {
    res.status(400).json({ error: 'text too long' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'TTS not configured' });
    return;
  }

  // Serve from cache if available
  if (audioCache.has(text)) {
    const cached = audioCache.get(text)!;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(cached);
    return;
  }

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.1,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elRes.ok) {
      const err = await elRes.text();
      console.error('ElevenLabs error:', elRes.status, err);
      res.status(502).json({ error: 'TTS service error' });
      return;
    }

    const arrayBuffer = await elRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache it (cap cache at 500 entries to avoid memory issues)
    if (audioCache.size >= 500) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey !== undefined) audioCache.delete(firstKey);
    }
    audioCache.set(text, buffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    console.error('TTS fetch error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
