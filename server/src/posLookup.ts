/**
 * POS (Part of Speech) auto-detection for uploaded word lists.
 *
 * When a CSV/JSON upload has no explicit POS column, this module
 * looks up each word in a per-language dictionary and returns the
 * best-guess POS.  Unknown words default to 'phrase'.
 */

// ── English ──────────────────────────────────────────────────────
const en = new Map<string, string>([
  // Nouns (from built-in list + extras)
  ...([
    'cat', 'dog', 'fish', 'bird', 'tree', 'house', 'school', 'book',
    'ball', 'car', 'mom', 'dad', 'baby', 'boy', 'girl', 'friend',
    'sun', 'moon', 'star', 'flower', 'apple', 'cake', 'water', 'milk',
    'bear', 'rabbit', 'frog', 'monkey', 'hat', 'shoe', 'horse', 'chicken',
    'cookie', 'pizza', 'truck', 'boat', 'rain', 'snow', 'cloud', 'garden',
    'teacher', 'king', 'queen', 'dragon', 'robot',
    // extras
    'table', 'chair', 'bed', 'door', 'window', 'brother', 'sister',
    'family', 'home', 'park', 'river', 'mountain', 'sky', 'ocean', 'sea',
    'beach', 'city', 'street', 'road', 'bus', 'train', 'plane', 'bike',
    'food', 'breakfast', 'lunch', 'dinner', 'egg', 'bread', 'rice',
    'toy', 'game', 'song', 'story', 'picture', 'color', 'number',
    'name', 'hand', 'head', 'eye', 'nose', 'mouth', 'ear', 'leg', 'foot',
    'tooth', 'hair', 'face', 'heart', 'man', 'woman', 'child', 'children',
    'people', 'animal', 'pet', 'mouse', 'elephant', 'lion', 'tiger',
    'cow', 'pig', 'sheep', 'duck', 'butterfly', 'ant', 'bee', 'spider',
    'banana', 'grape', 'strawberry', 'pear', 'candy', 'ice cream',
    'pen', 'pencil', 'paper', 'bag', 'box', 'cup', 'glass', 'plate',
    'spoon', 'fork', 'knife', 'clock', 'phone', 'computer',
    'shirt', 'pants', 'dress', 'coat', 'sock',
  ] as const).map(w => [w, 'noun'] as [string, string]),

  // Verbs
  ...([
    'runs', 'jumps', 'eats', 'drinks', 'sees', 'likes', 'loves', 'has',
    'is', 'plays', 'reads', 'sleeps', 'walks', 'sings', 'dances', 'flies',
    'swims', 'climbs', 'sits', 'stands', 'cooks', 'draws', 'makes', 'gives',
    'wants', 'finds', 'hides', 'throws', 'catches', 'builds', 'grows', 'helps',
    'opens', 'closes', 'rides',
    // extras — base forms
    'run', 'jump', 'eat', 'drink', 'see', 'like', 'love', 'have',
    'play', 'read', 'sleep', 'walk', 'sing', 'dance', 'fly',
    'swim', 'climb', 'sit', 'stand', 'cook', 'draw', 'make', 'give',
    'want', 'find', 'hide', 'throw', 'catch', 'build', 'grow', 'help',
    'open', 'close', 'ride', 'go', 'come', 'say', 'tell', 'think',
    'know', 'take', 'put', 'get', 'look', 'write', 'talk', 'stop',
    'start', 'turn', 'move', 'try', 'work', 'call', 'ask', 'need',
    'feel', 'leave', 'keep', 'let', 'begin', 'show', 'hear', 'cut',
    'carry', 'wash', 'clean', 'push', 'pull', 'kick', 'touch',
  ] as const).map(w => [w, 'verb'] as [string, string]),

  // Adjectives
  ...([
    'big', 'small', 'red', 'blue', 'green', 'happy', 'sad', 'fast', 'slow',
    'tall', 'funny', 'pretty', 'soft', 'loud', 'quiet', 'hot', 'cold',
    'new', 'old', 'good', 'yellow', 'purple', 'orange', 'brave', 'silly',
    'tiny', 'strong', 'kind',
    // extras
    'nice', 'bad', 'beautiful', 'ugly', 'long', 'short', 'wide', 'thin',
    'thick', 'dark', 'light', 'bright', 'clean', 'dirty', 'wet', 'dry',
    'sweet', 'sour', 'hungry', 'thirsty', 'tired', 'sick', 'angry',
    'scared', 'excited', 'busy', 'free', 'full', 'empty', 'heavy',
    'hard', 'easy', 'white', 'black', 'brown', 'pink', 'gray', 'round',
    'flat', 'deep', 'young', 'rich', 'poor', 'special', 'great', 'little',
  ] as const).map(w => [w, 'adjective'] as [string, string]),

  // Adverbs
  ...([
    'quickly', 'slowly', 'very', 'really', 'always', 'never', 'here', 'there',
    'now', 'today', 'happily', 'loudly', 'softly', 'outside', 'together',
    // extras
    'too', 'also', 'again', 'often', 'sometimes', 'already', 'soon',
    'still', 'just', 'almost', 'maybe', 'probably', 'even', 'only',
    'away', 'down', 'up', 'inside', 'everywhere', 'fast', 'well',
    'yesterday', 'tomorrow',
  ] as const).map(w => [w, 'adverb'] as [string, string]),

  // Phrases / determiners / prepositions
  ...([
    'in the', 'on the', 'to the', 'with a', 'at the', 'under the',
    'next to', 'in front of', 'a', 'the', 'behind the', 'above the',
    'near the', 'inside the', 'around the', 'from the', 'some', 'many',
    // extras
    'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its',
    'our', 'their', 'all', 'every', 'each', 'no', 'any', 'more', 'most',
  ] as const).map(w => [w, 'phrase'] as [string, string]),

  // Conjunctions
  ...([
    'and', 'but', 'or', 'because', 'so', 'then', 'when', 'while', 'if',
    // extras
    'after', 'before', 'until', 'since', 'although', 'unless', 'nor', 'yet',
  ] as const).map(w => [w, 'conjunction'] as [string, string]),
]);

// ── French ───────────────────────────────────────────────────────
const fr = new Map<string, string>([
  // Nouns
  ...([
    'le chat', 'le chien', 'le poisson', "l'oiseau", "l'arbre", 'la maison',
    "l'école", 'le livre', 'la balle', 'la voiture', 'maman', 'papa',
    'le bébé', 'le garçon', 'la fille', "l'ami", 'le soleil', 'la lune',
    "l'étoile", 'la fleur', 'la pomme', 'le gâteau', "l'eau", 'le lait',
    "l'ours", 'le lapin', 'la grenouille', 'le singe', 'le chapeau',
    'la chaussure', 'le cheval', 'la poule', 'le biscuit', 'la pizza',
    'le camion', 'le bateau', 'la pluie', 'la neige', 'le nuage',
    'le jardin', 'le roi', 'la reine', 'le dragon', 'le robot', 'la classe',
    // extras
    'la table', 'la chaise', 'le lit', 'la porte', 'la fenêtre',
    'le frère', 'la sœur', 'la famille', 'le parc', 'la rivière',
    'la montagne', 'le ciel', 'la mer', 'la plage', 'la ville',
    'la rue', 'le bus', 'le train', 'le vélo', 'le repas',
    'le nom', 'la main', 'la tête', 'le cœur', 'le garçon',
    'chat', 'chien', 'poisson', 'oiseau', 'arbre', 'maison', 'école',
    'livre', 'balle', 'voiture', 'bébé', 'fille', 'ami', 'soleil', 'lune',
    'étoile', 'fleur', 'pomme', 'gâteau', 'eau', 'lait', 'ours', 'lapin',
    'grenouille', 'singe', 'chapeau', 'chaussure', 'cheval', 'poule',
    'biscuit', 'camion', 'bateau', 'pluie', 'neige', 'nuage', 'jardin',
    'roi', 'reine', 'classe',
  ] as const).map(w => [w, 'noun'] as [string, string]),

  // Verbs
  ...([
    'court', 'saute', 'mange', 'boit', 'voit', 'aime', 'adore', 'a',
    'est', 'joue', 'lit', 'dort', 'marche', 'chante', 'danse', 'vole',
    'nage', 'grimpe', 'regarde', 'dessine', 'fait', 'donne', 'veut',
    'cuisine', 'parle', 'trouve', 'cache', 'lance', 'attrape', 'construit',
    'pousse', 'aide', 'ouvre', 'ferme', 'porte',
    // extras
    'va', 'vient', 'dit', 'prend', 'met', 'sait', 'peut', 'doit',
    'commence', 'finit', 'tombe', 'monte', 'descend', 'entre', 'sort',
    'rit', 'pleure', 'crie', 'écoute', 'touche', 'coupe', 'lave',
  ] as const).map(w => [w, 'verb'] as [string, string]),

  // Adjectives
  ...([
    'grand', 'petit', 'rouge', 'bleu', 'vert', 'content', 'triste',
    'rapide', 'lent', 'haut', 'drôle', 'joli', 'doux', 'fort', 'calme',
    'chaud', 'froid', 'nouveau', 'vieux', 'bon', 'jaune', 'violet',
    'orange', 'brave', 'rigolo', 'minuscule', 'gentil', 'méchant',
    // extras
    'beau', 'belle', 'gros', 'long', 'court', 'blanc', 'noir', 'rose',
    'marron', 'clair', 'sombre', 'propre', 'sale', 'mouillé', 'sec',
    'sucré', 'fatigué', 'malade', 'fâché', 'jeune',
  ] as const).map(w => [w, 'adjective'] as [string, string]),

  // Adverbs
  ...([
    'vite', 'lentement', 'très', 'vraiment', 'toujours', 'jamais', 'ici',
    'là', 'maintenant', "aujourd'hui", 'joyeusement', 'doucement', 'dehors',
    'ensemble', 'bien',
    // extras
    'aussi', 'encore', 'souvent', 'parfois', 'déjà', 'bientôt',
    'trop', 'beaucoup', 'peu', 'hier', 'demain',
  ] as const).map(w => [w, 'adverb'] as [string, string]),

  // Phrases
  ...([
    'dans', 'sur', 'avec', 'pour', 'sous', 'à côté de', 'devant',
    'derrière', 'un', 'une', 'au-dessus de', 'près de', 'autour de',
    'vers', 'entre', 'des', 'du', 'de la',
    // extras
    'le', 'la', 'les', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes',
    'ton', 'ta', 'tes', 'son', 'sa', 'ses',
  ] as const).map(w => [w, 'phrase'] as [string, string]),

  // Conjunctions
  ...([
    'et', 'mais', 'ou', 'parce que', 'alors', 'puis', 'quand',
    'pendant que', 'si',
    // extras
    'car', 'donc', 'ni', 'pourtant',
  ] as const).map(w => [w, 'conjunction'] as [string, string]),
]);

// ── Chinese (Simplified) ────────────────────────────────────────
const zh = new Map<string, string>([
  // Nouns
  ...([
    '猫', '狗', '鱼', '鸟', '树', '房子', '学校', '书', '球', '车',
    '妈妈', '爸爸', '宝宝', '男孩', '女孩', '朋友', '太阳', '月亮',
    '星星', '花', '苹果', '蛋糕', '水', '牛奶', '熊', '兔子', '青蛙',
    '猴子', '帽子', '鞋子', '马', '鸡', '饼干', '比萨', '卡车', '小船',
    '雨', '雪', '云', '花园', '老师', '国王', '王后', '龙', '机器人',
    // extras — common Sagebooks & beginner characters
    '人', '天', '地', '山', '石', '火', '风', '手', '口', '目',
    '耳', '头', '心', '身', '脚', '牙', '发', '面',
    '家', '门', '路', '桥', '船', '飞机', '自行车',
    '哥哥', '姐姐', '弟弟', '妹妹', '爷爷', '奶奶',
    '孩子', '小孩', '先生', '小姐', '同学',
    '米', '面包', '鸡蛋', '肉', '菜', '汤', '果汁', '茶',
    '桌子', '椅子', '床', '窗', '衣服', '裤子', '裙子',
    '笔', '纸', '包', '钱', '电话', '电视', '电脑',
    '草', '叶子', '河', '湖', '海', '岛',
    '猪', '牛', '羊', '虎', '蛇', '鹅', '蝴蝶', '蚂蚁',
    '西瓜', '香蕉', '葡萄', '草莓', '桃', '梨', '糖',
    '王', '字', '文', '话', '事', '东西',
  ] as const).map(w => [w, 'noun'] as [string, string]),

  // Verbs
  ...([
    '跑', '跳', '吃', '喝', '看', '喜欢', '爱', '有', '是', '玩',
    '读', '睡觉', '走', '唱歌', '跳舞', '飞', '游泳', '爬', '坐', '站',
    '做饭', '画画', '给', '要', '去', '找', '藏', '扔', '接', '建',
    '长', '帮助', '开', '关', '骑',
    // extras
    '来', '回', '说', '听', '问', '答', '想', '知道', '学', '教',
    '写', '拿', '放', '买', '卖', '送', '带', '用', '穿', '戴',
    '洗', '做', '打', '拉', '推', '踢', '抱', '哭', '笑',
    '等', '叫', '起', '睡', '醒', '停', '动', '变', '试',
    '住', '死', '生', '种', '摘', '拍', '搬', '修', '换',
    '怕', '忘', '记', '会', '能', '可以', '应该', '必须',
    '让', '把', '被', '跟', '请',
  ] as const).map(w => [w, 'verb'] as [string, string]),

  // Adjectives
  ...([
    '大', '小', '红', '蓝', '绿', '开心', '伤心', '快', '慢', '高',
    '好笑', '漂亮', '软', '响', '安静', '热', '冷', '新', '旧', '好',
    '黄', '紫', '橙', '勇敢', '傻', '小小', '强壮', '善良',
    // extras
    '长', '短', '胖', '瘦', '白', '黑', '亮', '暗', '干净', '脏',
    '甜', '酸', '苦', '辣', '咸', '饿', '渴', '累', '困',
    '难', '容易', '对', '错', '多', '少', '远', '近',
    '早', '晚', '忙', '坏', '丑', '老', '年轻', '深', '浅',
    '轻', '重', '厚', '薄', '圆', '方', '直', '弯',
    '干', '湿', '空', '满', '粗', '细',
  ] as const).map(w => [w, 'adjective'] as [string, string]),

  // Adverbs
  ...([
    '快快', '慢慢', '很', '真', '总是', '从不', '这里', '那里',
    '现在', '今天', '开心地', '大声地', '轻轻地', '在外面', '一起',
    // extras
    '也', '都', '又', '再', '常常', '有时候', '已经', '马上',
    '还', '才', '就', '最', '更', '非常', '特别', '只',
    '昨天', '明天', '刚才', '后来', '先', '正在',
  ] as const).map(w => [w, 'adverb'] as [string, string]),

  // Phrases / positional words / measure words
  ...([
    '在', '上', '下', '里', '一个', '这个', '那个', '后面',
    '上面', '旁边', '里面', '周围', '中间', '一些', '很多', '到',
    // extras
    '前面', '外面', '左边', '右边', '对面', '下面', '底下',
    '两个', '三个', '几个', '每个', '这些', '那些',
    '什么', '哪个', '哪里', '怎么', '多少', '为什么',
    '自己', '别人', '大家',
  ] as const).map(w => [w, 'phrase'] as [string, string]),

  // Particles
  ...([
    '的', '了', '吗', '呢', '吧', '啊', '呀', '嘛', '哦', '哈',
    '着', '过', '得',
  ] as const).map(w => [w, 'particle'] as [string, string]),

  // Conjunctions
  ...([
    '和', '但是', '或者', '因为', '所以', '还有', '然后', '如果', '一边',
    // extras
    '可是', '不过', '而且', '虽然', '不但', '而是',
  ] as const).map(w => [w, 'conjunction'] as [string, string]),
]);

const dictionaries: Record<string, Map<string, string>> = {
  'en': en,
  'fr': fr,
  'zh-Hans': zh,
};

/**
 * Detect the part of speech for a word based on a built-in dictionary.
 * Returns 'phrase' for unknown words (safest default for sentence building).
 */
export function detectPos(word: string, language?: string): string {
  if (!language) return 'phrase';

  const dict = dictionaries[language];
  if (!dict) return 'phrase';

  const trimmed = word.trim();

  // Try exact match first
  if (dict.has(trimmed)) return dict.get(trimmed)!;

  // Try lowercase (for English/French)
  const lower = trimmed.toLowerCase();
  if (dict.has(lower)) return dict.get(lower)!;

  return 'phrase';
}
