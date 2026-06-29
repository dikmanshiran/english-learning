import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNITS = [
  { id: 1, name: 'At School', icon: '🏫' },
  { id: 2, name: "Let's Play", icon: '⚽' },
  { id: 3, name: 'Animals', icon: '🐘' },
  { id: 4, name: 'Be Careful!', icon: '⚠️' },
  { id: 5, name: 'Work Together', icon: '🤝' },
];

const VOCAB = [
  // Unit 1
  { e: 'friend', h: 'חָבֵר', u: 1 }, { e: 'grade', h: 'כִּיתָה', u: 1 }, { e: 'house', h: 'בַּיִת', u: 1 },
  { e: 'new', h: 'חָדָש', u: 1 }, { e: 'school', h: 'בֵּית סֵפֶר', u: 1 }, { e: 'teacher', h: 'מוֹרֶה', u: 1 },
  { e: 'town', h: 'עִיר', u: 1 }, { e: 'bird', h: 'צִיפּוֹר', u: 1 }, { e: 'brother', h: 'אָח', u: 1 },
  { e: 'family', h: 'מִשְׁפָּחָה', u: 1 }, { e: 'fly', h: 'לָעוּף', u: 1 }, { e: 'lesson', h: 'שִׁיעוּר', u: 1 },
  { e: 'nice', h: 'נֶחְמָד', u: 1 }, { e: 'sister', h: 'אָחוֹת', u: 1 }, { e: 'talk', h: 'לְדַבֵּר', u: 1 },
  { e: 'want', h: 'לִרְצוֹת', u: 1 }, { e: 'board', h: 'לוּחַ', u: 1 }, { e: 'book', h: 'סֵפֶר', u: 1 },
  { e: 'chair', h: 'כִּסֵּא', u: 1 }, { e: 'eraser', h: 'מַחַק', u: 1 }, { e: 'homework', h: 'שִׁעוּרֵי בַּיִת', u: 1 },
  { e: 'lunch', h: 'אֲרוּחַת צָהֳרַיִם', u: 1 }, { e: 'need', h: 'צָרִיך', u: 1 }, { e: 'notebook', h: 'מַחְבֶּרֶת', u: 1 },
  { e: 'paper', h: 'נְיָר', u: 1 }, { e: 'pencil', h: 'עִפָּרוֹן', u: 1 }, { e: 'thanks', h: 'תּוֹדָה', u: 1 },
  { e: 'address', h: 'כְּתוֹבֶת', u: 1 }, { e: 'food', h: 'אוֹכֶל', u: 1 }, { e: 'please', h: 'בְּבַקָּשָׁה', u: 1 },
  { e: 'pupil', h: 'תַּלְמִיד', u: 1 }, { e: 'write', h: 'לִכְתּוֹב', u: 1 }, { e: 'art', h: 'אֳמָנוּת', u: 1 },
  { e: 'computer', h: 'מַחְשֵׁב', u: 1 }, { e: 'day', h: 'יוֹם', u: 1 }, { e: 'happy', h: 'שָׂמֵחַ', u: 1 },
  { e: 'learn', h: 'לִלְמוֹד', u: 1 }, { e: 'math', h: 'מָתֶמָטִיקָה', u: 1 }, { e: 'music', h: 'מוּסִיקָה', u: 1 },
  { e: 'sports', h: 'סְפּוֹרט', u: 1 }, { e: 'week', h: 'שָׁבוּעַ', u: 1 },
  // Unit 2
  { e: 'basketball', h: 'כַּדּוּרְסַל', u: 2 }, { e: 'game', h: 'מִשְׂחָק', u: 2 },
  { e: 'park', h: 'פַּארְק', u: 2 }, { e: 'play', h: 'לְשַׂחֵק', u: 2 }, { e: 'sunny', h: 'שָׁמְשִׁי', u: 2 },
  { e: 'warm', h: 'חַמִּים', u: 2 }, { e: 'eat', h: 'לֶאֱכוֹל', u: 2 }, { e: 'football', h: 'כַּדּוּרֶגֶל', u: 2 },
  { e: 'funny', h: 'מַצְחִיק', u: 2 }, { e: 'kite', h: 'עֲפִיפוֹן', u: 2 }, { e: 'near', h: 'קָרוֹב', u: 2 },
  { e: 'old', h: 'יָשָׁן', u: 2 }, { e: 'red', h: 'אָדוֹם', u: 2 }, { e: 'spring', h: 'אָבִיב', u: 2 },
  { e: 'tree', h: 'עֵץ', u: 2 }, { e: 'cloud', h: 'עָנָן', u: 2 }, { e: 'eyes', h: 'עֵינַיִים', u: 2 },
  { e: 'father', h: 'אַבָּא', u: 2 }, { e: 'home', h: 'בַּיִת', u: 2 }, { e: 'mother', h: 'אִמָּא', u: 2 },
  { e: 'mouth', h: 'פֶּה', u: 2 }, { e: 'nose', h: 'אַף', u: 2 }, { e: 'picture', h: 'תְּמוּנָה', u: 2 },
  { e: 'sky', h: 'שָׁמַיִים', u: 2 }, { e: 'sleep', h: 'לִישׁוֹן', u: 2 }, { e: 'boots', h: 'מַגָּפַיִים', u: 2 },
  { e: 'children', h: 'יְלָדִים', u: 2 }, { e: 'dress', h: 'שִׂמְלָה', u: 2 }, { e: 'ice cream', h: 'גְּלִידָה', u: 2 },
  { e: 'pants', h: 'מִכְנָסַיִים', u: 2 }, { e: 'shirt', h: 'חוּלְצָה', u: 2 }, { e: 'shoes', h: 'נַעֲלַיִים', u: 2 },
  { e: 'socks', h: 'גַּרְבַּיִים', u: 2 }, { e: 'store', h: 'חֲנוּת', u: 2 }, { e: 'wear', h: 'לִלְבּוֹש', u: 2 },
  { e: 'autumn', h: 'סְתָיו', u: 2 }, { e: 'beautiful', h: 'יָפֶה', u: 2 }, { e: 'climb', h: 'לִטְפֵּס', u: 2 },
  { e: 'coat', h: 'מְעִיל', u: 2 }, { e: 'cold', h: 'קַר', u: 2 }, { e: 'pool', h: 'בְּרֵכָה', u: 2 },
  { e: 'snow', h: 'שֶׁלֶג', u: 2 }, { e: 'summer', h: 'קַיִץ', u: 2 }, { e: 'wall', h: 'קִיר', u: 2 },
  { e: 'winter', h: 'חֹרֶף', u: 2 },
  // Unit 3
  { e: 'animal', h: 'חַיָּה', u: 3 }, { e: 'cool', h: 'מַגְנִיב', u: 3 }, { e: 'elephant', h: 'פִּיל', u: 3 },
  { e: 'face', h: 'פָּנִים', u: 3 }, { e: 'lion', h: 'אַרְיֵה', u: 3 }, { e: 'scared', h: 'מְפוּחָד', u: 3 },
  { e: 'turtle', h: 'צָב', u: 3 }, { e: 'walk', h: 'לָלֶכֶת', u: 3 }, { e: 'water', h: 'מַיִם', u: 3 },
  { e: 'bath', h: 'אַמְבַּטְיָה', u: 3 }, { e: 'dinner', h: 'אֲרוּחַת עֶרֶב', u: 3 },
  { e: 'dirty', h: 'מְלוּכְלָך', u: 3 }, { e: 'drink', h: 'לִשְׁתּוֹת', u: 3 }, { e: 'hungry', h: 'רָעֵב', u: 3 },
  { e: 'listen', h: 'לְהַקְשִׁיב', u: 3 }, { e: 'smile', h: 'לְחַיֵּיך', u: 3 }, { e: 'tired', h: 'עָיֵף', u: 3 },
  { e: 'wake up', h: 'לְהִתְעוֹרֵר', u: 3 }, { e: 'penguin', h: 'פִינְגְּוִין', u: 3 },
  { e: 'people', h: 'אֲנָשִׁים', u: 3 }, { e: 'watch', h: 'לִצְפּוֹת', u: 3 }, { e: 'woman', h: 'אִישָׁה', u: 3 },
  { e: 'beach', h: 'חוֹף יָם', u: 3 }, { e: 'birthday', h: 'יוֹם הוּלֶּדֶת', u: 3 },
  { e: 'cake', h: 'עוּגָה', u: 3 }, { e: 'farm', h: 'חַוָּה', u: 3 }, { e: 'horse', h: 'סוּס', u: 3 },
  { e: 'party', h: 'מְסִיבָּה', u: 3 }, { e: 'ride', h: 'לִרְכּוֹב', u: 3 }, { e: 'sea', h: 'יָם', u: 3 },
  { e: 'swimsuit', h: 'בֶּגֶד יָם', u: 3 }, { e: 'bike', h: 'אוֹפַנַּיִם', u: 3 },
  { e: 'clean', h: 'נָקִי', u: 3 }, { e: 'dance', h: 'לִרְקוֹד', u: 3 }, { e: 'doctor', h: 'רוֹפֵא', u: 3 },
  { e: 'floor', h: 'רִצְפָּה', u: 3 }, { e: 'hospital', h: 'בֵּית חוֹלִים', u: 3 },
  { e: 'kitten', h: 'חֲתַלְתּוּל', u: 3 }, { e: 'table', h: 'שׁוּלְחָן', u: 3 }, { e: 'take', h: 'לָקַחַת', u: 3 },
  // Unit 4
  { e: 'car', h: 'מְכוֹנִית', u: 4 }, { e: 'driver', h: 'נַהָג', u: 4 }, { e: 'ears', h: 'אוֹזְנַיִים', u: 4 },
  { e: 'helmet', h: 'קַסְדָּה', u: 4 }, { e: 'now', h: 'עַכְשָׁיו', u: 4 }, { e: 'truck', h: 'מַשָּׂאִית', u: 4 },
  { e: 'apple', h: 'תַּפּוּחַ', u: 4 }, { e: 'chicken', h: 'עוֹף', u: 4 }, { e: 'chocolate', h: 'שׁוֹקוֹלָד', u: 4 },
  { e: 'cookie', h: 'עוּגִיָּה', u: 4 }, { e: 'fruit', h: 'פְּרִי', u: 4 }, { e: 'juice', h: 'מִיץ', u: 4 },
  { e: 'menu', h: 'תַּפְרִיט', u: 4 }, { e: 'potato', h: 'תַּפּוּחַ אַדָמָה', u: 4 },
  { e: 'soup', h: 'מָרָק', u: 4 }, { e: 'tomato', h: 'עֲגַבְנִיָּה', u: 4 }, { e: 'angry', h: 'כּוֹעֵס', u: 4 },
  { e: 'bedroom', h: 'חֶדֶר שֵׁינָה', u: 4 }, { e: 'cheese', h: 'גְּבִינָה', u: 4 },
  { e: 'clothes', h: 'בְּגָדִים', u: 4 }, { e: 'little', h: 'קָטָן', u: 4 },
  { e: 'living room', h: 'סָלוֹן', u: 4 }, { e: 'monkey', h: 'קוֹף', u: 4 },
  { e: 'next to', h: 'לְיַד', u: 4 }, { e: 'police', h: 'מִשְׁטָרָה', u: 4 }, { e: 'rain', h: 'גֶּשֶׁם', u: 4 },
  { e: 'station', h: 'תַּחֲנָה', u: 4 }, { e: 'under', h: 'מִתַּחַת', u: 4 }, { e: 'wind', h: 'רוּחַ', u: 4 },
  { e: 'color', h: 'צֶבַע', u: 4 }, { e: 'kitchen', h: 'מִטְבָּח', u: 4 }, { e: 'pink', h: 'וָרוֹד', u: 4 },
  { e: 'plane', h: 'מָטוֹס', u: 4 }, { e: 'boat', h: 'סִירָה', u: 4 }, { e: 'buy', h: 'לִקְנוֹת', u: 4 },
  { e: 'slowly', h: 'לְאַט', u: 4 }, { e: 'train', h: 'רַכֶּבֶת', u: 4 }, { e: 'very', h: 'מְאוֹד', u: 4 },
  { e: 'wet', h: 'רָטוֹב', u: 4 },
  // Unit 5
  { e: 'door', h: 'דֶּלֶת', u: 5 }, { e: 'draw', h: 'לְצַיֵּיר', u: 5 }, { e: 'key', h: 'מַפְתֵּחַ', u: 5 },
  { e: 'king', h: 'מֶלֶך', u: 5 }, { e: 'mouse', h: 'עַכְבָּר', u: 5 }, { e: 'noon', h: 'צָהֳרַיִים', u: 5 },
  { e: 'open', h: 'לִפְתּוֹחַ', u: 5 }, { e: 'together', h: 'יַחַד', u: 5 }, { e: 'wood', h: 'עֵץ', u: 5 },
  { e: 'work', h: 'עֲבוֹדָה', u: 5 }, { e: 'baby', h: 'תִּינוֹק', u: 5 }, { e: 'bear', h: 'דּוֹב', u: 5 },
  { e: 'carry', h: 'לָשֵׂאת', u: 5 }, { e: 'fire', h: 'אֵש', u: 5 }, { e: 'grass', h: 'דֶּשֶׁא', u: 5 },
  { e: 'queen', h: 'מַלְכָּה', u: 5 }, { e: 'story', h: 'סִיפּוּר', u: 5 }, { e: 'bake', h: 'לֶאֱפוֹת', u: 5 },
  { e: 'bakery', h: 'מַאֲפִיָּה', u: 5 }, { e: 'bee', h: 'דְּבוֹרָה', u: 5 },
  { e: 'coffee', h: 'קָפֶה', u: 5 }, { e: 'hair', h: 'שֵׂעָר', u: 5 }, { e: 'hotel', h: 'מָלוֹן', u: 5 },
  { e: 'short', h: 'קָצָר', u: 5 }, { e: 'fork', h: 'מַזְלֵג', u: 5 }, { e: 'knife', h: 'סַכִּין', u: 5 },
  { e: 'meal', h: 'אֲרוּחָה', u: 5 }, { e: 'star', h: 'כּוֹכָב', u: 5 }, { e: 'win', h: 'לִנְצּוֹחַ', u: 5 },
  { e: 'garden', h: 'גַּן', u: 5 }, { e: 'ground', h: 'אֲדָמָה', u: 5 }, { e: 'lake', h: 'אֲגַם', u: 5 },
  { e: 'left', h: 'שְׂמֹאל', u: 5 }, { e: 'north', h: 'צָפוֹן', u: 5 }, { e: 'right', h: 'יָמִין', u: 5 },
  { e: 'south', h: 'דָּרוֹם', u: 5 }, { e: 'west', h: 'מַעֲרָב', u: 5 }, { e: 'east', h: 'מִזְרָח', u: 5 },
];

const PHRASES = [
  { e: "What's your name?", h: 'מַה שִׁמְךָ?', u: 1 },
  { e: 'My name is...', h: 'שְׁמִי...', u: 1 },
  { e: 'Where do you live?', h: 'אֵיפֹה אַתָּה גָּר?', u: 1 },
  { e: 'How old are you?', h: 'בֶּן כַּמָּה אַתָּה?', u: 1 },
  { e: 'Do you have...?', h: 'יֵש לְךָ...?', u: 1 },
  { e: "Let's go!", h: 'בוֹא נֵלֵך!', u: 1 },
  { e: "I can't", h: 'אֲנִי לֹא יָכוֹל', u: 1 },
  { e: "There's...", h: 'יֵש...', u: 1 },
  { e: 'I want...', h: 'אֲנִי רוֹצֶה...', u: 1 },
  { e: "I don't want...", h: 'אֲנִי לֹא רוֹצֶה...', u: 1 },
  { e: "What's the weather today?", h: 'מָה מֶזֶג הָאֲוִיר הַיּוֹם?', u: 2 },
  { e: 'How much?', h: 'כַּמָּה?', u: 3 },
  { e: 'Do you like...?', h: 'אַתָּה אוֹהֵב...?', u: 3 },
  { e: 'Are you...?', h: 'הַאִם אַתָּה...?', u: 3 },
  { e: 'How do you feel?', h: 'אֵיך אַתָּה מַרְגִּישׁ?', u: 3 },
  { e: 'Excuse me, please', h: 'סְלִיחָה, בְּבַקָּשָׁה', u: 3 },
  { e: 'What time is it?', h: 'מָה הַשָּׁעָה?', u: 4 },
  { e: "I'm good at...", h: 'אֲנִי טוֹב בְּ...', u: 4 },
  { e: 'I know', h: 'אֲנִי יוֹדֵעַ', u: 4 },
  { e: "I don't know", h: 'אֲנִי לֹא יוֹדֵעַ', u: 4 },
  { e: 'Good idea!', h: 'רַעְיוֹן טוֹב!', u: 4 },
  { e: 'Does he...?', h: 'הַאִם הוּא...?', u: 5 },
  { e: 'Does she...?', h: 'הַאִם הִיא...?', u: 5 },
  { e: 'What do you want to do?', h: 'מָה אַתָּה רוֹצֶה לַעֲשׂוֹת?', u: 5 },
  { e: 'Show me...', h: 'הַרְאֵה לִי...', u: 5 },
];

const SENTENCES = [
  { s: 'I go to ___ every day to study.', a: 'school', opts: ['school', 'park', 'store', 'pool'], u: 1 },
  { s: 'My ___ helps me learn new things in class.', a: 'teacher', opts: ['teacher', 'friend', 'sister', 'pupil'], u: 1 },
  { s: 'I write in my ___ during the lesson.', a: 'notebook', opts: ['notebook', 'eraser', 'pencil', 'chair'], u: 1 },
  { s: 'I use an ___ when I make a mistake.', a: 'eraser', opts: ['eraser', 'pencil', 'book', 'board'], u: 1 },
  { s: 'We eat ___ at school at noon.', a: 'lunch', opts: ['lunch', 'dinner', 'breakfast', 'fruit'], u: 1 },
  { s: 'I write with a ___ on paper.', a: 'pencil', opts: ['pencil', 'eraser', 'book', 'chair'], u: 1 },
  { s: 'I say ___ when someone helps me.', a: 'thanks', opts: ['thanks', 'please', 'sorry', 'hello'], u: 1 },
  { s: 'My ___ is the girl who has the same parents as me.', a: 'sister', opts: ['sister', 'friend', 'teacher', 'mother'], u: 1 },
  { s: 'In ___ class, I paint pictures.', a: 'art', opts: ['art', 'math', 'music', 'sports'], u: 1 },
  { s: 'A ___ is a colorful animal that can fly.', a: 'bird', opts: ['bird', 'fish', 'turtle', 'lion'], u: 1 },
  { s: 'We play ___ with a round ball on a field.', a: 'football', opts: ['football', 'basketball', 'tennis', 'kite'], u: 2 },
  { s: 'In ___, the weather is warm and flowers bloom.', a: 'spring', opts: ['spring', 'winter', 'autumn', 'summer'], u: 2 },
  { s: 'I wear a ___ when it is cold outside.', a: 'coat', opts: ['coat', 'dress', 'swimsuit', 'shirt'], u: 2 },
  { s: 'We build a snowman in ___.', a: 'winter', opts: ['winter', 'summer', 'spring', 'autumn'], u: 2 },
  { s: 'In ___, leaves fall from the trees.', a: 'autumn', opts: ['autumn', 'spring', 'summer', 'winter'], u: 2 },
  { s: 'A ___ floats high up in the sky with the wind.', a: 'kite', opts: ['kite', 'cloud', 'bird', 'plane'], u: 2 },
  { s: 'I wear ___ on my feet inside my shoes.', a: 'socks', opts: ['socks', 'boots', 'pants', 'coat'], u: 2 },
  { s: 'I wear ___ on my feet when it rains.', a: 'boots', opts: ['boots', 'shoes', 'socks', 'pants'], u: 2 },
  { s: 'In ___, I swim in the pool because it is hot.', a: 'summer', opts: ['summer', 'winter', 'autumn', 'spring'], u: 2 },
  { s: 'I go to the ___ to play on the swings.', a: 'park', opts: ['park', 'store', 'school', 'pool'], u: 2 },
  { s: 'A ___ is very big and has a long trunk.', a: 'elephant', opts: ['elephant', 'lion', 'turtle', 'penguin'], u: 3 },
  { s: 'A ___ can swim in very cold water.', a: 'penguin', opts: ['penguin', 'horse', 'lion', 'turtle'], u: 3 },
  { s: 'We go to the ___ when we are sick.', a: 'hospital', opts: ['hospital', 'school', 'store', 'farm'], u: 3 },
  { s: 'I ride a ___ at the farm.', a: 'horse', opts: ['horse', 'turtle', 'lion', 'penguin'], u: 3 },
  { s: 'A ___ is a baby cat.', a: 'kitten', opts: ['kitten', 'penguin', 'turtle', 'horse'], u: 3 },
  { s: 'A ___ is the king of the jungle.', a: 'lion', opts: ['lion', 'turtle', 'penguin', 'horse'], u: 3 },
  { s: 'We go to the ___ to swim in the sea.', a: 'beach', opts: ['beach', 'farm', 'pool', 'garden'], u: 3 },
  { s: 'We have a ___ with cake and games on my birthday.', a: 'party', opts: ['party', 'dinner', 'lunch', 'game'], u: 3 },
  { s: 'I feel ___ when I exercise a lot.', a: 'tired', opts: ['tired', 'hungry', 'dirty', 'scared'], u: 3 },
  { s: "I feel ___ when I haven't eaten.", a: 'hungry', opts: ['hungry', 'tired', 'dirty', 'scared'], u: 3 },
  { s: 'I wear a ___ on my head when I ride my bike.', a: 'helmet', opts: ['helmet', 'coat', 'boots', 'hat'], u: 4 },
  { s: 'I drink orange ___ in the morning.', a: 'juice', opts: ['juice', 'soup', 'milk', 'water'], u: 4 },
  { s: 'We eat warm ___ when it is cold outside.', a: 'soup', opts: ['soup', 'juice', 'chocolate', 'cookie'], u: 4 },
  { s: 'The ___ drives the bus safely.', a: 'driver', opts: ['driver', 'teacher', 'doctor', 'pupil'], u: 4 },
  { s: 'I cook food in the ___.', a: 'kitchen', opts: ['kitchen', 'bedroom', 'living room', 'bathroom'], u: 4 },
  { s: 'I sleep in my ___.', a: 'bedroom', opts: ['bedroom', 'kitchen', 'living room', 'classroom'], u: 4 },
  { s: 'We watch TV in the ___.', a: 'living room', opts: ['living room', 'bedroom', 'kitchen', 'garden'], u: 4 },
  { s: 'A ___ is a fun animal that swings in trees.', a: 'monkey', opts: ['monkey', 'lion', 'turtle', 'horse'], u: 4 },
  { s: 'I travel to another city by ___.', a: 'train', opts: ['train', 'boat', 'bus', 'plane'], u: 4 },
  { s: 'It flies in the sky and takes people far away.', a: 'plane', opts: ['plane', 'train', 'boat', 'car'], u: 4 },
  { s: 'Trees grow in the ___.', a: 'garden', opts: ['garden', 'bedroom', 'kitchen', 'hospital'], u: 5 },
  { s: 'A ___ makes honey and has a yellow and black body.', a: 'bee', opts: ['bee', 'lion', 'turtle', 'penguin'], u: 5 },
  { s: 'A ___ is the male ruler of a kingdom.', a: 'king', opts: ['king', 'queen', 'doctor', 'teacher'], u: 5 },
  { s: 'A ___ is the female ruler of a kingdom.', a: 'queen', opts: ['queen', 'king', 'woman', 'baby'], u: 5 },
  { s: 'I eat my meal with a ___ and a knife.', a: 'fork', opts: ['fork', 'spoon', 'knife', 'plate'], u: 5 },
  { s: 'The sun rises in the ___ and sets in the west.', a: 'east', opts: ['east', 'west', 'north', 'south'], u: 5 },
  { s: 'I open the ___ to enter the room.', a: 'door', opts: ['door', 'window', 'key', 'wall'], u: 5 },
  { s: 'I use a ___ to unlock the door.', a: 'key', opts: ['key', 'door', 'lock', 'handle'], u: 5 },
  { s: 'We bake bread at the ___.', a: 'bakery', opts: ['bakery', 'hospital', 'store', 'school'], u: 5 },
  { s: 'A ___ is a big friendly animal that loves honey.', a: 'bear', opts: ['bear', 'lion', 'horse', 'wolf'], u: 5 },
];

const LISTEN_SENTENCES = [
  { e: 'I go to school every day to study.', h: 'אֲנִי הוֹלֵך לְבֵית סֵפֶר כָּל יוֹם לִלְמוֹד.', u: 1 },
  { e: 'My teacher helps me learn new things in class.', h: 'הַמּוֹרֶה שֶׁלִּי עוֹזֵר לִי לִלְמוֹד דְּבָרִים חֲדָשִׁים בַּכִּיתָּה.', u: 1 },
  { e: 'I write in my notebook during the lesson.', h: 'אֲנִי כּוֹתֵב בַּמַּחְבֶּרֶת שֶׁלִּי בְּמַהֲלַך הַשִּׁיעוּר.', u: 1 },
  { e: 'I use an eraser when I make a mistake.', h: 'אֲנִי מִשְׁתַּמֵּשׁ בְּמַחַק כְּשֶׁאֲנִי עוֹשֶׂה טָעוּת.', u: 1 },
  { e: 'We eat lunch at school at noon.', h: 'אֲנַחְנוּ אוֹכְלִים אֲרוּחַת צָהֳרַיִם בְּבֵית הַסֵּפֶר בַּצָּהֳרַיִם.', u: 1 },
  { e: 'I say thanks when someone helps me.', h: 'אֲנִי אוֹמֵר תּוֹדָה כְּשֶׁמִּישֶׁהוּ עוֹזֵר לִי.', u: 1 },
  { e: 'In art class I paint pictures.', h: 'בְּשִׁיעוּר אֳמָנוּת אֲנִי מְצַיֵּיר תְּמוּנוֹת.', u: 1 },
  { e: 'We play football with a round ball on a field.', h: 'אֲנַחְנוּ מְשַׂחֲקִים כַּדּוּרֶגֶל עִם כַּדּוּר עָגוֹל עַל מִגְרָשׁ.', u: 2 },
  { e: 'In spring the weather is warm and flowers bloom.', h: 'בָּאָבִיב מֶזֶג הָאֲוִיר חַמִּים וּפְרָחִים פּוֹרְחִים.', u: 2 },
  { e: 'I wear a coat when it is cold outside.', h: 'אֲנִי לוֹבֵשׁ מְעִיל כְּשֶׁקַּר בַּחוּץ.', u: 2 },
  { e: 'We build a snowman in winter.', h: 'אֲנַחְנוּ בּוֹנִים אִישׁ שֶׁלֶג בַּחֹרֶף.', u: 2 },
  { e: 'In autumn leaves fall from the trees.', h: 'בַּסְּתָיו עָלִים נוֹפְלִים מֵהָעֵצִים.', u: 2 },
  { e: 'In summer I swim in the pool because it is hot.', h: 'בַּקַּיִץ אֲנִי שׁוֹחֶה בַּבְּרֵכָה כִּי חַמִּים.', u: 2 },
  { e: 'I go to the park to play.', h: 'אֲנִי הוֹלֵך לַפַּארְק לְשַׂחֵק.', u: 2 },
  { e: 'An elephant is very big and has a long trunk.', h: 'פִּיל הוּא מְאוֹד גָּדוֹל וְיֵשׁ לוֹ חֶדֶק אָרוֹךְ.', u: 3 },
  { e: 'A penguin can swim in very cold water.', h: 'פִינְגְּוִין יָכוֹל לִשְׂחוֹת בְּמַיִם קָרִים מְאוֹד.', u: 3 },
  { e: 'We go to the hospital when we are sick.', h: 'אֲנַחְנוּ הוֹלְכִים לְבֵית הַחוֹלִים כְּשֶׁאֲנַחְנוּ חוֹלִים.', u: 3 },
  { e: 'I ride a horse at the farm.', h: 'אֲנִי רוֹכֵב עַל סוּס בַּחַוָּה.', u: 3 },
  { e: 'A kitten is a baby cat.', h: 'חֲתַלְתּוּל הוּא חָתוּל תִּינוֹק.', u: 3 },
  { e: 'A lion is the king of the jungle.', h: "אַרְיֵה הוּא מֶלֶך הַג'וּנְגַל.", u: 3 },
  { e: 'We go to the beach to swim in the sea.', h: 'אֲנַחְנוּ הוֹלְכִים לַחוֹף לִשְׂחוֹת בַּיָּם.', u: 3 },
  { e: 'I feel tired when I exercise a lot.', h: 'אֲנִי מַרְגִּישׁ עָיֵף כְּשֶׁאֲנִי מִתְאַמֵּן הַרְבֵּה.', u: 3 },
  { e: 'I feel hungry when I have not eaten.', h: 'אֲנִי מַרְגִּישׁ רָעֵב כְּשֶׁלֹּא אָכַלְתִּי.', u: 3 },
  { e: 'I wear a helmet when I ride my bike.', h: 'אֲנִי חוֹבֵשׁ קַסְדָּה כְּשֶׁאֲנִי רוֹכֵב עַל אוֹפַנַּיִם.', u: 4 },
  { e: 'I drink orange juice in the morning.', h: 'אֲנִי שׁוֹתֶה מִיץ תַּפּוּזִים בַּבֹּקֶר.', u: 4 },
  { e: 'We eat warm soup when it is cold outside.', h: 'אֲנַחְנוּ אוֹכְלִים מָרָק חַמִּים כְּשֶׁקַּר בַּחוּץ.', u: 4 },
  { e: 'I cook food in the kitchen.', h: 'אֲנִי מְבַשֵּׁל אוֹכֶל בַּמִּטְבָּח.', u: 4 },
  { e: 'I sleep in my bedroom.', h: 'אֲנִי יָשֵׁן בְּחֶדֶר הַשֵּׁינָה שֶׁלִּי.', u: 4 },
  { e: 'We watch TV in the living room.', h: 'אֲנַחְנוּ צוֹפִים בַּטֶּלֶוִיזְיָה בַּסָּלוֹן.', u: 4 },
  { e: 'I travel to another city by train.', h: 'אֲנִי נוֹסֵעַ לְעִיר אַחֶרֶת בָּרַכֶּבֶת.', u: 4 },
  { e: 'Trees grow in the garden.', h: 'עֵצִים גְּדֵלִים בַּגַּן.', u: 5 },
  { e: 'A bee makes honey and has a yellow and black body.', h: 'דְּבוֹרָה מְיַצֶּרֶת דְּבַשׁ וְיֵשׁ לָהּ גּוּף צָהֹב וְשָׁחוֹר.', u: 5 },
  { e: 'I open the door to enter the room.', h: 'אֲנִי פּוֹתֵחַ אֶת הַדֶּלֶת כְּדֵי לְהִיכָּנֵס לַחֶדֶר.', u: 5 },
  { e: 'We bake bread at the bakery.', h: 'אֲנַחְנוּ אוֹפִים לֶחֶם בַּמַּאֲפִיָּה.', u: 5 },
  { e: 'The sun rises in the east and sets in the west.', h: 'הַשֶּׁמֶשׁ עוֹלָה בַּמִּזְרָח וְשׁוֹקַעַת בַּמַּעֲרָב.', u: 5 },
  { e: 'I eat my meal with a fork and a knife.', h: 'אֲנִי אוֹכֵל אֶת הָאֲרוּחָה שֶׁלִּי עִם מַזְלֵג וְסַכִּין.', u: 5 },
];

async function main() {
  console.log('Seeding database...');

  for (const unit of UNITS) {
    await prisma.unit.upsert({
      where: { id: unit.id },
      update: {},
      create: unit,
    });
  }

  for (const v of VOCAB) {
    await prisma.vocabItem.create({ data: { english: v.e, hebrew: v.h, unitId: v.u } });
  }

  for (const p of PHRASES) {
    await prisma.phraseItem.create({ data: { english: p.e, hebrew: p.h, unitId: p.u } });
  }

  for (const s of SENTENCES) {
    await prisma.sentenceItem.create({ data: { sentence: s.s, answer: s.a, options: s.opts, unitId: s.u } });
  }

  for (const l of LISTEN_SENTENCES) {
    await prisma.listenItem.create({ data: { english: l.e, hebrew: l.h, unitId: l.u } });
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
