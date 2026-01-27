let currentGame = null;

function renderHome(homeEl, gameEl) {
    // reset game view
    if (gameEl) {
        gameEl.innerHTML = '';
        gameEl.style.display = 'none';
    }
    homeEl.style.display = 'block';

    homeEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'hub';

    const title = document.createElement('h1');
    title.className = 'hub-title';
    title.innerText = 'TAP Games';

    const cards = [
        {
            name: 'Reflex Battle',
            desc: '1台で対戦する早押しリフレックス',
            icon: '⚡',
            color: '#f59e0b',
            action: () => startReflex(gameEl, homeEl),
        },
        {
            name: 'Number Duel',
            desc: '数字の大小を即判定して早押し',
            icon: '🔢',
            color: '#3b82f6',
            action: () => startCompare(gameEl, homeEl),
        },
        {
            name: 'Pattern Memory',
            desc: '光った順番を記憶してタップ勝負',
            icon: '🧠',
            color: '#8b5cf6',
            action: () => startMemory(gameEl, homeEl),
        },
        {
            name: 'Tap Rush',
            desc: '5秒間の連打バトル！',
            icon: '🔥',
            color: '#ef4444',
            action: () => startMash(gameEl, homeEl),
        },
        {
            name: 'Just Fit',
            desc: 'タイミングよく止める！',
            icon: '🎯',
            color: '#10b981',
            action: () => startJustFit(gameEl, homeEl),
        },
    ];

    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'hub-cards';

    cards.forEach(({ name, desc, icon, color, action }) => {
        const card = document.createElement('div');
        card.className = 'hub-card';
        // Set accent color for hover/border effects
        card.style.setProperty('--card-accent', color);

        const iconEl = document.createElement('div');
        iconEl.className = 'hub-icon';
        iconEl.innerText = icon;

        const n = document.createElement('div');
        n.className = 'hub-name';
        n.innerText = name;

        const d = document.createElement('div');
        d.className = 'hub-desc';
        d.innerText = desc;

        const playBtn = document.createElement('button');
        playBtn.className = 'hub-play-btn';
        playBtn.innerText = 'PLAY';
        playBtn.addEventListener('click', action);

        card.appendChild(iconEl);
        card.appendChild(n);
        card.appendChild(d);
        card.appendChild(playBtn);

        cardsWrap.appendChild(card);
    });

    wrapper.appendChild(title);
    wrapper.appendChild(cardsWrap);

    homeEl.appendChild(wrapper);
}

function startReflex(gameEl, homeEl) {
    if (currentGame) {
        currentGame.dispose();
        currentGame = null;
    }

    homeEl.style.display = 'none';
    gameEl.style.display = 'block';
    gameEl.innerHTML = '';

    const back = document.createElement('button');
    back.className = 'hub-back-btn';
    back.innerText = 'HOME';

    const mount = document.createElement('div');
    mount.id = 'reflex-root';

    gameEl.appendChild(back);
    gameEl.appendChild(mount);

    const game = createReflexGame(mount);
    currentGame = game;
    game.start();

    back.addEventListener('click', () => {
        game.dispose();
        currentGame = null;
        renderHome(homeEl, gameEl);
    });
}

function startCompare(gameEl, homeEl) {
    if (currentGame) {
        currentGame.dispose();
        currentGame = null;
    }

    homeEl.style.display = 'none';
    gameEl.style.display = 'block';
    gameEl.innerHTML = '';

    const back = document.createElement('button');
    back.className = 'hub-back-btn';
    back.innerText = 'HOME';

    const mount = document.createElement('div');
    mount.id = 'compare-root';

    gameEl.appendChild(back);
    gameEl.appendChild(mount);

    const game = window.createCompareGame(mount);
    currentGame = game;
    game.start();

    back.addEventListener('click', () => {
        game.dispose();
        currentGame = null;
        renderHome(homeEl, gameEl);
    });
}

function startMemory(gameEl, homeEl) {
    if (currentGame) {
        currentGame.dispose();
        currentGame = null;
    }

    homeEl.style.display = 'none';
    gameEl.style.display = 'block';
    gameEl.innerHTML = '';

    const back = document.createElement('button');
    back.className = 'hub-back-btn';
    back.innerText = 'HOME';

    const mount = document.createElement('div');
    mount.id = 'memory-root';

    gameEl.appendChild(back);
    gameEl.appendChild(mount);

    const game = window.createMemoryGame(mount);
    currentGame = game;
    game.start();

    back.addEventListener('click', () => {
        game.dispose();
        currentGame = null;
        renderHome(homeEl, gameEl);
    });
}

function startMash(gameEl, homeEl) {
    if (currentGame) {
        currentGame.dispose();
        currentGame = null;
    }

    homeEl.style.display = 'none';
    gameEl.style.display = 'block';
    gameEl.innerHTML = '';

    const back = document.createElement('button');
    back.className = 'hub-back-btn';
    back.innerText = 'HOME';

    const mount = document.createElement('div');
    mount.id = 'mash-root';

    gameEl.appendChild(back);
    gameEl.appendChild(mount);

    const game = window.createMashGame(mount);
    currentGame = game;
    game.start();

    back.addEventListener('click', () => {
        game.dispose();
        currentGame = null;
        renderHome(homeEl, gameEl);
    });
}

function startJustFit(gameEl, homeEl) {
    if (currentGame) {
        currentGame.dispose();
        currentGame = null;
    }

    homeEl.style.display = 'none';
    gameEl.style.display = 'block';
    gameEl.innerHTML = '';

    const back = document.createElement('button');
    back.className = 'hub-back-btn';
    back.innerText = 'HOME';

    const mount = document.createElement('div');
    mount.id = 'justfit-root';

    gameEl.appendChild(back);
    gameEl.appendChild(mount);

    // Assuming window.createJustFitGame is available
    const game = window.createJustFitGame(mount);
    currentGame = game;
    game.start();

    back.addEventListener('click', () => {
        game.dispose();
        currentGame = null;
        renderHome(homeEl, gameEl);
    });
}

function initLauncher() {
    const homeEl = document.getElementById('home-root');
    const gameEl = document.getElementById('game-root');
    if (!homeEl || !gameEl) return;
    renderHome(homeEl, gameEl);
}

document.addEventListener('DOMContentLoaded', initLauncher);
// expose for debugging if needed
window.initLauncher = initLauncher;
