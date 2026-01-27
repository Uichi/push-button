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
    title.innerText = 'Mini Games';

    const cards = [
        {
            name: 'Reflex Battle',
            desc: '1台で対戦する早押しリフレックス',
            action: () => startReflex(gameEl, homeEl),
        },
        {
            name: 'Number Duel',
            desc: '数字の大小を即判定して早押し',
            action: () => startCompare(gameEl, homeEl),
        },
        {
            name: 'Pattern Memory',
            desc: '光った順番を記憶してタップ勝負',
            action: () => startMemory(gameEl, homeEl),
        },
    ];

    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'hub-cards';

    cards.forEach(({ name, desc, action }) => {
        const card = document.createElement('div');
        card.className = 'hub-card';

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

function initLauncher() {
    const homeEl = document.getElementById('home-root');
    const gameEl = document.getElementById('game-root');
    if (!homeEl || !gameEl) return;
    renderHome(homeEl, gameEl);
}

document.addEventListener('DOMContentLoaded', initLauncher);
// expose for debugging if needed
window.initLauncher = initLauncher;
