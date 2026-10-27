import { useEffect, useState } from 'react';
import { generateLoop, validateLoop, type LoopStream } from './loopGenerator';
import './LoopBuilderChat.css';

/**
 * LoopBuilderChat — the AI assistant box under the playable pilot loop.
 *
 * Two generation paths, labelled every time so a visitor can never
 * mistake one for the other:
 *  1. On-page template engine (default, no key, no network): generateLoop
 *     classifies the typed stream and fills a pathway. Labelled
 *     "Generated on-page".
 *  2. Real provider call (optional): if the visitor pastes their own
 *     Groq key, it is kept in this browser's localStorage only, sent
 *     only to api.groq.com, and the returned JSON is schema-validated
 *     by validateLoop before it can enter the player. Labelled
 *     "Generated via Groq". A failed call is reported with its status
 *     only (the key is never shown) and NEVER silently falls back to
 *     the template — the visitor chooses the template explicitly.
 *
 * Generated loops are added to the player's stream picker and set
 * playing by the parent via onGenerate.
 */

const KEY_STORAGE = 'ecocode-loop-ai-key';

type ChatMessage = { from: 'user' | 'assistant'; text: string };

export default function LoopBuilderChat({ onGenerate }: { onGenerate: (stream: LoopStream, source: string) => void }) {
  const [streamInput, setStreamInput] = useState('');
  const [originInput, setOriginInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'assistant', text: 'Ask me for a loop from any waste stream — for example "used cooking oil", "office paper", or "old phones". I will build a 5-stage loop you can play above. By default I generate on this page with a template engine (no model call, no key needed); values are illustrative, not measured.' },
  ]);
  const [busy, setBusy] = useState(false);
  const [aiKey, setAiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [aiFailed, setAiFailed] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY_STORAGE);
      if (saved) { setAiKey(saved); setKeySaved(true); }
    } catch { /* storage unavailable — key stays session-only */ }
  }, []);

  const saveKey = () => {
    try { window.localStorage.setItem(KEY_STORAGE, aiKey.trim()); setKeySaved(true); } catch { setKeySaved(false); }
  };
  const clearKey = () => {
    try { window.localStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ }
    setAiKey(''); setKeySaved(false);
  };

  const buildWithTemplate = () => {
    const text = streamInput.trim();
    if (!text) return;
    const stream = generateLoop(text, originInput || undefined);
    setMessages((m) => [
      ...m,
      { from: 'user', text: originInput.trim() ? `${text} (from ${originInput.trim()})` : text },
      { from: 'assistant', text: `Built "${stream.label}" on-page: ${stream.stages[1].name} → ${stream.stages[2].name} → ${stream.stages[3].name}. It is now in the stream picker above and playing. All values are illustrative, not measured.` },
    ]);
    onGenerate(stream, 'on-page');
  };

  const buildWithAi = async () => {
    const text = streamInput.trim();
    if (!text || !aiKey.trim()) return;
    setBusy(true);
    setAiFailed(null);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aiKey.trim()}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          messages: [
            { role: 'system', content: 'You build waste-to-resource loops. Return JSON ONLY, no markdown, no explanation, with this shape: {"label": string, "wasteNote": string, "stages": [{"name": string, "detail": string} x5], "metrics": [{"label": string, "value": string} x4]}. The 5 stages, in order, are: a waste stream, a processing step, a recovered resource, a demand actor, and a facility. Keep every value plausible and mark values illustrative in wasteNote.' },
            { role: 'user', content: `Waste stream: ${text}${originInput.trim() ? `; origin as entered: ${originInput.trim()}` : ''}` },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Groq request failed (HTTP ${res.status})`);
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      const jsonText = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      const stream = validateLoop(JSON.parse(jsonText));
      if (!stream) throw new Error('The provider reply did not match the loop format, so it was not used.');
      setMessages((m) => [
        ...m,
        { from: 'user', text: `${text} (via your Groq key)` },
        { from: 'assistant', text: `Built "${stream.label}" via Groq: ${stream.stages[1].name} → ${stream.stages[2].name} → ${stream.stages[3].name}. It is now in the stream picker above and playing. Values are illustrative unless the reply states otherwise.` },
      ]);
      onGenerate(stream, 'groq');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The provider request failed.';
      setAiFailed(message);
      setMessages((m) => [...m, { from: 'assistant', text: `That provider call failed: ${message} Nothing was added to the player. You can use the on-page template instead — it needs no key.` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="loop-chat" data-testid="loop-builder-chat">
      <div className="loop-chat-head">
        <span className="loop-chat-eyebrow">AI LOOP BUILDER — UNDER THE LOOP</span>
        <h4>Ask for a loop from any waste stream.</h4>
        <p>Describe a stream and I will build a playable 5-stage loop from it. Generated loops join the picker above. Nothing here is live telemetry and no generated value is measured.</p>
      </div>

      <div className="loop-chat-messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`loop-chat-msg loop-chat-${m.from}`}>
            <span className="loop-chat-who">{m.from === 'user' ? 'You' : 'Loop builder'}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      <label className="loop-chat-label" htmlFor="loop-chat-stream">Waste stream</label>
      <input
        id="loop-chat-stream" type="text" value={streamInput} placeholder="e.g. used cooking oil, office paper, old phones"
        onChange={(e) => setStreamInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && streamInput.trim()) buildWithTemplate(); }}
        data-testid="input-loop-chat-stream"
      />
      <label className="loop-chat-label" htmlFor="loop-chat-origin">Borough or address (optional)</label>
      <input
        id="loop-chat-origin" type="text" value={originInput} placeholder="e.g. Brooklyn — stored as entered, not geocoded here"
        onChange={(e) => setOriginInput(e.target.value)}
        data-testid="input-loop-chat-origin"
      />
      <div className="loop-chat-actions">
        <button type="button" onClick={buildWithTemplate} disabled={!streamInput.trim() || busy} data-testid="button-loop-chat-generate">
          Generate loop on-page
        </button>
        <button type="button" onClick={buildWithAi} disabled={!streamInput.trim() || !aiKey.trim() || busy} data-testid="button-loop-chat-ai">
          {busy ? 'Asking provider…' : 'Generate with my Groq key'}
        </button>
      </div>
      {aiFailed && (
        <p className="loop-chat-error" role="alert">
          {aiFailed} <button type="button" onClick={buildWithTemplate} disabled={!streamInput.trim()}>Use the on-page template instead</button>
        </p>
      )}

      <details className="loop-chat-key">
        <summary>Use a real AI provider key (optional, browser-only)</summary>
        <p>Paste a Groq API key to generate loops with a real model instead of the template engine. The key is stored only in this browser's localStorage, sent only to api.groq.com, and never leaves this page for any other purpose. Remove it any time.</p>
        <label className="loop-chat-label" htmlFor="loop-chat-key">Groq API key</label>
        <input id="loop-chat-key" type="password" value={aiKey} placeholder="gsk_…" autoComplete="off" onChange={(e) => { setAiKey(e.target.value); setKeySaved(false); }} />
        <div className="loop-chat-actions">
          <button type="button" onClick={saveKey} disabled={!aiKey.trim()}>Save key in this browser</button>
          <button type="button" onClick={clearKey} disabled={!aiKey && !keySaved}>Remove key</button>
        </div>
        {keySaved && <p className="loop-chat-saved">Key saved in this browser only.</p>}
      </details>
    </div>
  );
}
