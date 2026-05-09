// ピックルボールダブルス紅白対抗戦スケジュール生成 v2
// 対戦相手（敵）もばらけさせる版
// 紅組: 1-8, 白組: 9-16
// 12試合、3コート、各試合で紅2人休み・白2人休み

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

  function backtrack() {
    if (pairs.length === 3) return true;

    let a = -1;
    for (let p of players) {
      if (!used.has(p)) { a = p; break; }
    }
    if (a === -1) return false;

    used.add(a);

    let candidates = players.filter(p => !used.has(p));
    candidates.sort((x, y) => partnerCounts[a][x] - partnerCounts[a][y]);

    for (let b of candidates) {
      if (partnerCounts[a][b] >= 2) continue;

      pairs.push([a, b]);
      used.add(b);

      if (backtrack()) return true;

      pairs.pop();
      used.delete(b);
    }

    used.delete(a);
    return false;
  }

  if (backtrack()) return pairs;
  return null;
}

// コートの対戦割り当て（紅ペア3組 vs 白ペア3組）
// 対戦相手もばらけさせる
function assignCourts(redPairs, whitePairs, opponentCount) {
  // 3つの紅ペアと3つの白ペアをマッチング
  // 対戦回数が少ない組み合わせを優先
  
  // 全順列を試して最良のマッチングを選ぶ
  const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  
  let bestPerm = null;
  let bestScore = Infinity;
  
  for (let perm of perms) {
    let score = 0;
    for (let i = 0; i < 3; i++) {
      let rp = redPairs[i];
      let wp = whitePairs[perm[i]];
      // 紅ペアの各メンバーと白ペアの各メンバーの対戦回数の合計
      for (let r of rp) {
        for (let w of wp) {
          score += opponentCount[r][w];
        }
      }
    }
    if (score < bestScore) {
      bestScore = score;
      bestPerm = perm;
    }
  }
  
  return bestPerm.map((wi, ri) => [redPairs[ri], whitePairs[wi]]);
}

// メイン処理
let redRestSchedule = generateRestSchedule(RED, TOTAL_GAMES, 2);
let whiteRestSchedule = generateRestSchedule(WHITE, TOTAL_GAMES, 2);

// パートナーカウント初期化
let globalPartnerCount = {};
// 対戦相手カウント初期化
let globalOpponentCount = {};

for (let p of [...RED, ...WHITE]) {
  globalPartnerCount[p] = {};
  globalOpponentCount[p] = {};
  for (let q of [...RED, ...WHITE]) {
    globalPartnerCount[p][q] = 0;
    globalOpponentCount[p][q] = 0;
  }
}

let allCourts = [];
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

  // コート対戦割り当て（対戦相手をばらけさせる）
  let courts = assignCourts(redPairs, whitePairs, globalOpponentCount);

  // パートナーカウント更新
  for (let [rp, wp] of courts) {
    globalPartnerCount[rp[0]][rp[1]]++;
    globalPartnerCount[rp[1]][rp[0]]++;
    globalPartnerCount[wp[0]][wp[1]]++;
    globalPartnerCount[wp[1]][wp[0]]++;
    
    // 対戦相手カウント更新
    for (let r of rp) {
      for (let w of wp) {
        globalOpponentCount[r][w]++;
        globalOpponentCount[w][r]++;
      }
    }
  }

  allCourts.push(courts);
}

if (success) {
  console.log('=== ピックルボールダブルス紅白対抗戦 スケジュール v2 ===');
  console.log('（対戦相手もばらけさせた版）');
  console.log('');
  console.log('【凡例】紅組=1〜8番、白組=9〜16番');
  console.log('');

  for (let g = 0; g < TOTAL_GAMES; g++) {
    let courts = allCourts[g];
    console.log('【試合' + (g+1) + '】  休み: 紅' + redRestSchedule[g].join('・') + '番、白' + whiteRestSchedule[g].join('・') + '番');
    for (let c = 0; c < COURTS; c++) {
      let [rp, wp] = courts[c];
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

  let allCorrect = true;
  for (let p of [...RED, ...WHITE]) {
    if (playCounts[p] !== 9) allCorrect = false;
  }
  console.log('全員9試合出場: ' + (allCorrect ? '✓ OK' : '✗ NG'));

  // パートナー回数確認
  let maxPartner = 0;
  let violationFound = false;
  for (let p of RED) {
    for (let q of RED) {
      if (q !== p) {
        if (globalPartnerCount[p][q] > 2) violationFound = true;
        maxPartner = Math.max(maxPartner, globalPartnerCount[p][q]);
      }
    }
  }
  for (let p of WHITE) {
    for (let q of WHITE) {
      if (q !== p) {
        if (globalPartnerCount[p][q] > 2) violationFound = true;
        maxPartner = Math.max(maxPartner, globalPartnerCount[p][q]);
      }
    }
  }
  console.log('最大パートナー回数: ' + maxPartner + '回');
  console.log('最大2回制約: ' + (violationFound ? '✗ 違反あり' : '✓ OK'));

  // 対戦相手回数確認
  console.log('');
  console.log('【対戦相手回数（紅vs白）】');
  let maxOpponent = 0;
  let minOpponent = 999;
  for (let r of RED) {
    let opponents = [];
    for (let w of WHITE) {
      opponents.push(w + '番:' + globalOpponentCount[r][w] + '回');
      maxOpponent = Math.max(maxOpponent, globalOpponentCount[r][w]);
      minOpponent = Math.min(minOpponent, globalOpponentCount[r][w]);
    }
    console.log('  紅' + r + '番の対戦相手: ' + opponents.join(', '));
  }
  console.log('');
  console.log('  最大対戦回数: ' + maxOpponent + '回');
  console.log('  最小対戦回数: ' + minOpponent + '回');
  console.log('');
  console.log('=== スケジュール生成: 成功！ ===');

  // JSON出力（Excel生成用）
  let jsonData = {
    schedule: [],
    restSchedule: { red: redRestSchedule, white: whiteRestSchedule }
  };
  for (let g = 0; g < TOTAL_GAMES; g++) {
    let courts = allCourts[g];
    jsonData.schedule.push({
      game: g+1,
      redRest: redRestSchedule[g],
      whiteRest: whiteRestSchedule[g],
      courts: courts.map(([rp, wp]) => ({ red: rp, white: wp }))
    });
  }
  console.log('');
  console.log('=== JSON DATA ===');
  console.log(JSON.stringify(jsonData, null, 2));
}
