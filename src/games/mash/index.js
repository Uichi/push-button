// Tap Rush (Button Mashing) game factory
(function () {
function createMashGame(root, options = {}) {
    const STATE_IDLE = 0;
    const STATE_COUNTDOWN = 1;
    const STATE_ACTIVE = 2;
    const STATE_ENDED = 3;

    const settings = {
        durationMs: 5000, // 5 seconds
        countdownSec: 3,
        onResult: null,
        ...options,
    };

    let gameState = STATE_IDLE;
    let p1Score = 0;
    let p2Score = 0;
    let timerInterval = null;
    let remainingMs = 0;

    const {
        container,
        overlay,
        startBtn,
        titleEl,
        timerEl,
        p1Area,
        p2Area,
        p1Btn,
        p2Btn,
        p1Count,
        p2Count,
        p1Bar,
        p2Bar
    } = buildDom(root);

    const onStart = () => startCountdown();
    const onP1Tap = (e) => { e.preventDefault(); handleTap('p1'); };
    const onP2Tap = (e) => { e.preventDefault(); handleTap('p2'); };

    startBtn.addEventListener('click', onStart);
    p1Btn.addEventListener('pointerdown', onP1Tap);
    p2Btn.addEventListener('pointerdown', onP2Tap);

    // Disable context menu for button mash
    container.addEventListener('contextmenu', e => e.preventDefault());

    function buildDom(rootEl) {
        const containerEl = document.createElement('div');
        containerEl.className = 'mash';

        const timerEl = document.createElement('div');
        timerEl.className = 'mash-timer';
        timerEl.innerText = (settings.durationMs / 1000).toFixed(1);

        // Player 2 (Top)
        const p2El = document.createElement('div');
        p2El.id = 'mash-p2';
        p2El.className = 'mash-player';

        const p2Info = document.createElement('div');
        p2Info.className = 'mash-info';
        const p2Label = document.createElement('div');
        p2Label.className = 'mash-label';
        p2Label.innerText = 'PLAYER 2';
        const p2Count = document.createElement('div');
        p2Count.className = 'mash-count';
        p2Count.innerText = '0';
        p2Info.appendChild(p2Label);
        p2Info.appendChild(p2Count);

        const p2BarContainer = document.createElement('div');
        p2BarContainer.className = 'mash-bar-container';
        const p2Bar = document.createElement('div');
        p2Bar.className = 'mash-bar';
        p2BarContainer.appendChild(p2Bar);

        const p2Btn = document.createElement('button');
        p2Btn.className = 'mash-btn';
        p2Btn.innerText = 'TAP!';
        p2Btn.disabled = true;

        p2El.appendChild(p2Info);
        p2El.appendChild(p2BarContainer);
        p2El.appendChild(p2Btn);

        // Player 1 (Bottom)
        const p1El = document.createElement('div');
        p1El.id = 'mash-p1';
        p1El.className = 'mash-player';

        const p1Info = document.createElement('div');
        p1Info.className = 'mash-info';
        const p1Label = document.createElement('div');
        p1Label.className = 'mash-label';
        p1Label.innerText = 'PLAYER 1';
        const p1Count = document.createElement('div');
        p1Count.className = 'mash-count';
        p1Count.innerText = '0';
        p1Info.appendChild(p1Label);
        p1Info.appendChild(p1Count);

        const p1BarContainer = document.createElement('div');
        p1BarContainer.className = 'mash-bar-container';
        const p1Bar = document.createElement('div');
        p1Bar.className = 'mash-bar';
        p1BarContainer.appendChild(p1Bar);

        const p1Btn = document.createElement('button');
        p1Btn.className = 'mash-btn';
        p1Btn.innerText = 'TAP!';
        p1Btn.disabled = true;

        p1El.appendChild(p1Btn);
        p1El.appendChild(p1BarContainer);
        p1El.appendChild(p1Info);

        const overlayEl = document.createElement('div');
        overlayEl.id = 'mash-overlay';
        overlayEl.className = 'mash-overlay';

        const title = document.createElement('h1');
        title.className = 'mash-title';
        title.innerText = 'TAP RUSH';

        const startBtnEl = document.createElement('button');
        startBtnEl.className = 'mash-start-btn';
        startBtnEl.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(startBtnEl);

        containerEl.appendChild(timerEl);
        containerEl.appendChild(p2El);
        containerEl.appendChild(p1El);
        containerEl.appendChild(overlayEl);

        rootEl.appendChild(containerEl);

        return {
            container: containerEl,
            overlay: overlayEl,
            startBtn: startBtnEl,
            titleEl: title,
            timerEl,
            p1Area: p1El,
            p2Area: p2El,
            p1Btn,
            p2Btn,
            p1Count,
            p2Count,
            p1Bar,
            p2Bar
        };
    }

    function startCountdown() {
        if (gameState !== STATE_IDLE && gameState !== STATE_ENDED) return;
        
        gameState = STATE_COUNTDOWN;
        overlay.style.display = 'none';
        p1Score = 0;
        p2Score = 0;
        updateDisplay();
        
        p1Area.className = 'mash-player';
        p2Area.className = 'mash-player';
        p1Bar.style.width = '0%';
        p2Bar.style.width = '0%';

        let count = settings.countdownSec;
        timerEl.innerText = count;
        timerEl.classList.add('visible');

        const cdInterval = setInterval(() => {
            count--;
            if (count > 0) {
                timerEl.innerText = count;
            } else {
                clearInterval(cdInterval);
                timerEl.innerText = 'GO!';
                setTimeout(startGame, 500);
            }
        }, 1000);
    }

    function startGame() {
        gameState = STATE_ACTIVE;
        remainingMs = settings.durationMs;
        p1Btn.disabled = false;
        p2Btn.disabled = false;
        
        // Timer loop
        const startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            remainingMs = Math.max(0, settings.durationMs - elapsed);
            timerEl.innerText = (remainingMs / 1000).toFixed(1);
            
            if (remainingMs <= 0) {
                endGame();
            }
        }, 50);
    }

    function handleTap(player) {
        if (gameState !== STATE_ACTIVE) return;
        
        if (player === 'p1') {
            p1Score++;
            // Button animation class reset
            p1Btn.classList.remove('mash-active');
            void p1Btn.offsetWidth; // trigger reflow
            p1Btn.classList.add('mash-active');
        } else {
            p2Score++;
            p2Btn.classList.remove('mash-active');
            void p2Btn.offsetWidth;
            p2Btn.classList.add('mash-active');
        }
        
        updateDisplay();
    }

    function updateDisplay() {
        p1Count.innerText = p1Score;
        p2Count.innerText = p2Score;
        
        // Simple visualization: assume max reasonable taps is ~60 in 5 sec (12 taps/sec)
        const maxExpected = 60; 
        const p1Pct = Math.min(100, (p1Score / maxExpected) * 100);
        const p2Pct = Math.min(100, (p2Score / maxExpected) * 100);
        
        p1Bar.style.width = `${p1Pct}%`;
        p2Bar.style.width = `${p2Pct}%`;
    }

    function endGame() {
        clearInterval(timerInterval);
        gameState = STATE_ENDED;
        p1Btn.disabled = true;
        p2Btn.disabled = true;
        timerEl.innerText = 'FINISH!';

        setTimeout(() => {
            let winner = null;
            if (p1Score > p2Score) {
                winner = 'p1';
                p1Area.classList.add('mash-win');
                p2Area.classList.add('mash-lose');
            } else if (p2Score > p1Score) {
                winner = 'p2';
                p2Area.classList.add('mash-win');
                p1Area.classList.add('mash-lose');
            } else {
                winner = 'draw';
                p1Area.classList.add('mash-draw');
                p2Area.classList.add('mash-draw');
            }

            if (settings.onResult) {
                settings.onResult({ winner, game: 'mash', score: { p1: p1Score, p2: p2Score } });
            }

            setTimeout(() => {
                overlay.style.display = 'flex';
                titleEl.innerText = winner === 'draw' ? 'DRAW!' : `${winner.toUpperCase()} WINS!`;
                startBtn.innerText = 'RETRY';
            }, 2000);
        }, 500);
    }

    function dispose() {
        if (root.contains(container)) {
            root.removeChild(container);
        }
        clearInterval(timerInterval);
        startBtn.removeEventListener('click', onStart);
    }

    return {
        start: () => {
             // Initial start setup if needed
             overlay.style.display = 'flex';
        },
        dispose,
        root: container,
    };
}

if (typeof window !== 'undefined') {
    window.createMashGame = createMashGame;
}
})();
