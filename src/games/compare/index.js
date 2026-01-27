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
        goalDelayMs: 600,
        maxScore: 3, // 3本先取（5本勝負）
        onResult: null,
        ...options,
    };

    let gameState = STATE_IDLE;
    let isProcessing = false;
    let numA = null;
    let numB = null;
    let goalIsBig = true;
    let p1Score = 0;
    let p2Score = 0;

    const {
        container,
        p1Area,
        p2Area,
        overlay,
        startBtn,
        titleEl,
        ruleAnnounce,
        goalEl,
        goalElBottom,
        p1Btns,
        p2Btns,
        p1ScoreEl,
        p2ScoreEl,
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

        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'compare-score-board';
        const p2ScoreEl = document.createElement('div');
        p2ScoreEl.id = 'compare-score-p2';
        p2ScoreEl.className = 'compare-score';
        p2ScoreEl.innerText = '0';
        const p1ScoreEl = document.createElement('div');
        p1ScoreEl.id = 'compare-score-p1';
        p1ScoreEl.className = 'compare-score';
        p1ScoreEl.innerText = '0';
        scoreBoard.appendChild(p2ScoreEl);
        scoreBoard.appendChild(p1ScoreEl);

        const p2El = document.createElement('div');
        p2El.id = 'compare-p2';
        p2El.className = 'compare-player';
        p2El.innerText = 'READY';

        const p2Btns = document.createElement('div');
        p2Btns.className = 'compare-choices compare-choices-p2';
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

        const ruleAnnounce = document.createElement('div');
        ruleAnnounce.className = 'compare-rule-announce';
        ruleAnnounce.innerText = 'FIRST TO 3 WINS!';

        const btn = document.createElement('button');
        btn.id = 'compare-start-btn';
        btn.className = 'compare-start-btn';
        btn.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(btn);

        containerEl.appendChild(goalEl);
        containerEl.appendChild(goalElBottom);
        containerEl.appendChild(scoreBoard);
        containerEl.appendChild(ruleAnnounce);
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
            ruleAnnounce,
            goalEl,
            goalElBottom,
            p1Btns: { a: p1A, b: p1B },
            p2Btns: { a: p2A, b: p2B },
            p1ScoreEl,
            p2ScoreEl,
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
        
        // Hide goal initially
        goalEl.classList.remove('visible');
        goalElBottom.classList.remove('visible');
        goalEl.innerText = '';
        goalElBottom.innerText = '';
        
        gameState = STATE_IDLE; // Wait for goal
        isProcessing = false; // Reset processing flag for new round
        disableButtons();

        p1Area.className = 'compare-player compare-active';
        p2Area.className = 'compare-player compare-active';
        p1Area.innerHTML = `<div class="compare-label">P1</div>`;
        p2Area.innerHTML = `<div class="compare-label">P2</div>`;
        // set button labels
        p1Btns.a.innerText = numA;
        p1Btns.b.innerText = numB;
        p2Btns.a.innerText = numA;
        p2Btns.b.innerText = numB;

        // Show goal after delay
        setTimeout(() => {
            goalIsBig = Math.random() < 0.5;
            const goalText = goalIsBig ? 'BIGGER WINS' : 'SMALLER WINS';
            goalEl.innerText = goalText;
            goalElBottom.innerText = goalText;
            
            goalEl.classList.add('visible');
            goalElBottom.classList.add('visible');
            
            gameState = STATE_ACTIVE;
            enableButtons();
        }, settings.goalDelayMs);
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
        gameState = STATE_IDLE;
        isProcessing = false;
        overlay.style.display = 'none';
        
        // Reset scores
        p1Score = 0;
        p2Score = 0;
        updateScoreBoard();

        // Show Rule Announce
        ruleAnnounce.classList.add('visible');
        
        // Hide rule and start game after delay
        setTimeout(() => {
            ruleAnnounce.classList.remove('visible');
            setTimeout(() => {
                rollNumbers();
            }, 300);
        }, 1500);
    }

    function updateScoreBoard(highlight) {
        p1ScoreEl.innerText = p1Score;
        p2ScoreEl.innerText = p2Score;
        p1ScoreEl.className = 'compare-score';
        p2ScoreEl.className = 'compare-score';
        if (highlight === 'p1') p1ScoreEl.classList.add('active');
        if (highlight === 'p2') p2ScoreEl.classList.add('active');
    }

    function handleChoice(player, choice) {
        if (isProcessing || gameState !== STATE_ACTIVE) return;
        isProcessing = true;
        gameState = STATE_IDLE; // Prevent multiple clicks

        const btns = player === 'p1' ? p1Btns : p2Btns;
        const tapped = choice === 'a' ? btns.a : btns.b;
        tapped.classList.add('compare-tap');
        setTimeout(() => tapped.classList.remove('compare-tap'), settings.tapEffectMs);

        const chosenVal = choice === 'a' ? numA : numB;
        const correctVal = goalIsBig ? Math.max(numA, numB) : Math.min(numA, numB);

        const isCorrect = chosenVal === correctVal;
        
        // Determine round winner
        let roundWinner = null;
        if (isCorrect) {
            roundWinner = player;
        } else {
            roundWinner = player === 'p1' ? 'p2' : 'p1';
        }

        if (roundWinner === 'p1') p1Score++;
        else p2Score++;

        updateScoreBoard(roundWinner);
        
        // Highlight round winner visually
        const p1Class = roundWinner === 'p1' ? 'compare-win' : 'compare-lose';
        const p2Class = roundWinner === 'p2' ? 'compare-win' : 'compare-lose';
        p1Area.className = `compare-player ${p1Class}`;
        p2Area.className = `compare-player ${p2Class}`;
        p1Area.innerHTML = `<div class="compare-result">${roundWinner==='p1'?'WIN':'LOSE'}</div>`;
        p2Area.innerHTML = `<div class="compare-result">${roundWinner==='p2'?'WIN':'LOSE'}</div>`;
        
        disableButtons();

        // Check Match Winner
        if (p1Score >= settings.maxScore || p2Score >= settings.maxScore) {
            const matchWinner = p1Score > p2Score ? 'p1' : 'p2';
            const matchLoser = matchWinner === 'p1' ? 'p2' : 'p1';
            endMatch(matchWinner, matchLoser);
        } else {
            // Next round
            setTimeout(() => {
                rollNumbers();
            }, 1500);
        }
    }

    function endMatch(winnerId, loserId) {
        gameState = STATE_ENDED;
        
        // Final display upgrade
        const winnerEl = winnerId === 'p1' ? p1Area : p2Area;
        const loserEl = loserId === 'p1' ? p1Area : p2Area;
        winnerEl.innerHTML = `${winnerId.toUpperCase()}<div class="compare-result">CHAMPION</div>`;
        
        if (typeof settings.onResult === 'function') {
            settings.onResult({ winner: winnerId, loser: loserId });
        }

        setTimeout(() => {
            titleEl.innerText = `${winnerId.toUpperCase()} WINS!`;
            startBtn.innerText = 'REPLAY MATCH';
            overlay.style.display = 'flex';
            gameState = STATE_IDLE;
        }, 2000);
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
