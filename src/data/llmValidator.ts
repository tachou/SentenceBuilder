import type { Language, GrammarFeedback } from '../types';
import { LLM_API_KEY } from '../config';

/** In-memory cache: sentence+lang → feedback */
const cache = new Map<string, GrammarFeedback>();

const UI_LANG_NAME: Record<Language, string> = {
  en: 'English',
  fr: 'French',
  'zh-Hans': 'Simplified Chinese',
};

/**
 * Validate a sentence using the Anthropic Messages API.
 * Returns a GrammarFeedback, or null if the request fails/times out.
 */
export async function validateWithLLM(
  sentence: string,
  lang: Language,
  uiLang: Language
): Promise<GrammarFeedback | null> {
  if (!LLM_API_KEY) return null;

  const cacheKey = `${lang}:${uiLang}:${sentence}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': LLM_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: `You are a grammar checker for a children's sentence-building game (ages 4-8). The sentence is in ${UI_LANG_NAME[lang]}. Evaluate whether the sentence is grammatically valid. Be generous — creative or silly sentences are perfectly OK as long as the basic grammar is roughly correct. Respond ONLY with valid JSON: {"result":"correct"|"partial"|"incorrect","hint":"..."} where hint is an encouraging message in ${UI_LANG_NAME[uiLang]}, max 1 sentence.`,
        messages: [
          {
            role: 'user',
            content: `Check this sentence: "${sentence}"`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error('LLM validation failed:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) return null;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const result = parsed.result as GrammarFeedback['result'];
    const hint = parsed.hint as string;

    if (!['correct', 'partial', 'incorrect'].includes(result) || !hint) {
      return null;
    }

    const feedback: GrammarFeedback = { result, hint };
    cache.set(cacheKey, feedback);
    return feedback;
  } catch (error) {
    clearTimeout(timeout);
    if ((error as Error).name !== 'AbortError') {
      console.error('LLM validation error:', error);
    }
    return null;
  }
}
