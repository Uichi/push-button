// DOM要素の取得
const p1Area = document.getElementById('p1');
const p2Area = document.getElementById('p2');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');

// ゲームの状態管理定数
const STATE_IDLE = 0;    // 開始前
const STATE_WAITING = 1; // 色が変わるのを待っている（フライング判定期間）
const STATE_GO = 2;      // 押して良い状態
const STATE_ENDED = 3;   // 勝負あり

let gameState = STATE_IDLE;
let timerId = null;

// ゲーム開始処理
function startGame() {
    gameState = STATE_WAITING;
    overlay.style.display = 'none';
    
    // 画面初期化（赤色：待機）
    p1Area.className = 'player-area ready';
    p2Area.className = 'player-area ready';
    p1Area.innerText = "WAIT...";
    p2Area.innerText = "WAIT...";

    // 2秒〜6秒のランダムな遅延を設定
    const randomDelay = Math.floor(Math.random() * 4000) + 2000;

    timerId = setTimeout(() => {
        if (gameState === STATE_WAITING) {
            gameState = STATE_GO;
            triggerSignal();
        }
    }, randomDelay);
}

// GOサイン（色が緑に変わる）
function triggerSignal() {
    p1Area.className = 'player-area go';
    p2Area.className = 'player-area go';
    p1Area.innerText = "TAP!";
    p2Area.innerText = "TAP!";
}

// タップ処理
function handleTap(player) {
    if (gameState === STATE_ENDED) return;

    const opponent = (player === 'p1') ? 'p2' : 'p1';

    if (gameState === STATE_WAITING) {
        // フライング（お手つき）
        clearTimeout(timerId); // タイマー解除
        endGame(opponent, "WIN!", player, "FOUL!");
    } else if (gameState === STATE_GO) {
        // 正常な勝利
        endGame(player, "WINNER!", opponent, "LOSE...");
    }
}

// 勝利判定後の処理
function endGame(winnerId, winMsg, loserId, loseMsg) {
    gameState = STATE_ENDED;
    
    const winnerEl = document.getElementById(winnerId);
    const loserEl = document.getElementById(loserId);

    winnerEl.className = 'player-area win';
    winnerEl.innerText = winMsg;
    
    loserEl.className = 'player-area lose';
    loserEl.innerText = loseMsg;

    // 2秒後にリトライ可能にするオーバーレイを表示
    setTimeout(() => {
        startBtn.innerText = "RETRY";
        overlay.style.display = 'flex';
        gameState = STATE_IDLE;
    }, 2000);
}

// イベントリスナー設定
startBtn.addEventListener('click', startGame);

p1Area.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // デフォルト動作防止
    handleTap('p1');
});

p2Area.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleTap('p2');
});