import type { Language } from '../types';

export interface LocaleStrings {
  appTitle: string;
  selectLanguage: string;
  instructionLanguage: string;
  tapToStart: string;
  pinyinToggle: string;
  play: string;
  submit: string;
  clearAll: string;
  newRound: string;
  home: string;
  trayFull: string;
  needMoreTiles: string;
  clearConfirm: string;
  yes: string;
  no: string;
  correct: string;
  incorrect: string;
  partial: string;
  noNounOrVerb: string;
  noNoun: string;
  noVerb: string;
  nounBeforeVerb: string;
  danglingPhrase: string;
  tileCount: string;
  legend: string;
  noun: string;
  verb: string;
  adjective: string;
  adverb: string;
  phrase: string;
  conjunction: string;
  allWordsUsed: string;
  // Settings
  settings: string;
  highContrastMode: string;
  ttsProviderLabel: string;
  browser: string;
  cloud: string;
  changePin: string;
  enterPin: string;
  incorrectPin: string;
  pinChanged: string;
  close: string;
}

const locales: Record<Language, LocaleStrings> = {
  en: {
    appTitle: 'SentenceBuilder',
    selectLanguage: 'Choose Your Language!',
    instructionLanguage: 'Instructions in:',
    tapToStart: 'Tap a tile to start building sentences!',
    pinyinToggle: 'Pinyin',
    play: 'Play',
    submit: 'Submit',
    clearAll: 'Clear All',
    newRound: 'New Words',
    home: 'Home',
    trayFull: 'Your sentence is full!',
    needMoreTiles: 'Add at least 3 words first!',
    clearConfirm: 'Remove all words from your sentence?',
    yes: 'Yes',
    no: 'No',
    correct: 'Awesome sentence!',
    incorrect: 'Hmm, try moving the action word.',
    partial: 'Almost! Can you add one more word?',
    noNounOrVerb: 'A sentence needs a naming word and an action word!',
    noNoun: 'Try adding a naming word (like cat or dog)!',
    noVerb: 'Try adding an action word (like runs or eats)!',
    nounBeforeVerb: 'Try putting the naming word before the action word!',
    danglingPhrase: 'Almost! Can you add one more word after that?',
    tileCount: 'words',
    legend: 'Word Types',
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    phrase: 'Phrase',
    conjunction: 'Joining',
    allWordsUsed: 'All words are in your sentence!',
    settings: 'Settings',
    highContrastMode: 'High Contrast',
    ttsProviderLabel: 'Voice',
    browser: 'Browser',
    cloud: 'Cloud',
    changePin: 'Change PIN',
    enterPin: 'Enter PIN',
    incorrectPin: 'Incorrect PIN, try again!',
    pinChanged: 'PIN changed!',
    close: 'Close',
  },
  fr: {
    appTitle: 'SentenceBuilder',
    selectLanguage: 'Choisis ta langue !',
    instructionLanguage: 'Instructions en :',
    tapToStart: 'Appuie sur un mot pour construire des phrases !',
    pinyinToggle: 'Pinyin',
    play: 'Jouer',
    submit: 'Valider',
    clearAll: 'Tout effacer',
    newRound: 'Nouveaux mots',
    home: 'Accueil',
    trayFull: 'Ta phrase est compl\u00e8te !',
    needMoreTiles: 'Ajoute au moins 3 mots !',
    clearConfirm: 'Retirer tous les mots de ta phrase ?',
    yes: 'Oui',
    no: 'Non',
    correct: 'Superbe phrase !',
    incorrect: "Essaie de changer l'ordre.",
    partial: 'Presque ! Ajoute un mot.',
    noNounOrVerb: 'Une phrase a besoin d\u2019un nom et d\u2019un verbe !',
    noNoun: 'Ajoute un nom (comme le chat ou la fleur) !',
    noVerb: 'Ajoute un verbe (comme mange ou court) !',
    nounBeforeVerb: 'Essaie de mettre le nom avant le verbe !',
    danglingPhrase: 'Presque ! Ajoute un mot apr\u00e8s celui-l\u00e0 !',
    tileCount: 'mots',
    legend: 'Types de mots',
    noun: 'Nom',
    verb: 'Verbe',
    adjective: 'Adjectif',
    adverb: 'Adverbe',
    phrase: 'Expression',
    conjunction: 'Liaison',
    allWordsUsed: 'Tous les mots sont dans ta phrase !',
    settings: 'R\u00e9glages',
    highContrastMode: 'Contraste \u00e9lev\u00e9',
    ttsProviderLabel: 'Voix',
    browser: 'Navigateur',
    cloud: 'Cloud',
    changePin: 'Changer le PIN',
    enterPin: 'Entrer le PIN',
    incorrectPin: 'PIN incorrect, r\u00e9essaie !',
    pinChanged: 'PIN chang\u00e9 !',
    close: 'Fermer',
  },
  'zh-Hans': {
    appTitle: 'SentenceBuilder',
    selectLanguage: '\u9009\u62e9\u4f60\u7684\u8bed\u8a00\uff01',
    instructionLanguage: '\u6307\u5bfc\u8bed\u8a00\uff1a',
    tapToStart: '\u70b9\u51fb\u8bcd\u8bed\u5f00\u59cb\u9020\u53e5\uff01',
    pinyinToggle: '\u62fc\u97f3',
    play: '\u64ad\u653e',
    submit: '\u63d0\u4ea4',
    clearAll: '\u5168\u90e8\u6e05\u9664',
    newRound: '\u65b0\u8bcd\u8bed',
    home: '\u9996\u9875',
    trayFull: '\u4f60\u7684\u53e5\u5b50\u5df2\u6ee1\uff01',
    needMoreTiles: '\u81f3\u5c11\u6dfb\u52a0\u4e09\u4e2a\u8bcd\uff01',
    clearConfirm: '\u6e05\u9664\u53e5\u5b50\u4e2d\u7684\u6240\u6709\u8bcd\u8bed\uff1f',
    yes: '\u662f',
    no: '\u5426',
    correct: '\u592a\u68d2\u4e86\uff01',
    incorrect: '\u8bd5\u8bd5\u8c03\u6362\u987a\u5e8f\uff01',
    partial: '\u5dee\u4e0d\u591a\uff0c\u518d\u52a0\u4e00\u4e2a\uff01',
    noNounOrVerb: '\u53e5\u5b50\u9700\u8981\u540d\u8bcd\u548c\u52a8\u8bcd\uff01',
    noNoun: '\u8bd5\u8bd5\u52a0\u4e00\u4e2a\u540d\u8bcd\uff08\u6bd4\u5982\u732b\u6216\u72d7\uff09\uff01',
    noVerb: '\u8bd5\u8bd5\u52a0\u4e00\u4e2a\u52a8\u8bcd\uff08\u6bd4\u5982\u5403\u6216\u8dd1\uff09\uff01',
    nounBeforeVerb: '\u8bd5\u8bd5\u628a\u540d\u8bcd\u653e\u5728\u52a8\u8bcd\u524d\u9762\uff01',
    danglingPhrase: '\u5dee\u4e0d\u591a\uff01\u518d\u52a0\u4e00\u4e2a\u8bcd\u5427\uff01',
    tileCount: '\u4e2a\u8bcd',
    legend: '\u8bcd\u7c7b',
    noun: '\u540d\u8bcd',
    verb: '\u52a8\u8bcd',
    adjective: '\u5f62\u5bb9\u8bcd',
    adverb: '\u526f\u8bcd',
    phrase: '\u77ed\u8bed',
    conjunction: '\u8fde\u8bcd',
    allWordsUsed: '\u6240\u6709\u8bcd\u8bed\u90fd\u5728\u53e5\u5b50\u91cc\u4e86\uff01',
    settings: '\u8bbe\u7f6e',
    highContrastMode: '\u9ad8\u5bf9\u6bd4\u5ea6',
    ttsProviderLabel: '\u8bed\u97f3',
    browser: '\u6d4f\u89c8\u5668',
    cloud: '\u4e91\u7aef',
    changePin: '\u4fee\u6539PIN',
    enterPin: '\u8f93\u5165PIN',
    incorrectPin: 'PIN\u4e0d\u6b63\u786e\uff0c\u518d\u8bd5\u4e00\u6b21\uff01',
    pinChanged: 'PIN\u5df2\u4fee\u6539\uff01',
    close: '\u5173\u95ed',
  },
};

export function t(lang: Language): LocaleStrings {
  return locales[lang];
}
