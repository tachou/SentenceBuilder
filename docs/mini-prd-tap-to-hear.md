# Mini PRD: Tap-to-Hear Word Tiles (v1.0)

## Problem

Young children (ages 4–8) learning to read may not recognise every word tile, especially in a second language. There is no way to hear an individual word spoken aloud without first placing it into a sentence and submitting. This slows exploration and can frustrate emerging readers.

## Feature Overview

When **Tap-to-Hear** is enabled, tapping any word tile — in the word pool or the sentence tray — speaks that word aloud using the browser's built-in Text-to-Speech engine in the current session language. A **toggle switch** on the Sentence Builder page lets the child (or parent) turn this behaviour on or off.

## User Flow

1. Child opens the Sentence Builder page. The Tap-to-Hear toggle is **on** by default.
2. Child taps a word tile (e.g. "chat" in French).
3. The browser speaks the word aloud in the session language (French voice).
4. The tile still behaves normally (moves to/from the tray via existing drag-and-drop or tap-to-move logic). The speech is an *additional* effect layered on top.
5. If the child (or parent) toggles Tap-to-Hear **off**, tapping tiles moves them as before without any speech.

## Interaction Details

### What triggers speech?

| Action | Speech? | Notes |
|--------|---------|-------|
| Tap a tile in the word pool | ✅ Yes | Speaks the word, then moves it to the tray |
| Tap a tile in the sentence tray | ✅ Yes | Speaks the word, then moves it back to the pool |
| Drag a tile (drag start) | ✅ Yes | Speaks on drag start so the child hears it while dragging |
| Long-press / right-click | ❌ No | Reserved for future context menus |

### Voice selection

Reuse the same TTS voice-selection logic already implemented for sentence read-aloud (`useTTS` hook):

- **English** → `en-US` or `en-GB` voice
- **French** → `fr-FR` voice
- **Chinese** → `zh-CN` voice

The utterance should be short (single word), with a slightly slower `rate` (0.9) to help young learners hear clearly.

### Queueing & interruption

- If a word is already being spoken and the child taps another tile, **cancel** the current utterance and speak the new word immediately (no overlapping speech).
- Sentence-level TTS (on submit) takes priority: if a sentence is being read aloud, individual tile taps do not interrupt it.

## Toggle Design

### Placement

The toggle sits in the control bar area of the Sentence Builder page, near the existing Help (💡) button. It uses a small switch/slider UI paired with a speaker icon (🔊).

### Appearance

- **On state**: Speaker icon (🔊) + switch filled/active colour.
- **Off state**: Muted speaker icon (🔇) + switch greyed out.
- The toggle label is a single icon — no text label needed (the icon is self-explanatory, keeps the bar compact for small screens).

### Persistence

The toggle state is stored in the Zustand game store and persists for the session. It resets to **on** when starting a new session (default is on, since the feature is helpful for the target age group).

## Localization

No new i18n string keys are required — the toggle is icon-only. If a tooltip or accessibility label is desired:

| Key | EN | FR | ZH-Hans |
|-----|----|----|---------|
| `tapToHearOn` | Tap tiles to hear words | Touche une tuile pour entendre le mot | 点击方块听发音 |
| `tapToHearOff` | Word sounds off | Sons désactivés | 发音已关闭 |

## Implementation Plan

### Modified Files

- **`src/hooks/useTTS.ts`** — Add a `speakWord(word: string, lang: string)` function alongside the existing `speak(tiles, lang)`. This function speaks a single word, cancels any in-progress word utterance, and respects the toggle state.
- **`src/store/gameStore.ts`** — Add `tapToHearEnabled: boolean` state and `toggleTapToHear()` action.
- **`src/components/SentenceBuilder.tsx`** — Wire the toggle switch into the control bar. Pass `speakWord` into tile tap/drag handlers.
- **`src/components/WordTile.tsx`** (or equivalent tile component) — Call `speakWord` on click / drag-start when enabled.
- **`src/data/i18n.ts`** — Add accessibility label keys (optional).

### No New Files

All logic fits within existing modules.

## Success Criteria

- Tapping any tile speaks the word in the correct language voice.
- Speech does not interfere with tile movement (tile still moves to/from tray).
- Toggle switches speech on/off instantly — no page reload needed.
- Rapidly tapping multiple tiles does not produce overlapping audio (previous utterance is cancelled).
- Sentence-level TTS on submit still works independently of the toggle.
- Works across all three languages (EN, FR, ZH-Hans).
