#!/usr/bin/env node
// ============================================================
// ピックルボールダブルス 紅白対抗戦 スケジュール自動生成ツール
// ============================================================
// 使い方:
//   node pickleball_generator.js [紅組人数] [コート数] [試合数]
//
// 例:
//   node pickleball_generator.js 8 3 12   → 紅8人・白8人・3面・12試合（デフォルト）
//   node pickleball_generator.js 6 2 9    → 紅6人・白6人・2面・9試合
//   node pickleball_generator.js 10 4 15  → 紅10人・白10人・4面・15試合
//
// 制約:
//   - 紅組人数 = 白組人数（対称）
//   - コート数 < 紅組人数（休みが出るように）
//   - 全員が同じ試合数出場できるよう試合数を調整
// ============================================================

const fs = require('fs');

// ===== パラメータ取得 =====
const args = process.argv.slice(2);
const HALF = parseInt(args[0]) || 8;       // 片組の人数（紅=白）
const COURTS = parseInt(args[1]) || 3;     // コート数
const TOTAL_GAMES = parseInt(args[2]) || 12; // 試合数

const RED   = Array.from({length: HALF}, (_, i) => i + 1);
const WHITE = Array.from({length: HALF}, (_, i) => i + HALF + 1);
const TOTAL_PLAYERS = HALF * 2;

// ===== 事前検証 =====
console.log('=== パラメータ検証 ===');
console.log(`総人数: ${TOTAL_PLAYERS}人（紅組${HALF}人・白組${HALF}人）`);
console.log(`コート数: ${COURTS}面`);
console.log(`試合数: ${TOTAL_GAMES}試合`);
console.log('');

const playersPerGame = COURTS * 4;
const restPerGame = TOTAL_PLAYERS - playersPerGame;
const restPerSide = restPerGame / 2;

if (COURTS >= HALF) {
  console.error(`❌ エラー: コート数(${COURTS})は片組人数(${HALF})より少なくしてください`);
  process.exit(1);
}
if (restPerGame % 2 !== 0) {
  console.error(`❌ エラー: 1試合あたりの休み人数(${restPerGame})が奇数になります`);
  process.exit(1);
}
if (restPerSide !== Math.floor(restPerSide)) {
  console.error(`❌ エラー: 片組の休み人数が整数になりません`);
  process.exit(1);
}

const totalSlots = TOTAL_GAMES * playersPerGame;
const gamesPerPlayer = totalSlots / TOTAL_PLAYERS;
const restPerPlayer = TOTAL_GAMES - gamesPerPlayer;

if (!Number.isInteger(gamesPerPlayer)) {
  console.warn(`⚠️  警告: 1人あたりの出場数が整数になりません（${gamesPerPlayer.toFixed(2)}試合）`);
  console.warn(`   試合数を調整することをお勧めします`);
  // 最適な試合数を提案
  for (let t = TOTAL_GAMES - 5; t <= TOTAL_GAMES + 5; t++) {
    if (t > 0 && (t * playersPerGame) % TOTAL_PLAYERS === 0) {
      console.warn(`   → 試合数 ${t} なら全員 ${t * playersPerGame / TOTAL_PLAYERS} 試合出場になります`);
    }
  }
  console.warn('');
}

console.log(`1試合あたり出場: ${playersPerGame}人（各組${COURTS * 2}人）`);
console.log(`1試合あたり休み: ${restPerGame}人（各組${restPerSide}人）`);
console.log(`1人あたり出場数: ${gamesPerPlayer}試合`);
console.log(`1人あたり休み数: ${restPerPlayer}試合`);
console.log('');

// パートナー制約チェック
const maxPartnerNeeded = gamesPerPlayer;
const maxPartnerAvailable = (HALF - 1) * 2; // 最大2回×(同組人数-1)
if (maxPartnerNeeded > maxPartnerAvailable) {
  console.warn(`⚠️  警告: パートナー最大2回制約が厳しい可能性があります`);
  console.warn(`   必要パートナー回数: ${maxPartnerNeeded}回 > 最大可能: ${maxPartnerAvailable}回`);
}

// ===== 休みスケジュール生成 =====
function generateRestSchedule(players, totalGames, restPerGame) {
  let schedule = Array.from({length: totalGames}, () => []);
  let restCounts = {};
  let lastRest = {};
  for (let p of players) {
    restCounts[p] = 0;
    lastRest[p] = -999;
  }

  for (let game = 0; game < totalGames; game++) {
    let sorted = [...players].sort((a, b) => {
      if (restCounts[a] !== restCounts[b]) return restCounts[a] - restCounts[b];
      return lastRest[a] - lastRest[b]; // 最後に休んだのが古い方を優先
    });

    let resting = sorted.slice(0, restPerGame);
    schedule[game] = resting;
    for (let p of resting) {
      restCounts[p]++;
      lastRest[p] = game;
    }
  }

  return schedule;
}

// ===== パートナー割り当て（全パターン探索・最適解選択）=====
function assignPartners(players, partnerCounts) {
  const numCourts = players.length / 2;
  let bestPairs = null;
  let bestScore = Infinity;

  function backtrack(remaining, pairs) {
    if (remaining.length === 0) {
      let score = 0;
      let maxP = 0;
      for (let [a, b] of pairs) {
        score += partnerCounts[a][b];
        maxP = Math.max(maxP, partnerCounts[a][b]);
      }
      let combinedScore = maxP * 1000 + score;
      if (combinedScore < bestScore) {
        bestScore = combinedScore;
        bestPairs = pairs.map(p => [...p]);
      }
      return;
    }

    let a = remaining[0];
    let rest = remaining.slice(1);

    for (let i = 0; i < rest.length; i++) {
      let b = rest[i];
      if (partnerCounts[a][b] >= 2) continue;

      let newRest = rest.filter((_, idx) => idx !== i);
      backtrack(newRest, [...pairs, [a, b]]);
    }
  }

  backtrack(players, []);
  return bestPairs;
}

// ===== コート対戦割り当て（対戦相手分散）=====
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let rest = arr.filter((_, idx) => idx !== i);
    for (let perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

function assignCourts(redPairs, whitePairs, opponentCount) {
  const n = redPairs.length;
  const whiteIndices = Array.from({length: n}, (_, i) => i);
  const perms = permutations(whiteIndices);

  let bestPerm = null;
  let bestScore = Infinity;

  for (let perm of perms) {
    let score = 0;
    let maxOpp = 0;
    for (let i = 0; i < n; i++) {
      let rp = redPairs[i];
      let wp = whitePairs[perm[i]];
      for (let r of rp) {
        for (let w of wp) {
          score += opponentCount[r][w];
          maxOpp = Math.max(maxOpp, opponentCount[r][w]);
        }
      }
    }
    let combinedScore = maxOpp * 1000 + score;
    if (combinedScore < bestScore) {
      bestScore = combinedScore;
      bestPerm = perm;
    }
  }

  return bestPerm.map((wi, ri) => [redPairs[ri], whitePairs[wi]]);
}

// ===== メイン処理 =====
const redRestSchedule   = generateRestSchedule(RED,   TOTAL_GAMES, restPerSide);
const whiteRestSchedule = generateRestSchedule(WHITE, TOTAL_GAMES, restPerSide);

let globalPartnerCount  = {};
let globalOpponentCount = {};
for (let p of [...RED, ...WHITE]) {
  globalPartnerCount[p]  = {};
  globalOpponentCount[p] = {};
  for (let q of [...RED, ...WHITE]) {
    globalPartnerCount[p][q]  = 0;
    globalOpponentCount[p][q] = 0;
  }
}

let allCourts = [];
let success = true;

for (let g = 0; g < TOTAL_GAMES; g++) {
  let redPlaying   = RED.filter(p   => !redRestSchedule[g].includes(p));
  let whitePlaying = WHITE.filter(p => !whiteRestSchedule[g].includes(p));

  let redPairs   = assignPartners(redPlaying,   globalPartnerCount);
  let whitePairs = assignPartners(whitePlaying, globalPartnerCount);

  if (!redPairs || !whitePairs) {
    console.error(`❌ 試合${g+1}でパートナー割り当て失敗！`);
    success = false;
    break;
  }

  let courts = assignCourts(redPairs, whitePairs, globalOpponentCount);

  for (let [rp, wp] of courts) {
    globalPartnerCount[rp[0]][rp[1]]++;
    globalPartnerCount[rp[1]][rp[0]]++;
    globalPartnerCount[wp[0]][wp[1]]++;
    globalPartnerCount[wp[1]][wp[0]]++;
    for (let r of rp) {
      for (let w of wp) {
        globalOpponentCount[r][w]++;
        globalOpponentCount[w][r]++;
      }
    }
  }

  allCourts.push(courts);
}

if (!success) process.exit(1);

// ===== 結果出力 =====
console.log('=== スケジュール ===');
console.log('');
for (let g = 0; g < TOTAL_GAMES; g++) {
  let courts = allCourts[g];
  console.log(`【試合${g+1}】  休み: 紅${redRestSchedule[g].join('・')}番、白${whiteRestSchedule[g].join('・')}番`);
  for (let c = 0; c < COURTS; c++) {
    let [rp, wp] = courts[c];
    console.log(`  コート${c+1}: 紅[${rp.join('・')}] vs 白[${wp.join('・')}]`);
  }
  console.log('');
}

// ===== 検証 =====
console.log('=== 検証 ===');

// 出場回数
let playCounts = {};
for (let p of [...RED, ...WHITE]) playCounts[p] = 0;
for (let g = 0; g < TOTAL_GAMES; g++) {
  let rp = RED.filter(p   => !redRestSchedule[g].includes(p));
  let wp = WHITE.filter(p => !whiteRestSchedule[g].includes(p));
  for (let p of [...rp, ...wp]) playCounts[p]++;
}
let allCorrect = [...RED, ...WHITE].every(p => playCounts[p] === gamesPerPlayer);
console.log(`全員${gamesPerPlayer}試合出場: ${allCorrect ? '✓ OK' : '✗ NG'}`);

// パートナー回数
let maxPartner = 0;
let violation = false;
for (let p of [...RED, ...WHITE]) {
  for (let q of [...RED, ...WHITE]) {
    if (q !== p && globalPartnerCount[p][q] > 2) violation = true;
    maxPartner = Math.max(maxPartner, globalPartnerCount[p][q]);
  }
}
console.log(`最大パートナー回数: ${maxPartner}回`);
console.log(`最大2回制約: ${violation ? '✗ 違反あり' : '✓ OK'}`);

// 対戦相手回数
let maxOpp = 0, minOpp = 999;
for (let r of RED) {
  for (let w of WHITE) {
    maxOpp = Math.max(maxOpp, globalOpponentCount[r][w]);
    minOpp = Math.min(minOpp, globalOpponentCount[r][w]);
  }
}
console.log(`対戦相手回数: 最小${minOpp}回〜最大${maxOpp}回`);
console.log('');
console.log('✅ スケジュール生成完了！');

// ===== JSON保存 =====
const jsonData = {
  params: { half: HALF, courts: COURTS, totalGames: TOTAL_GAMES, gamesPerPlayer, restPerPlayer },
  schedule: allCourts.map((courts, g) => ({
    game: g + 1,
    redRest: redRestSchedule[g],
    whiteRest: whiteRestSchedule[g],
    courts: courts.map(([rp, wp]) => ({ red: rp, white: wp }))
  }))
};
fs.writeFileSync('/Users/yoshiki.nagatome/Claude/Doc/schedule_data.json', JSON.stringify(jsonData, null, 2));
console.log('JSONデータを schedule_data.json に保存しました');
