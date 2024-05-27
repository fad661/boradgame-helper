import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";

const SHOWHAND_COUNT = 5;

const PHASE = {
  RANK: 0,
  SUIT: 1,
  DUPLICATE: 2,
  HAND: 3,
  RESULT: 4,
} as const;

type Phase = typeof PHASE[keyof typeof PHASE];

const rl = readline.createInterface({ input, output });

const main = async () => {
  let phase: Phase = PHASE.RANK;
  let rank = 13;
  let suit = 4;
  let duplicate = 1;
  let hand = 5;

  rank = await numberQuestion("ランクの種類(number)", 13);
  suit = await numberQuestion("スートの種類(number)", 4);
  duplicate = await numberQuestion("同名カードの種類(number)", 1);
  hand = await numberQuestion("ハンドの枚数(number)", 5);

  const sum = rank * suit * duplicate;
  console.log(`合計: ${sum}`)

  const params = [sum, rank, suit, duplicate, hand] as [number, number, number, number, number];

  const hands = [
    [
      'Royal Straight Flash',
      calcRoyalStraightFlash(...params)
    ],
    [
      'Straight Flash',
      calcStraightFlash(...params)
    ],
    [
      'Four Card',
      calcFourCard(...params)
    ],
    [
      'Full House',
      calcFullHouse(...params)
    ],
    [
      'Flash',
      calcFlash(...params)
    ],
    [
      'Straight',
      calcStraight(...params)
    ],
    [
      'Three Card',
      calcThreeCard(...params)
    ],
    [
      'Two Pair',
      calcTwoPair(...params)
    ],
    [
      'One Pair',
      calcOnePair(...params)
    ],
  ] as [string, number][];
  const titles = hands.map((params) => {
    return params[0];
  });
  const longestTitleLength = titles.reduce((acc, title) => {
    return acc < title.length ? title.length : acc;
  }, 0);

  showLine();
  hands.forEach((params) => {
    showData(params[0], percent(params[1]), longestTitleLength);
  });
  const highCardParams = hands.reduce((acc, current) => {
    return [acc[0], acc[1] - current[1]];
  }, ['High Card', 1]);
  showData(highCardParams[0], percent(highCardParams[1]), longestTitleLength);
  showLine();
};

const calcRoyalStraightFlash = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcRoyalStraightFlashPattern(suit, duplicate) * calcCombination(sum - SHOWHAND_COUNT, hand - SHOWHAND_COUNT);
  const allCombination = calcCombination(sum, hand);
  return allPattern / allCombination;
};

const calcStraightFlash = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcStraightFlashPattern(rank, suit, duplicate) * calcCombination(sum - SHOWHAND_COUNT, hand - SHOWHAND_COUNT);
  const allCombination = calcCombination(sum, hand);
  return (allPattern - calcRoyalStraightFlashPattern(suit, duplicate)) / allCombination;
};

const calcFourCard = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcFourCardPattern(rank, suit, duplicate) * calcRemaingPattern(sum, suit * duplicate, hand - (SHOWHAND_COUNT - 1));
  const allCombination = calcCombination(sum, hand);
  return allPattern / allCombination;
};

const calcFullHouse = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcFullHousePattern(rank, suit, duplicate) * calcRemaingPattern(sum, suit * duplicate * 2, hand - SHOWHAND_COUNT);
  const allCombination = calcCombination(sum, hand);
  return allPattern / allCombination;
};

const calcFlash = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcFlashPattern(rank, suit, duplicate) * calcCombination(sum - SHOWHAND_COUNT, hand - SHOWHAND_COUNT);
  const allCombination = calcCombination(sum, hand);
  return (allPattern - calcStraightFlashPattern(rank, suit, duplicate)) / allCombination;
};

const calcStraight = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcStraightPattern(rank, suit, duplicate) * calcCombination(sum - SHOWHAND_COUNT, hand - SHOWHAND_COUNT);
  const allCombination = calcCombination(sum, hand);
  return (allPattern - calcStraightFlashPattern(rank, suit, duplicate)) / allCombination;
};

const calcThreeCard = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcThreeCardPattern(rank, suit, duplicate) * calcCombination(sum - suit * duplicate, hand - (SHOWHAND_COUNT - 2));
  const allCombination = calcCombination(sum, hand);
  return (allPattern - calcFourCardPattern(rank, suit, duplicate) - calcFullHousePattern(rank, suit, duplicate)) / allCombination;
};

const calcTwoPair = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcTwoPairPattern(rank, suit, duplicate) * calcRemaingPattern(sum , suit * duplicate, hand - (SHOWHAND_COUNT - 1));
  const allCombination = calcCombination(sum, hand);
  return (allPattern  - calcFourCardPattern(rank, suit, duplicate) - calcFullHousePattern(rank, suit, duplicate)) / allCombination;
};

const calcOnePair = (sum: number, rank: number, suit: number, duplicate: number, hand: number) => {
  const allPattern = calcOnePairPattern(rank, suit, duplicate) * calcRemaingPattern(sum, suit * duplicate, hand - (SHOWHAND_COUNT - 3));
  const allCombination = calcCombination(sum, hand);
  return (allPattern - calcFourCardPattern(rank, suit, duplicate) - calcFullHousePattern(rank, suit, duplicate) - calcThreeCardPattern(rank, suit, duplicate) - calcTwoPairPattern(rank, suit, duplicate)) / allCombination;
};


// パターン算出
const calcRoyalStraightFlashPattern = (suit: number, duplicate: number) => {
  const needCount = 5;
  const patternCount = duplicate ** needCount;
  return patternCount * suit;
};

const calcStraightFlashPattern = (rank: number, suit: number, duplicate: number) => {
  const needCount = 5;
  const specialCase = 1; // Aの14扱い
  const patternOnSuit = rank + specialCase - (needCount - 1);
  const patternCount = duplicate ** needCount * patternOnSuit;
  const allPattern = patternCount * suit;
  return allPattern;
};

const calcFourCardPattern = (rank: number, suit: number, duplicate: number) => {
  const sameRankCount = suit * duplicate;
  const patternOnRank = calcCombination(sameRankCount, 4);
  const allPattern = patternOnRank * rank;
  return allPattern;
};

const calcFullHousePattern = (rank: number, suit: number, duplicate: number) => {
  const sameRankCount = suit * duplicate;
  const threePairCount = calcCombination(sameRankCount, 3);
  const twoPairCount = calcCombination(sameRankCount, 2);
  const oterhRankPair = calcPermutation(rank, 2);
  const allPattern = threePairCount * twoPairCount * oterhRankPair;
  return allPattern;
};

const calcFlashPattern = (rank: number, suit: number, duplicate: number) => {
  const sameSuitCount = rank * duplicate;
  const sameSuitPattern = calcCombination(sameSuitCount, 5);
  const allPattern = sameSuitPattern * suit;
  return allPattern;
};

const calcStraightPattern = (rank: number, suit: number, duplicate: number) => {
  const needCount = 5;
  const sameRankCount = suit * duplicate;
  const specialCase = 1; // Aの14扱い
  const patternOnEachRank = rank + specialCase - (needCount - 1);
  const allPattern = sameRankCount ** 5 * patternOnEachRank;
  return allPattern;
};

const calcThreeCardPattern = (rank: number, suit: number, duplicate: number) => {
  const sameRankCount = suit * duplicate;
  const allPattern = calcCombination(sameRankCount, 3) * calcCombination(rank, 1);
  return allPattern;
};

const calcTwoPairPattern = (rank: number, suit: number, duplicate: number) => {
  const sameRankCount = suit * duplicate;
  const twoPairCount = calcCombination(sameRankCount, 2);
  const otherRankPair = calcCombination(rank, 2);
  const allPattern = twoPairCount ** 2 * otherRankPair;
  return allPattern;
};

const calcOnePairPattern = (rank: number, suit: number, duplicate: number) => {
  const sameRankCount = suit * duplicate;
  const allPattern = calcCombination(sameRankCount, 2) * calcCombination(rank, 1);
  return allPattern;
};

// 計算補助
const calcCombination = (n: number, r: number) => {
  return calcPermutation(n, r) / calcPermutation(r, r);
};

const calcPermutation = (n: number, r: number) => {
  return [...new Array(r)].reduce((acc, _, i) => {
    return acc * (n - i);
  }, 1);
};

const calcRemaingPattern = (sum: number, base: number, remaing: number) => {
  return [...new Array(remaing)].map(() => 1).reduce((acc, _, i) => {
    return acc * calcCombination(sum - (i + 1) * base, 1);
  }, 1) / calcPermutation(remaing, remaing);
};

// 入出力補助
const numberQuestion = async (q: string, def: number): Promise<number> => {
  const res = await rl.question(`${q}/${def}: `);
  if (res === '') return def;
  const num = parseFloat(res);
  if (isNaN(num)) {
    console.log('数値で乳りょく');
    return await numberQuestion(q, def);
  }
  return num;
};

const percent = (num: number, digits?: number) => {
  const base = 10 ** (digits ?? 4);
  const rounded = Math.round(num * 100 * base) / base;
  const integerPart = Math.round(rounded);
  const integerDigits = integerPart.toString().length;
  const padLength = 3 - integerDigits;
  const pad = padLength > 0 ? [...new Array(padLength)].map(() => ' ').join('') : '';
  return `${pad}${rounded}%`;
};

const showLine = (line = 8) => {
  const lines = [...new Array(line)].map(() => '----').join(' ');
  console.log(`*${lines}*`)
}

const showData = (title: string, data: any, titleAreaLength: number) => {
  const padLength = titleAreaLength - title.length;
  const padTitle = [...new Array(padLength)].map(() => ' ').join('');
  console.log(`* ${padTitle}${title}: ${data}`);
};

main();