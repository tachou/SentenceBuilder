import { Router } from 'express';
import multer from 'multer';
import { query, queryOne, run, runChanges, persist } from '../db.js';
import { detectPos } from '../posLookup.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 500 * 1024 } });

const VALID_POS = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'conjunction', 'particle', 'other'];
const VALID_LANGS = ['en', 'fr', 'zh-Hans'];

interface ParsedWord {
  word: string;
  pos: string;
  phonetic?: string;
}

function parseCSV(content: string, targetLanguage?: string): { words: ParsedWord[]; language?: string } {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const wordIdx = header.indexOf('word');
  const posIdx = header.findIndex(h => h === 'part_of_speech' || h === 'pos');
  const langIdx = header.findIndex(h => h === 'language_code' || h === 'lang' || h === 'language');
  const phoneticIdx = header.findIndex(h => h === 'pinyin' || h === 'phonetic');

  if (wordIdx === -1) {
    throw new Error('CSV must have a "word" column');
  }

  let language: string | undefined;
  const words: ParsedWord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length <= wordIdx || !cols[wordIdx]) continue;

    const lang = langIdx >= 0 ? cols[langIdx] : undefined;
    if (lang && !language) language = lang;

    words.push({
      word: cols[wordIdx],
      pos: posIdx >= 0 ? (cols[posIdx]?.toLowerCase() || detectPos(cols[wordIdx], targetLanguage || language)) : detectPos(cols[wordIdx], targetLanguage || language),
      phonetic: (phoneticIdx >= 0 ? cols[phoneticIdx] : undefined) || undefined,
    });
  }

  return { words, language };
}

function parseJSON(content: string, targetLanguage?: string): { words: ParsedWord[]; language?: string } {
  const data = JSON.parse(content);

  if (Array.isArray(data)) {
    return { words: data.map((d: ParsedWord) => ({ word: d.word, pos: d.pos || detectPos(d.word, targetLanguage), phonetic: d.phonetic })) };
  }

  if (data.words && Array.isArray(data.words)) {
    const lang = data.language || targetLanguage;
    return {
      words: data.words.map((d: ParsedWord) => ({ word: d.word, pos: d.pos || detectPos(d.word, lang), phonetic: d.phonetic })),
      language: data.language,
    };
  }

  throw new Error('JSON must be an array of words or an object with a "words" array');
}

function validateWords(parsed: { words: ParsedWord[]; language?: string }, requestLang?: string) {
  const language = requestLang || parsed.language;
  if (!language || !VALID_LANGS.includes(language)) {
    throw new Error(`Invalid or missing language. Must be one of: ${VALID_LANGS.join(', ')}`);
  }

  if (parsed.words.length > 500) throw new Error('Maximum 500 words per file');

  const entries: ParsedWord[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (let i = 0; i < parsed.words.length; i++) {
    const w = parsed.words[i];
    if (!w.word || !w.word.trim()) { warnings.push(`Row ${i + 1}: empty word, skipped`); continue; }
    if (!VALID_POS.includes(w.pos)) { warnings.push(`Row ${i + 1}: invalid POS "${w.pos}" for "${w.word}", skipped`); continue; }

    const key = `${w.word.trim().toLowerCase()}:${w.pos}`;
    if (seen.has(key)) { duplicates.push(w.word); continue; }
    seen.add(key);

    entries.push({ word: w.word.trim(), pos: w.pos, phonetic: w.phonetic?.trim() || undefined });
  }

  return { entries, language, warnings, duplicates };
}

// POST /api/word-lists/upload
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    const content = file.buffer.toString('utf-8');
    const name = ((req.body.name as string) || 'Custom List').trim();
    const requestLang = req.body.language as string | undefined;
    const confirm = req.body.confirm === 'true';

    let parsed: { words: ParsedWord[]; language?: string };
    const ext = file.originalname?.toLowerCase() || '';

    if (ext.endsWith('.json') || file.mimetype === 'application/json') {
      parsed = parseJSON(content, requestLang);
    } else {
      parsed = parseCSV(content, requestLang);
    }

    const result = validateWords(parsed, requestLang);

    if (!confirm) {
      res.json({
        preview: true,
        entries: result.entries.slice(0, 10),
        totalCount: result.entries.length,
        language: result.language,
        warnings: result.warnings,
        duplicates: result.duplicates,
      });
      return;
    }

    if (result.entries.length === 0) { res.status(400).json({ error: 'No valid words to import' }); return; }

    const listId = run(
      `INSERT INTO custom_word_lists (device_id, name, language) VALUES (?, ?, ?)`,
      [req.deviceId, name, result.language]
    );

    for (let i = 0; i < result.entries.length; i++) {
      const e = result.entries[i];
      run(`INSERT INTO custom_words (list_id, word, pos, phonetic, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [listId, e.word, e.pos, e.phonetic || null, i]);
    }

    persist();

    res.json({
      id: listId, name, language: result.language,
      wordCount: result.entries.length, warnings: result.warnings, duplicates: result.duplicates,
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
  }
});

// GET /api/word-lists
router.get('/', (req, res) => {
  const lists = query(
    `SELECT wl.id, wl.name, wl.language, wl.is_active, wl.created_at,
            COUNT(cw.id) as word_count
     FROM custom_word_lists wl
     LEFT JOIN custom_words cw ON cw.list_id = wl.id
     WHERE wl.device_id = ?
     GROUP BY wl.id
     ORDER BY wl.created_at DESC`,
    [req.deviceId]
  );
  res.json(lists);
});

// GET /api/word-lists/:id/words
router.get('/:id/words', (req, res) => {
  const list = queryOne<{ id: number; language: string }>(
    `SELECT id, language FROM custom_word_lists WHERE id = ? AND device_id = ?`,
    [Number(req.params.id), req.deviceId]
  );
  if (!list) { res.status(404).json({ error: 'List not found' }); return; }

  const words = query(
    `SELECT id, word, pos, phonetic, sort_order FROM custom_words WHERE list_id = ? ORDER BY sort_order`,
    [list.id]
  );
  res.json({ list, words });
});

// DELETE /api/word-lists/:id
router.delete('/:id', (req, res) => {
  // Delete child words first (sql.js doesn't always cascade)
  run(`DELETE FROM custom_words WHERE list_id = ?`, [Number(req.params.id)]);
  const changes = runChanges(
    `DELETE FROM custom_word_lists WHERE id = ? AND device_id = ?`,
    [Number(req.params.id), req.deviceId]
  );
  if (changes === 0) { res.status(404).json({ error: 'List not found' }); return; }
  persist();
  res.json({ success: true });
});

// PUT /api/word-lists/:id/active
router.put('/:id/active', (req, res) => {
  const list = queryOne<{ id: number; language: string; is_active: number }>(
    `SELECT id, language, is_active FROM custom_word_lists WHERE id = ? AND device_id = ?`,
    [Number(req.params.id), req.deviceId]
  );
  if (!list) { res.status(404).json({ error: 'List not found' }); return; }

  run(`UPDATE custom_word_lists SET is_active = 0 WHERE device_id = ? AND language = ?`,
    [req.deviceId, list.language]);

  if (!list.is_active) {
    run(`UPDATE custom_word_lists SET is_active = 1 WHERE id = ?`, [list.id]);
  }

  persist();
  res.json({ success: true, isActive: !list.is_active });
});

export default router;
