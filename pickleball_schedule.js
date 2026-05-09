// ピックルボールダブルス紅白対抗戦スケジュール生成
// 紅組: 1-8, 白組: 9-16
// 12試合、3コート、各試合で紅2人休み・白2人休み
// 全員9試合出場・3試合休み、同じ人と組むのは最大2回まで

const RED = [1,2,3,4,5,6,7,8];
const WHITE = [9,10,11,12,13,14,15,16];
const TOTAL_GAMES = 12;
const COURTS = 3;

// 休みスケジュール生成（均等分散）
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
      // 最後に休んだのが遠い方を優先（分散）
      return lastRest[a] - lastRest[b];
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

// 6人を3ペアに分ける（パートナー最大2回制約付き）
function assignPartners(players, partnerCounts) {
  let pairs = [];
  let used = new Set();

  function backtrack(startIdx) {
    if (pairs.length === 3) return true;

    // 未使用の最初のプレイヤーを探す
    let a = -1;
    for (let i = startIdx; i < players.length; i++) {
      if (!used.has(players[i])) {
        a = players[i];
        break;
      }
    }
    if (a === -1) return false;

    used.add(a);

    // パートナー候補をパートナー回数が少ない順にソート
    let candidates = players.filter(p => !used.has(p));
    candidates.sort((x, y) => partnerCounts[a][x] - partnerCounts[a][y]);

    for (let b of candidates) {
      if (partnerCounts[a][b] >= 2) continue; // 最大2回制約

      pairs.push([a, b]);
      used.add(b);

      if (backtrack(0)) return true;

      pairs.pop();
      used.delete(b);
    }

    used.delete(a);
    return false;
  }

  if (backtrack(0)) return pairs;
  return null;
}

// メイン処理
let redRestSchedule = generateRestSchedule(RED, TOTAL_GAMES, 2);
let whiteRestSchedule = generateRestSchedule(WHITE, TOTAL_GAMES, 2);

// パートナーカウント初期化
let globalPartnerCount = {};
for (let p of [...RED, ...WHITE]) {
  globalPartnerCount[p] = {};
  for (let q of [...RED, ...WHITE]) {
    globalPartnerCount[p][q] = 0;
  }
}

let allPairs = [];
let success = true;

for (let g = 0; g < TOTAL_GAMES; g++) {
  let redPlaying = RED.filter(p => !redRestSchedule[g].includes(p));
  let whitePlaying = WHITE.filter(p => !whiteRestSchedule[g].includes(p));

  let redPairs = assignPartners(redPlaying, globalPartnerCount);
  let whitePairs = assignPartners(whitePlaying, globalPartnerCount);

  if (!redPairs || !whitePairs) {
    console.log('試合' + (g+1) + 'でパートナー割り当て失敗！');
    success = false;
    break;
  }

  // パートナーカウント更新
  for (let [a, b] of [...redPairs, ...whitePairs]) {
    globalPartnerCount[a][b]++;
    globalPartnerCount[b][a]++;
  }

  allPairs.push({redPairs, whitePairs});
}

if (success) {
  console.log('=== ピックルボールダブルス紅白対抗戦 スケジュール ===');
  console.log('');
  console.log('【凡例】紅組=1〜8番、白組=9〜16番');
  console.log('');

  for (let g = 0; g < TOTAL_GAMES; g++) {
    let {redPairs, whitePairs} = allPairs[g];
    console.log('【試合' + (g+1) + '】  休み: 紅' + redRestSchedule[g].join('・') + '番、白' + whiteRestSchedule[g].join('・') + '番');
    for (let c = 0; c < COURTS; c++) {
      let rp = redPairs[c];
      let wp = whitePairs[c];
      console.log('  コート' + (c+1) + ': 紅[' + rp[0] + '・' + rp[1] + '] vs 白[' + wp[0] + '・' + wp[1] + ']');
    }
    console.log('');
  }

  // 検証
  console.log('=== 検証 ===');
  console.log('');

  // 出場回数確認
  let playCounts = {};
  for (let p of [...RED, ...WHITE]) playCounts[p] = 0;
  for (let g = 0; g < TOTAL_GAMES; g++) {
    let redPlaying = RED.filter(p => !redRestSchedule[g].includes(p));
    let whitePlaying = WHITE.filter(p => !whiteRestSchedule[g].includes(p));
    for (let p of [...redPlaying, ...whitePlaying]) playCounts[p]++;
  }

  console.log('【出場回数】');
  let allCorrect = true;
  for (let p of RED) {
    let ok = playCounts[p] === 9;
    if (!ok) allCorrect = false;
    console.log('  紅' + p + '番: ' + playCounts[p] + '試合' + (ok ? ' ✓' : ' ✗'));
  }
  for (let p of WHITE) {
    let ok = playCounts[p] === 9;
    if (!ok) allCorrect = false;
    console.log('  白' + p + '番: ' + playCounts[p] + '試合' + (ok ? ' ✓' : ' ✗'));
  }
  console.log('  全員9試合出場: ' + (allCorrect ? '✓ OK' : '✗ NG'));
  console.log('');

  // 休み分散確認
  console.log('【休み分散（各人の休み試合番号）】');
  for (let p of RED) {
    let rests = [];
    for (let g = 0; g < TOTAL_GAMES; g++) {
      if (redRestSchedule[g].includes(p)) rests.push(g+1);
    }
    console.log('  紅' + p + '番: 試合' + rests.join('・') + '番で休み');
  }
  for (let p of WHITE) {
    let rests = [];
    for (let g = 0; g < TOTAL_GAMES; g++) {
      if (whiteRestSchedule[g].includes(p)) rests.push(g+1);
    }
    console.log('  白' + p + '番: 試合' + rests.join('・') + '番で休み');
  }
  console.log('');

  // パートナー回数確認
  console.log('【パートナー回数（同じ人と組んだ回数）】');
  let maxPartner = 0;
  let violationFound = false;
  for (let p of RED) {
    let partners = [];
    for (let q of RED) {
      if (q !== p && globalPartnerCount[p][q] > 0) {
        partners.push(q + '番:' + globalPartnerCount[p][q] + '回');
        if (globalPartnerCount[p][q] > 2) violationFound = true;
        maxPartner = Math.max(maxPartner, globalPartnerCount[p][q]);
      }
    }
    console.log('  紅' + p + '番のパートナー: ' + partners.join(', '));
  }
  for (let p of WHITE) {
    let partners = [];
    for (let q of WHITE) {
      if (q !== p && globalPartnerCount[p][q] > 0) {
        partners.push(q + '番:' + globalPartnerCount[p][q] + '回');
        if (globalPartnerCount[p][q] > 2) violationFound = true;
        maxPartner = Math.max(maxPartner, globalPartnerCount[p][q]);
      }
    }
    console.log('  白' + p + '番のパートナー: ' + partners.join(', '));
  }
  console.log('');
  console.log('  最大パートナー回数: ' + maxPartner + '回');
  console.log('  最大2回制約: ' + (violationFound ? '✗ 違反あり' : '✓ OK'));
  console.log('');
  console.log('=== スケジュール生成: 成功！ ===');
}
