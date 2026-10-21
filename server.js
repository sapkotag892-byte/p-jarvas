import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
app.disable('x-powered-by');
app.use(express.json({ limit: '9mb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => res.json({ ok: true, configured: Boolean(process.env.GEMINI_API_KEY) }));
app.post('/api/chat', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes('PASTE_YOUR')) return res.status(503).json({ error: 'Server owner must set GEMINI_API_KEY in the private environment settings.' });
    const { message, history = [], image } = req.body || {};
    if (typeof message !== 'string' || (!message.trim() && !image)) return res.status(400).json({ error: 'Write a message or attach an image.' });
    if (message.length > 12000) return res.status(413).json({ error: 'Message too long (maximum 12,000 characters).' });
    if (!Array.isArray(history) || history.length > 20) return res.status(400).json({ error: 'Conversation history is too long.' });
    const contents = history.slice(-12).filter(x => ['user','model'].includes(x?.role) && typeof x?.text === 'string').map(x => ({ role: x.role, parts: [{ text: x.text.slice(0, 6000) }] }));
    const parts = [{ text: `You are P JARVAS, a helpful mobile-first AI assistant. Reply in the language the user uses (including Romanized Nepali, Nepali, Hindi, or English). Be honest about limits; never claim to have control of the phone or to see a screen unless the user shared an image. For coding, provide working examples and explain steps. For homework, teach clearly. If asked who made you, say: “Pratik Upadhayay Sir le banaunu bhayeko ho.” Do not claim to be human.\n\nUser message:\n${message.trim() || 'Please analyze this image and explain what is visible.'}` }];
    if (image) {
      if (!['image/jpeg','image/png','image/webp','image/gif'].includes(image.mimeType) || typeof image.data !== 'string' || image.data.length > 8_000_000) return res.status(400).json({ error: 'Unsupported image or image too large. Use JPG, PNG, WEBP or GIF under about 6 MB.' });
      parts.push({ inline_data: { mime_type: image.mimeType, data: image.data.replace(/^data:[^,]+,/, '') } });
    }
    contents.push({ role: 'user', parts });
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } }), signal: AbortSignal.timeout(60_000)
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return res.status(upstream.status === 429 ? 429 : 502).json({ error: data?.error?.message || `AI provider error (${upstream.status}). Check server key/model/quota.` });
    const answer = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim();
    if (!answer) return res.status(502).json({ error: 'AI returned no text. Try again.' });
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err?.name === 'TimeoutError' ? 'AI request timed out. Try again.' : 'Server error. Check deployment logs.' });
  }
});
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`P JARVAS listening on ${PORT}`));
