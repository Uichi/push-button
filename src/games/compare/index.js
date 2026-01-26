// Number Duel (Big/Small) game factory
(function () {
function createCompareGame(root, options = {}) {
    const STATE_IDLE = 0;
    const STATE_ACTIVE = 1;
    const STATE_ENDED = 2;

    const settings = {
        min: 1,
        max: 99,
        cooldownMs: 300,
        tapEffectMs: 120,
        onResult: null,
        ...options,
    };

    let gameState = STATE_IDLE;
    let isProcessing = false;
    let numA = null;
    let numB = null;
    let goalIsBig = true;

    const {
        container,
        p1Area,
        p2Area,
        overlay,
        startBtn,
        titleEl,
        goalEl,
        goalElBottom,
        p1Btns,
        p2Btns,
    } = buildDom(root);

    const onStart = () => startGame();
    const onP1A = (e) => { e.preventDefault(); handleChoice('p1', 'a'); };
    const onP1B = (e) => { e.preventDefault(); handleChoice('p1', 'b'); };
    const onP2A = (e) => { e.preventDefault(); handleChoice('p2', 'a'); };
    const onP2B = (e) => { e.preventDefault(); handleChoice('p2', 'b'); };

    startBtn.addEventListener('click', onStart);
    p1Btns.a.addEventListener('pointerdown', onP1A);
    p1Btns.b.addEventListener('pointerdown', onP1B);
    p2Btns.a.addEventListener('pointerdown', onP2A);
    p2Btns.b.addEventListener('pointerdown', onP2B);

    function buildDom(rootEl) {
        const containerEl = document.createElement('div');
        containerEl.className = 'compare';

        const goalEl = document.createElement('div');
        goalEl.className = 'compare-goal';
        goalEl.innerText = 'BIGGER WINS';

        const goalElBottom = document.createElement('div');
        goalElBottom.className = 'compare-goal compare-goal-bottom';
        goalElBottom.innerText = 'BIGGER WINS';

        const p2El = document.createElement('div');
        p2El.id = 'compare-p2';
        p2El.className = 'compare-player';
        p2El.innerText = 'READY';

        const p2Btns = document.createElement('div');
        p2Btns.className = 'compare-choices';
        const p2A = document.createElement('button');
        p2A.className = 'compare-btn';
        p2A.classList.add('compare-btn-p2');
        p2A.innerText = '---';
        const p2B = document.createElement('button');
        p2B.className = 'compare-btn';
        p2B.classList.add('compare-btn-p2');
        p2B.innerText = '---';
        p2Btns.appendChild(p2A);
        p2Btns.appendChild(p2B);

        const p1El = document.createElement('div');
        p1El.id = 'compare-p1';
        p1El.className = 'compare-player';
        p1El.innerText = 'READY';

        const p1Btns = document.createElement('div');
        p1Btns.className = 'compare-choices';
        const p1A = document.createElement('button');
        p1A.className = 'compare-btn';
        p1A.innerText = '---';
        const p1B = document.createElement('button');
        p1B.className = 'compare-btn';
        p1B.innerText = '---';
        p1Btns.appendChild(p1A);
        p1Btns.appendChild(p1B);

        const overlayEl = document.createElement('div');
        overlayEl.id = 'compare-overlay';
        overlayEl.className = 'compare-overlay';

        const title = document.createElement('h1');
        title.className = 'compare-title';
        title.innerText = 'NUMBER DUEL';

        const btn = document.createElement('button');
        btn.id = 'compare-start-btn';
        btn.className = 'compare-start-btn';
        btn.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(btn);

        containerEl.appendChild(goalEl);
        containerEl.appendChild(goalElBottom);
        containerEl.appendChild(p2El);
        containerEl.appendChild(p2Btns);
        containerEl.appendChild(p1Btns);
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
            goalEl,
            goalElBottom,
            p1Btns: { a: p1A, b: p1B },
            p2Btns: { a: p2A, b: p2B },
        };
    }

    function randInt(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function rollNumbers() {
        do {
            numA = randInt(settings.min, settings.max);
            numB = randInt(settings.min, settings.max);
        } while (numA === numB);
        goalIsBig = Math.random() < 0.5;
        const goalText = goalIsBig ? 'BIGGER WINS' : 'SMALLER WINS';
        goalEl.innerText = goalText;
        goalElBottom.innerText = goalText;
        p1Area.className = 'compare-player compare-active';
        p2Area.className = 'compare-player compare-active';
        p1Area.innerHTML = `<div class="compare-label">P1</div>`;
        p2Area.innerHTML = `<div class="compare-label">P2</div>`;
        // set button labels
        p1Btns.a.innerText = numA;
        p1Btns.b.innerText = numB;
        p2Btns.a.innerText = numA;
        p2Btns.b.innerText = numB;
    }

    function enableButtons() {
        [p1Btns.a, p1Btns.b, p2Btns.a, p2Btns.b].forEach((b) => {
            b.disabled = false;
        });
    }

    function disableButtons() {
        [p1Btns.a, p1Btns.b, p2Btns.a, p2Btns.b].forEach((b) => {
            b.disabled = true;
        });
    }

    function startGame() {
        gameState = STATE_ACTIVE;
        isProcessing = false;
        overlay.style.display = 'none';
        rollNumbers();
        enableButtons();
    }

    function handleChoice(player, choice) {
        if (isProcessing || gameState !== STATE_ACTIVE) return;
        isProcessing = true;

        const btns = player === 'p1' ? p1Btns : p2Btns;
        const tapped = choice === 'a' ? btns.a : btns.b;
        tapped.classList.add('compare-tap');
        setTimeout(() => tapped.classList.remove('compare-tap'), settings.tapEffectMs);

        const opponent = player === 'p1' ? 'p2' : 'p1';
        const chosenVal = choice === 'a' ? numA : numB;
        const correctVal = goalIsBig ? Math.max(numA, numB) : Math.min(numA, numB);

        const isCorrect = chosenVal === correctVal;
        const winnerId = isCorrect ? player : opponent;
        const loserId = winnerId === 'p1' ? 'p2' : 'p1';

        endGame(winnerId, loserId, !isCorrect);
    }

    function endGame(winnerId, loserId, foul) {
        gameState = STATE_ENDED;
        disableButtons();
        const winnerEl = winnerId === 'p1' ? p1Area : p2Area;
        const loserEl = loserId === 'p1' ? p1Area : p2Area;

        winnerEl.className = 'compare-player compare-win';
        loserEl.className = 'compare-player compare-lose';
        winnerEl.innerHTML = `${winnerId.toUpperCase()}<div class="compare-result">WIN</div>`;
        loserEl.innerHTML = `${loserId.toUpperCase()}<div class="compare-result">LOSE</div>`;

        if (typeof settings.onResult === 'function') {
            settings.onResult({ winner: winnerId, loser: loserId, foul });
        }

        setTimeout(() => {
            startBtn.innerText = 'RETRY';
            overlay.style.display = 'flex';
            gameState = STATE_IDLE;
            isProcessing = false;
        }, 1500);
    }

    function dispose() {
        startBtn.removeEventListener('click', onStart);
        p1Btns.a.removeEventListener('pointerdown', onP1A);
        p1Btns.b.removeEventListener('pointerdown', onP1B);
        p2Btns.a.removeEventListener('pointerdown', onP2A);
        p2Btns.b.removeEventListener('pointerdown', onP2B);
        root.innerHTML = '';
    }

    // init
    p1Area.className = 'compare-player compare-ready';
    p2Area.className = 'compare-player compare-ready';
    disableButtons();

    return { start: startGame, dispose, root: container };
}

window.createCompareGame = createCompareGame;
})();
