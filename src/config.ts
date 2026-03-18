/** Cloud TTS (Google Cloud Text-to-Speech) */
export const CLOUD_TTS_API_KEY = import.meta.env.VITE_CLOUD_TTS_API_KEY as string | undefined;
export const CLOUD_TTS_ENABLED = !!CLOUD_TTS_API_KEY;

/** LLM Grammar Validation (Anthropic API) */
export const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY as string | undefined;
export const LLM_ENABLED = !!LLM_API_KEY;
