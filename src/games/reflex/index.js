// Reflex Battle game factory (IIFE to support file:// without modules)
(function () {
function createReflexGame(root, options = {}) {
    const STATE_IDLE = 0;    // 開始前
    const STATE_WAITING = 1; // 色が変わるのを待っている（フライング判定期間）
    const STATE_GO = 2;      // 押して良い状態
    const STATE_ENDED = 3;   // 勝負あり

    const settings = {
        delayMin: 2000,
        delayMax: 6000,
        cooldownMs: 300,
        tapEffectMs: 150,
        onResult: null, // (result) => void
        ...options,
    };

    let gameState = STATE_IDLE;
    let timerId = null;
    let isProcessing = false; // ダブルタップ防止フラグ
    let goTime = null; // GOサイン時刻を記録

    const {
        container,
        p1Area,
        p2Area,
        overlay,
        startBtn,
        titleEl,
    } = buildDom(root);

    const onStart = () => startGame();
    const onP1 = (e) => {
        e.preventDefault();
        handleTap('p1');
    };
    const onP2 = (e) => {
        e.preventDefault();
        handleTap('p2');
    };

    startBtn.addEventListener('click', onStart);
    p1Area.addEventListener('pointerdown', onP1);
    p2Area.addEventListener('pointerdown', onP2);

    function buildDom(rootEl) {
        const containerEl = document.createElement('div');
        containerEl.className = 'reflex';

        const p2El = document.createElement('div');
        p2El.id = 'reflex-p2';
        p2El.className = 'reflex-player';
        p2El.innerText = 'Player 2';

        const p1El = document.createElement('div');
        p1El.id = 'reflex-p1';
        p1El.className = 'reflex-player';
        p1El.innerText = 'Player 1';

        const overlayEl = document.createElement('div');
        overlayEl.id = 'reflex-overlay';
        overlayEl.className = 'reflex-overlay';

        const title = document.createElement('h1');
        title.className = 'reflex-title';
        title.innerText = 'REFLEX BATTLE';

        const btn = document.createElement('button');
        btn.id = 'reflex-start-btn';
        btn.className = 'reflex-start-btn';
        btn.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(btn);

        containerEl.appendChild(p2El);
        containerEl.appendChild(p1El);
        containerEl.appendChild(overlayEl);

        rootEl.innerHTML = '';
        rootEl.appendChild(containerEl);

        return {
            container: containerEl,
            p1Area: p1El,
            p2Area: p2El,
            overlay: overlayEl,
            startBtn: btn,
            titleEl: title,
        };
    }

    function pickDelay() {
        const span = settings.delayMax - settings.delayMin + 1;
        return settings.delayMin + Math.floor(Math.random() * span);
    }

    function resetUI() {
        gameState = STATE_IDLE;
        isProcessing = false;
        goTime = null;
        p1Area.className = 'reflex-player reflex-ready';
        p2Area.className = 'reflex-player reflex-ready';
        p1Area.innerText = 'WAIT...';
        p2Area.innerText = 'WAIT...';
        overlay.style.display = 'flex';
        startBtn.innerText = 'START';
        titleEl.innerText = 'REFLEX BATTLE';
    }

    // ゲーム開始処理
    function startGame() {
        gameState = STATE_WAITING;
        goTime = null;
        overlay.style.display = 'none';

        // 画面初期化（赤色：待機）
        p1Area.className = 'reflex-player reflex-ready';
        p2Area.className = 'reflex-player reflex-ready';
        p1Area.innerText = 'WAIT...';
        p2Area.innerText = 'WAIT...';

        timerId = setTimeout(() => {
            if (gameState === STATE_WAITING) {
                gameState = STATE_GO;
                triggerSignal();
            }
        }, pickDelay());
    }

    // GOサイン（色が緑に変わる）
    function triggerSignal() {
        goTime = Date.now(); // GO時刻を記録
        p1Area.className = 'reflex-player reflex-go';
        p2Area.className = 'reflex-player reflex-go';
        p1Area.innerText = 'TAP!';
        p2Area.innerText = 'TAP!';
    }

    // タップ処理
    function handleTap(player) {
        // クールダウン中または既に終了している場合は無視
        if (isProcessing || gameState === STATE_ENDED) return;

        isProcessing = true; // タップ処理開始

        // タップエフェクトを追加
        const tappedArea = player === 'p1' ? p1Area : p2Area;
        tappedArea.classList.add('reflex-tap-effect');
        setTimeout(() => {
            tappedArea.classList.remove('reflex-tap-effect');
        }, settings.tapEffectMs);

        const opponent = player === 'p1' ? 'p2' : 'p1';

        if (gameState === STATE_WAITING) {
            // フライング（お手つき）
            clearTimeout(timerId); // タイマー解除
            endGame(opponent, 'WIN!', player, 'FOUL!');
        } else if (gameState === STATE_GO) {
            // 正常な勝利
            endGame(player, 'WINNER!', opponent, 'LOSE...');
        }

        // クールダウン解除
        setTimeout(() => {
            isProcessing = false;
        }, settings.cooldownMs);
    }

    // 勝利判定後の処理
    function endGame(winnerId, winMsg, loserId, loseMsg) {
        gameState = STATE_ENDED;

        const winnerEl = winnerId === 'p1' ? p1Area : p2Area;
        const loserEl = loserId === 'p1' ? p1Area : p2Area;

        winnerEl.className = 'reflex-player reflex-win';
        loserEl.className = 'reflex-player reflex-lose';
        loserEl.innerText = loseMsg;

        // 反応速度を計算・表示（GO後のみ）
        const canShowReaction = goTime !== null && gameState === STATE_ENDED;
        const reactionMs = canShowReaction ? Date.now() - goTime : null;
        if (canShowReaction) {
            winnerEl.innerHTML = `${winMsg}<div class="reflex-reaction-time">${reactionMs}ms</div>`;
        } else {
            winnerEl.innerText = winMsg;
        }

        // ホストへの通知
        if (typeof settings.onResult === 'function') {
            settings.onResult({
                winner: winnerId,
                loser: loserId,
                foul: !canShowReaction, // フライング時は反応時間なし
                reactionMs,
            });
        }

        // 2秒後にリトライ可能にするオーバーレイを表示
        setTimeout(() => {
            startBtn.innerText = 'RETRY';
            overlay.style.display = 'flex';
            gameState = STATE_IDLE;
            isProcessing = false; // クールダウンもリセット
        }, 2000);
    }

    function dispose() {
        clearTimeout(timerId);
        startBtn.removeEventListener('click', onStart);
        p1Area.removeEventListener('pointerdown', onP1);
        p2Area.removeEventListener('pointerdown', onP2);
        root.innerHTML = '';
    }

    // 初期状態にセット
    resetUI();

    return {
        start: startGame,
        dispose,
        root: container,
    };
}

// expose globally for launcher (non-module)
window.createReflexGame = createReflexGame;
})();
