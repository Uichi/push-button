// Pattern Memory game factory
(function () {
function createMemoryGame(root, options = {}) {
    const STATE_IDLE = 0;
    const STATE_SHOW_PATTERN = 1;
    const STATE_WAITING_INPUT = 2;
    const STATE_ENDED = 3;

    const settings = {
        patternLength: 4,
        boxCount: 4,
        showDelayMs: 600,
        showDurationMs: 400,
        cooldownMs: 200,
        onResult: null,
        ...options,
    };

    let gameState = STATE_IDLE;
    let pattern = [];
    let p1Input = [];
    let p2Input = [];
    let isP1Done = false;
    let isP2Done = false;
    let startTime = 0;

    const {
        container,
        overlay,
        startBtn,
        titleEl,
        patternBoxes,
        p1Area,
        p2Area,
        p1Btns,
        p2Btns,
    } = buildDom(root);

    const onStart = () => startGame();
    startBtn.addEventListener('click', onStart);

    p1Btns.forEach((btn, idx) => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleInput('p1', idx);
        });
    });

    p2Btns.forEach((btn, idx) => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleInput('p2', idx);
        });
    });

    function buildDom(rootEl) {
        const containerEl = document.createElement('div');
        containerEl.className = 'memory';

        const patternContainer = document.createElement('div');
        patternContainer.className = 'memory-pattern-container';
        const patternBoxes = [];
        for (let i = 0; i < settings.boxCount; i++) {
            const box = document.createElement('div');
            box.className = 'memory-box';
            box.innerText = (i + 1);
            patternContainer.appendChild(box);
            patternBoxes.push(box);
        }

        const p2El = document.createElement('div');
        p2El.id = 'memory-p2';
        p2El.className = 'memory-player';

        const p2Label = document.createElement('div');
        p2Label.className = 'memory-label';
        p2Label.innerText = 'PLAYER 2';
        p2El.appendChild(p2Label);

        const p2BtnContainer = document.createElement('div');
        p2BtnContainer.className = 'memory-input-btns';
        const p2Btns = [];
        for (let i = 0; i < settings.boxCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'memory-btn memory-btn-p2';
            btn.innerText = (i + 1);
            p2BtnContainer.appendChild(btn);
            p2Btns.push(btn);
        }
        p2El.appendChild(p2BtnContainer);

        const p2Result = document.createElement('div');
        p2Result.className = 'memory-result';
        p2El.appendChild(p2Result);

        const p1El = document.createElement('div');
        p1El.id = 'memory-p1';
        p1El.className = 'memory-player';

        const p1Label = document.createElement('div');
        p1Label.className = 'memory-label';
        p1Label.innerText = 'PLAYER 1';
        p1El.appendChild(p1Label);

        const p1BtnContainer = document.createElement('div');
        p1BtnContainer.className = 'memory-input-btns';
        const p1Btns = [];
        for (let i = 0; i < settings.boxCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'memory-btn';
            btn.innerText = (i + 1);
            p1BtnContainer.appendChild(btn);
            p1Btns.push(btn);
        }
        p1El.appendChild(p1BtnContainer);

        const p1Result = document.createElement('div');
        p1Result.className = 'memory-result';
        p1El.appendChild(p1Result);

        const overlayEl = document.createElement('div');
        overlayEl.id = 'memory-overlay';
        overlayEl.className = 'memory-overlay';

        const title = document.createElement('h1');
        title.className = 'memory-title';
        title.innerText = 'PATTERN MEMORY';

        const startBtnEl = document.createElement('button');
        startBtnEl.className = 'memory-start-btn';
        startBtnEl.innerText = 'START';

        overlayEl.appendChild(title);
        overlayEl.appendChild(startBtnEl);

        containerEl.appendChild(overlayEl);
        containerEl.appendChild(p2El);
        containerEl.appendChild(patternContainer);
        containerEl.appendChild(p1El);

        rootEl.appendChild(containerEl);

        return {
            container: containerEl,
            overlay: overlayEl,
            startBtn: startBtnEl,
            titleEl: title,
            patternBoxes,
            p1Area: p1El,
            p2Area: p2El,
            p1Btns,
            p2Btns,
        };
    }

    function startGame() {
        overlay.style.display = 'none';
        gameState = STATE_SHOW_PATTERN;
        p1Input = [];
        p2Input = [];
        isP1Done = false;
        isP2Done = false;
        startTime = 0;

        p1Area.className = 'memory-player memory-ready';
        p2Area.className = 'memory-player memory-ready';
        p1Area.querySelector('.memory-result').innerText = '';
        p2Area.querySelector('.memory-result').innerText = '';

        disableButtons(true);
        generatePattern();
        showPattern();
    }

    function generatePattern() {
        pattern = [];
        for (let i = 0; i < settings.patternLength; i++) {
            pattern.push(Math.floor(Math.random() * settings.boxCount));
        }
    }

    async function showPattern() {
        for (let i = 0; i < pattern.length; i++) {
            await delay(settings.showDelayMs);
            const idx = pattern[i];
            patternBoxes[idx].classList.add('memory-box-active');
            await delay(settings.showDurationMs);
            patternBoxes[idx].classList.remove('memory-box-active');
        }
        await delay(300);
        gameState = STATE_WAITING_INPUT;
        startTime = Date.now();
        p1Area.className = 'memory-player memory-active';
        p2Area.className = 'memory-player memory-active';
        disableButtons(false);
    }

    function handleInput(player, boxIdx) {
        if (gameState !== STATE_WAITING_INPUT) return;
        if (player === 'p1' && isP1Done) return;
        if (player === 'p2' && isP2Done) return;

        const inputArray = player === 'p1' ? p1Input : p2Input;
        const btnArray = player === 'p1' ? p1Btns : p2Btns;

        inputArray.push(boxIdx);
        const stepIdx = inputArray.length - 1;

        // 押下エフェクト
        btnArray[boxIdx].classList.add('memory-btn-pressed');
        setTimeout(() => {
            btnArray[boxIdx].classList.remove('memory-btn-pressed');
        }, settings.cooldownMs);

        // 正誤判定
        if (inputArray[stepIdx] !== pattern[stepIdx]) {
            // 間違い
            if (player === 'p1') {
                isP1Done = true;
                p1Area.className = 'memory-player memory-lose';
                p1Area.querySelector('.memory-result').innerText = 'WRONG!';
            } else {
                isP2Done = true;
                p2Area.className = 'memory-player memory-lose';
                p2Area.querySelector('.memory-result').innerText = 'WRONG!';
            }
            checkEnd();
            return;
        }

        // 全部正解したか
        if (inputArray.length === pattern.length) {
            if (player === 'p1') {
                isP1Done = true;
                p1Area.className = 'memory-player memory-win';
                p1Area.querySelector('.memory-result').innerText = 'WIN!';
            } else {
                isP2Done = true;
                p2Area.className = 'memory-player memory-win';
                p2Area.querySelector('.memory-result').innerText = 'WIN!';
            }
            checkEnd();
        }
    }

    function checkEnd() {
        if (isP1Done && isP2Done) {
            endGame();
        } else if (isP1Done || isP2Done) {
            // 片方だけ終了した場合、もう片方が続行
            // 相手が間違えたら即勝ち
            const winner = isP1Done ? 'p2' : 'p1';
            const loser = isP1Done ? 'p1' : 'p2';
            // 相手が間違えている場合はすぐ終了
            if ((loser === 'p1' && p1Area.classList.contains('memory-lose')) ||
                (loser === 'p2' && p2Area.classList.contains('memory-lose'))) {
                endGame();
            }
        }
    }

    function endGame() {
        gameState = STATE_ENDED;
        disableButtons(true);

        setTimeout(() => {
            titleEl.innerText = 'TAP TO RETRY';
            overlay.style.display = 'flex';
        }, 1200);

        if (settings.onResult) {
            let winner = null;
            if (p1Area.classList.contains('memory-win') && !p2Area.classList.contains('memory-win')) {
                winner = 'p1';
            } else if (p2Area.classList.contains('memory-win') && !p1Area.classList.contains('memory-win')) {
                winner = 'p2';
            } else if (p1Area.classList.contains('memory-win') && p2Area.classList.contains('memory-win')) {
                // 両者正解の場合、タイミング比較（今回は同時扱い）
                winner = 'draw';
            }
            settings.onResult({ winner, game: 'memory' });
        }
    }

    function disableButtons(disabled) {
        p1Btns.forEach(btn => btn.disabled = disabled);
        p2Btns.forEach(btn => btn.disabled = disabled);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function dispose() {
        if (root.contains(container)) {
            root.removeChild(container);
        }
        startBtn.removeEventListener('click', onStart);
    }

    return {
        start: startGame,
        dispose,
        root: container,
    };
}

if (typeof window !== 'undefined') {
    window.createMemoryGame = createMemoryGame;
}
})();
