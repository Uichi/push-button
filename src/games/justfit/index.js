// Just Fit (Timing) game factory
(function () {
function createJustFitGame(root, options = {}) {
    const STATE_IDLE = 0;
    const STATE_PLAYING = 1;
    const STATE_ROUND_END = 2;
    const STATE_GAME_END = 3;

    const settings = {
        rounds: 3,
        baseSpeed: 1.5,
        speedIncrement: 0.5, // Speed up each round
        targetWidthPercent: 12, // Width of the target zone
        cursorWidthPercent: 4,  // Width of the moving cursor
        ...options,
    };

    let gameState = STATE_IDLE;
    let currentRound = 1;
    let p1Score = 0; // Total distance score (lower is better, or points logic)
    // Let's use Points: 100 for perfect, dropping as dist increases.
    let p1TotalPoints = 0;
    let p2TotalPoints = 0;

    let p1Stopped = false;
    let p2Stopped = false;
    let animationFrameId = null;
    
    // Movement state
    // Position is 0 to 100
    let cursorP1 = 50;
    let cursorP2 = 50;
    let directionP1 = 1; // 1 or -1
    let directionP2 = 1;
    let speed = settings.baseSpeed;

    const {
        container,
        overlay,
        startBtn,
        titleEl,
        p1Area,
        p2Area,
        p1Rail,
        p1Target,
        p1Cursor,
        p1Msg,
        p1ScoreEl,
        p2Rail,
        p2Target,
        p2Cursor,
        p2Msg,
        p2ScoreEl,
        roundEl
    } = buildDom(root);

    const onStart = () => startGame();
    const onP1Tap = (e) => { e.preventDefault(); handleStop('p1'); };
    const onP2Tap = (e) => { e.preventDefault(); handleStop('p2'); };

    startBtn.addEventListener('click', onStart);
    // Tap anywhere in player area to stop
    p1Area.addEventListener('pointerdown', onP1Tap);
    p2Area.addEventListener('pointerdown', onP2Tap);

    function buildDom(rootEl) {
        const containerEl = document.createElement('div');
        containerEl.className = 'justfit';

        const roundEl = document.createElement('div');
        roundEl.className = 'justfit-round';
        roundEl.innerText = 'ROUND 1';

        // Helper to build player area
        function createPlayerArea(id, labelText) {
            const el = document.createElement('div');
            el.id = id;
            el.className = 'justfit-player';
            
            const label = document.createElement('div');
            label.className = 'justfit-label';
            label.innerText = labelText;
            
            const scoreEl = document.createElement('div');
            scoreEl.className = 'justfit-score';
            scoreEl.innerText = '0 pts';

            const msgEl = document.createElement('div');
            msgEl.className = 'justfit-msg';
            
            const rail = document.createElement('div');
            rail.className = 'justfit-rail';
            
            const target = document.createElement('div');
            target.className = 'justfit-target';
            target.style.width = `${settings.targetWidthPercent}%`;
            target.style.left = '50%'; // Center target
            // target uses transform translate(-50%) in P2 context if needed via CSS?
            // Actually CSS handles centering.

            const cursor = document.createElement('div');
            cursor.className = 'justfit-cursor';
            cursor.style.width = `${settings.cursorWidthPercent}%`;
            
            rail.appendChild(target);
            rail.appendChild(cursor);
            
            el.appendChild(label);
            el.appendChild(scoreEl);
            el.appendChild(rail);
            el.appendChild(msgEl);

            return { el, rail, target, cursor, msgEl, scoreEl };
        }

        const p2Obj = createPlayerArea('justfit-p2', 'PLAYER 2');
        const p1Obj = createPlayerArea('justfit-p1', 'PLAYER 1');

        const overlayEl = document.createElement('div');
        overlayEl.id = 'justfit-overlay';
        overlayEl.className = 'justfit-overlay';

        const title = document.createElement('h1');
        title.className = 'justfit-title';
        title.innerText = 'JUST FIT';

        const startBtnEl = document.createElement('button');
        startBtnEl.className = 'justfit-start-btn';
        startBtnEl.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(startBtnEl);

        containerEl.appendChild(roundEl);
        containerEl.appendChild(p2Obj.el);
        containerEl.appendChild(p1Obj.el);
        containerEl.appendChild(overlayEl);

        rootEl.appendChild(containerEl);

        return {
            container: containerEl,
            overlay: overlayEl,
            startBtn: startBtnEl,
            titleEl: title,
            roundEl,
            p1Area: p1Obj.el,
            p2Area: p2Obj.el,
            p1Rail: p1Obj.rail,
            p1Target: p1Obj.target,
            p1Cursor: p1Obj.cursor,
            p1Msg: p1Obj.msgEl,
            p1ScoreEl: p1Obj.scoreEl,
            p2Rail: p2Obj.rail,
            p2Target: p2Obj.target,
            p2Cursor: p2Obj.cursor,
            p2Msg: p2Obj.msgEl,
            p2ScoreEl: p2Obj.scoreEl,
        };
    }

    function startGame() {
        p1TotalPoints = 0;
        p2TotalPoints = 0;
        currentRound = 1;
        speed = settings.baseSpeed;
        overlay.style.display = 'none';
        
        startRound();
    }

    function startRound() {
        gameState = STATE_PLAYING;
        p1Stopped = false;
        p2Stopped = false;
        
        // Initial positions (random start side)
        cursorP1 = Math.random() < 0.5 ? 0 : 100;
        cursorP2 = Math.random() < 0.5 ? 0 : 100;
        directionP1 = cursorP1 === 0 ? 1 : -1;
        directionP2 = cursorP2 === 0 ? 1 : -1;

        roundEl.innerText = `ROUND ${currentRound} / ${settings.rounds}`;
        roundEl.classList.add('visible');

        p1Msg.innerText = '';
        p2Msg.innerText = '';
        p1Msg.className = 'justfit-msg';
        p2Msg.className = 'justfit-msg';

        p1ScoreEl.innerText = `${p1TotalPoints} pts`;
        p2ScoreEl.innerText = `${p2TotalPoints} pts`;

        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
    }

    let lastTime = 0;
    function loop(time) {
        if (gameState !== STATE_PLAYING) return;
        animationFrameId = requestAnimationFrame(loop);

        const dt = time - lastTime;
        // Cap dt to avoid huge jumps
        if (dt > 100) { lastTime = time; return; }
        
        // Calculate movement factor based on time (60fps baseline)
        const timeScale = dt / 16.66;
        lastTime = time;

        if (!p1Stopped) {
            cursorP1 += speed * directionP1 * timeScale;
            if (cursorP1 >= 100) { cursorP1 = 100; directionP1 = -1; }
            if (cursorP1 <= 0) { cursorP1 = 0; directionP1 = 1; }
            p1Cursor.style.left = `${cursorP1}%`;
        }

        if (!p2Stopped) {
            cursorP2 += speed * directionP2 * timeScale;
            if (cursorP2 >= 100) { cursorP2 = 100; directionP2 = -1; }
            if (cursorP2 <= 0) { cursorP2 = 0; directionP2 = 1; }
            p2Cursor.style.left = `${cursorP2}%`;
        }
    }

    function handleStop(player) {
        if (gameState !== STATE_PLAYING) return;
        
        if (player === 'p1' && !p1Stopped) {
            p1Stopped = true;
            evaluateScore('p1', cursorP1);
        } else if (player === 'p2' && !p2Stopped) {
            p2Stopped = true;
            evaluateScore('p2', cursorP2);
        }

        if (p1Stopped && p2Stopped) {
            endRound();
        }
    }

    function evaluateScore(player, pos) {
        // Target center is 50.
        const dist = Math.abs(pos - 50);
        // Max dist is 50.
        // Tolerances:
        // Perfect: within 2% (dist <= 2)
        // Great: within 8%
        // Good: within 15%
        // Bad: > 15%
        
        let points = 0;
        let msg = '';
        let resultClass = '';

        if (dist <= 2.5) {
            points = 100;
            msg = 'PERFECT!';
            resultClass = 'justfit-perfect';
        } else if (dist <= 8) {
            points = 80 - Math.floor(dist * 2);
            msg = 'GREAT';
            resultClass = 'justfit-great';
        } else if (dist <= 20) {
            points = 50 - Math.floor(dist);
            msg = 'GOOD';
            resultClass = 'justfit-good';
        } else {
            points = 10;
            msg = 'MISS...';
            resultClass = 'justfit-miss';
        }

        if (player === 'p1') {
            p1TotalPoints += points;
            p1Msg.innerText = `${msg}\n+${points}`;
            p1Msg.classList.add(resultClass, 'visible');
            p1ScoreEl.innerText = `${p1TotalPoints} pts`;
        } else {
            p2TotalPoints += points;
            p2Msg.innerText = `${msg}\n+${points}`;
            p2Msg.classList.add(resultClass, 'visible');
            p2ScoreEl.innerText = `${p2TotalPoints} pts`;
        }
    }

    function endRound() {
        cancelAnimationFrame(animationFrameId);
        gameState = STATE_ROUND_END;
        
        setTimeout(() => {
            if (currentRound < settings.rounds) {
                currentRound++;
                speed += settings.speedIncrement;
                startRound();
            } else {
                endGame();
            }
        }, 2000);
    }

    function endGame() {
        gameState = STATE_GAME_END;
        
        let winner = null;
        if (p1TotalPoints > p2TotalPoints) winner = 'p1';
        else if (p2TotalPoints > p1TotalPoints) winner = 'p2';
        else winner = 'draw';

        if (settings.onResult) {
            settings.onResult({ winner, game: 'justfit', score: { p1: p1TotalPoints, p2: p2TotalPoints } });
        }

        setTimeout(() => {
            titleEl.innerText = winner === 'draw' ? 'DRAW!' : `${winner.toUpperCase()} WINS!`;
            startBtn.innerText = 'RETRY';
            overlay.style.display = 'flex';
        }, 1500);
    }

    function dispose() {
        if (root.contains(container)) {
            root.removeChild(container);
        }
        cancelAnimationFrame(animationFrameId);
        startBtn.removeEventListener('click', onStart);
    }

    return {
        start: () => {
             overlay.style.display = 'flex';
        },
        dispose,
        root: container,
    };
}

if (typeof window !== 'undefined') {
    window.createJustFitGame = createJustFitGame;
}
})();
