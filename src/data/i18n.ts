import type { Language } from '../types';

export interface LocaleStrings {
  appTitle: string;
  selectLanguage: string;
  instructionLanguage: string;
  tapToStart: string;
  pinyinToggle: string;
  posToggle: string;
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
  // Word list upload
  uploadWordList: string;
  customWords: string;
  defaultWords: string;
  uploadFile: string;
  listName: string;
  preview: string;
  confirmUpload: string;
  // Progress
  viewProgress: string;
  totalSentences: string;
  correctPercent: string;
  sentencesToday: string;
  streak: string;
  perLanguage: string;
  last30Days: string;
  mostUsedWords: string;
  noDataYet: string;
  // Badges
  badgeGallery: string;
  badgeEarned: string;
  locked: string;
  badgeFirstSentence: string;
  badgeFirstSentenceDesc: string;
  badgeCorrect10: string;
  badgeCorrect10Desc: string;
  badgeCorrect50: string;
  badgeCorrect50Desc: string;
  badgeCorrect100: string;
  badgeCorrect100Desc: string;
  badgePolyglot: string;
  badgePolyglotDesc: string;
  badgeStreak5: string;
  badgeStreak5Desc: string;
  badgeStreak10: string;
  badgeStreak10Desc: string;
  badgeDaily5: string;
  badgeDaily5Desc: string;
  // Help
  helpButton: string;
  helpTitle: string;
  showAll: string;
  nSentences: string;
  noSentences: string;
}

const locales: Record<Language, LocaleStrings> = {
  en: {
    appTitle: 'SentenceBuilder',
    selectLanguage: 'Choose Your Language!',
    instructionLanguage: 'Instructions in:',
    tapToStart: 'Tap a tile to start building sentences!',
    pinyinToggle: 'Pinyin',
    posToggle: 'POS',
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
    uploadWordList: 'Word Lists',
    customWords: 'Your Lists',
    defaultWords: 'Default Words',
    uploadFile: 'Upload New List',
    listName: 'List name',
    preview: 'Preview',
    confirmUpload: 'Confirm Upload',
    viewProgress: 'Progress',
    totalSentences: 'Total',
    correctPercent: 'Correct',
    sentencesToday: 'Today',
    streak: 'Day streak',
    perLanguage: 'By Language',
    last30Days: 'Last 30 Days',
    mostUsedWords: 'Most Used Words',
    noDataYet: 'No data yet. Start building sentences!',
    badgeGallery: 'Badges',
    badgeEarned: 'Badge Earned!',
    locked: 'Locked',
    badgeFirstSentence: 'First Sentence',
    badgeFirstSentenceDesc: 'Built your very first sentence!',
    badgeCorrect10: 'Grammar Star',
    badgeCorrect10Desc: '10 correct sentences!',
    badgeCorrect50: 'Sentence Master',
    badgeCorrect50Desc: '50 correct sentences!',
    badgeCorrect100: 'Word Wizard',
    badgeCorrect100Desc: '100 correct sentences!',
    badgePolyglot: 'Polyglot',
    badgePolyglotDesc: 'Tried all three languages!',
    badgeStreak5: 'On Fire',
    badgeStreak5Desc: '5 correct in a row!',
    badgeStreak10: 'Unstoppable',
    badgeStreak10Desc: '10 correct in a row!',
    badgeDaily5: 'Busy Builder',
    badgeDaily5Desc: '5 sentences in one day!',
    helpButton: 'Help',
    helpTitle: "Here's a sentence you can make!",
    showAll: 'Show All',
    nSentences: 'sentences found',
    noSentences: 'These tiles are tricky! Try dragging some to the tray.',
  },
  fr: {
    appTitle: 'SentenceBuilder',
    selectLanguage: 'Choisis ta langue !',
    instructionLanguage: 'Instructions en :',
    tapToStart: 'Appuie sur un mot pour construire des phrases !',
    pinyinToggle: 'Pinyin',
    posToggle: 'POS',
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
    uploadWordList: 'Listes de mots',
    customWords: 'Vos listes',
    defaultWords: 'Mots par d\u00e9faut',
    uploadFile: 'Ajouter une liste',
    listName: 'Nom de la liste',
    preview: 'Aper\u00e7u',
    confirmUpload: 'Confirmer',
    viewProgress: 'Progr\u00e8s',
    totalSentences: 'Total',
    correctPercent: 'Correct',
    sentencesToday: "Aujourd'hui",
    streak: 'Jours cons\u00e9cutifs',
    perLanguage: 'Par langue',
    last30Days: '30 derniers jours',
    mostUsedWords: 'Mots les plus utilis\u00e9s',
    noDataYet: 'Pas encore de donn\u00e9es. Commence \u00e0 construire !',
    badgeGallery: 'Badges',
    badgeEarned: 'Badge obtenu !',
    locked: 'Verrouill\u00e9',
    badgeFirstSentence: 'Premi\u00e8re phrase',
    badgeFirstSentenceDesc: 'Tu as construit ta premi\u00e8re phrase !',
    badgeCorrect10: '\u00c9toile de grammaire',
    badgeCorrect10Desc: '10 phrases correctes !',
    badgeCorrect50: 'Ma\u00eetre des phrases',
    badgeCorrect50Desc: '50 phrases correctes !',
    badgeCorrect100: 'Magicien des mots',
    badgeCorrect100Desc: '100 phrases correctes !',
    badgePolyglot: 'Polyglotte',
    badgePolyglotDesc: 'Tu as essay\u00e9 les trois langues !',
    badgeStreak5: 'En feu',
    badgeStreak5Desc: '5 correctes de suite !',
    badgeStreak10: 'Inarr\u00eatable',
    badgeStreak10Desc: '10 correctes de suite !',
    badgeDaily5: 'Constructeur assidu',
    badgeDaily5Desc: '5 phrases en un jour !',
    helpButton: 'Aide',
    helpTitle: 'Voici une phrase possible !',
    showAll: 'Tout afficher',
    nSentences: 'phrases trouvées',
    noSentences: 'Ces tuiles sont difficiles ! Essaie d\u2019en glisser dans le plateau.',
  },
  'zh-Hans': {
    appTitle: 'SentenceBuilder',
    selectLanguage: '\u9009\u62e9\u4f60\u7684\u8bed\u8a00\uff01',
    instructionLanguage: '\u6307\u5bfc\u8bed\u8a00\uff1a',
    tapToStart: '\u70b9\u51fb\u8bcd\u8bed\u5f00\u59cb\u9020\u53e5\uff01',
    pinyinToggle: '\u62fc\u97f3',
    posToggle: '\u8bcd\u6027',
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
    uploadWordList: '\u8bcd\u8868',
    customWords: '\u4f60\u7684\u8bcd\u8868',
    defaultWords: '\u9ed8\u8ba4\u8bcd\u8bed',
    uploadFile: '\u4e0a\u4f20\u65b0\u8bcd\u8868',
    listName: '\u8bcd\u8868\u540d\u79f0',
    preview: '\u9884\u89c8',
    confirmUpload: '\u786e\u8ba4\u4e0a\u4f20',
    viewProgress: '\u8fdb\u5ea6',
    totalSentences: '\u603b\u8ba1',
    correctPercent: '\u6b63\u786e\u7387',
    sentencesToday: '\u4eca\u5929',
    streak: '\u8fde\u7eed\u5929\u6570',
    perLanguage: '\u6309\u8bed\u8a00',
    last30Days: '\u8fd1 30 \u5929',
    mostUsedWords: '\u6700\u5e38\u7528\u8bcd\u8bed',
    noDataYet: '\u8fd8\u6ca1\u6709\u6570\u636e\u3002\u5f00\u59cb\u9020\u53e5\u5427\uff01',
    badgeGallery: '\u5fbd\u7ae0',
    badgeEarned: '\u83b7\u5f97\u5fbd\u7ae0\uff01',
    locked: '\u672a\u89e3\u9501',
    badgeFirstSentence: '\u7b2c\u4e00\u53e5',
    badgeFirstSentenceDesc: '\u4f60\u9020\u51fa\u4e86\u7b2c\u4e00\u53e5\u8bdd\uff01',
    badgeCorrect10: '\u8bed\u6cd5\u4e4b\u661f',
    badgeCorrect10Desc: '10\u53e5\u6b63\u786e\uff01',
    badgeCorrect50: '\u9020\u53e5\u5927\u5e08',
    badgeCorrect50Desc: '50\u53e5\u6b63\u786e\uff01',
    badgeCorrect100: '\u8bcd\u8bed\u9b54\u6cd5\u5e08',
    badgeCorrect100Desc: '100\u53e5\u6b63\u786e\uff01',
    badgePolyglot: '\u591a\u8bed\u8fbe\u4eba',
    badgePolyglotDesc: '\u4f60\u5c1d\u8bd5\u4e86\u4e09\u79cd\u8bed\u8a00\uff01',
    badgeStreak5: '\u706b\u529b\u5168\u5f00',
    badgeStreak5Desc: '\u8fde\u7eed5\u53e5\u6b63\u786e\uff01',
    badgeStreak10: '\u52bf\u4e0d\u53ef\u6321',
    badgeStreak10Desc: '\u8fde\u7eed10\u53e5\u6b63\u786e\uff01',
    badgeDaily5: '\u52e4\u594b\u5efa\u9020\u8005',
    badgeDaily5Desc: '\u4e00\u5929\u5185\u9020\u4e865\u53e5\uff01',
    helpButton: '\u5e2e\u52a9',
    helpTitle: '\u8fd9\u662f\u4f60\u53ef\u4ee5\u9020\u7684\u53e5\u5b50\uff01',
    showAll: '\u663e\u793a\u5168\u90e8',
    nSentences: '\u4e2a\u53e5\u5b50',
    noSentences: '\u8fd9\u4e9b\u5b57\u5757\u6709\u70b9\u96be\uff01\u8bd5\u8bd5\u628a\u4e00\u4e9b\u62d6\u5230\u6258\u76d8\u91cc\u3002',
  },
};

export function t(lang: Language): LocaleStrings {
  return locales[lang];
}
