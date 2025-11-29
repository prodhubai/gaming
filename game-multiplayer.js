// Multiplayer-Enhanced Game Logic
// This file integrates both single-device and multiplayer modes

// Game State
const gameState = {
    mode: null, // 'single' or 'multiplayer'
    players: [],
    currentRound: 0,
    totalRounds: 5,
    gameMode: 'standard',
    currentTopic: null,
    submissions: [],
    votes: {
        funniest: {},
        onpoint: {},
        unexpected: {}
    },
    scores: {},
    roundHistory: [],
    activeTextarea: null
};

// Emoji collection
const EMOJIS = [
    '😂', '🤣', '😅', '😆', '😁', '😄', '😃', '😀', '🙃', '😉',
    '😎', '🤓', '🧐', '🤔', '🤨', '😏', '😬', '🙄', '😮', '😲',
    '🤯', '😱', '🤪', '🥳', '🤩', '😇', '🤠', '🥸', '🤡', '👻',
    '💀', '👽', '🤖', '💩', '😺', '😸', '😹', '🙀', '😻', '🐶',
    '🔥', '💯', '💪', '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '💫',
    '💥', '💢', '💨', '💬', '💭', '🗯️', '💤', '🎯', '🎪', '🎭',
    '🍕', '🍔', '🌮', '🍿', '🍩', '🎂', '🍰', '🍪', '☕', '🍺'
];

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, waiting for Firebase and multiplayer.js...');
    // Wait for Firebase and multiplayer.js to load
    setTimeout(() => {
        console.log('⏰ Timeout complete, initializing app...');
        console.log('📊 window.database:', window.database ? 'Available' : 'Not available');
        console.log('📊 window.createMultiplayerGame:', typeof window.createMultiplayerGame);
        console.log('📊 window.joinMultiplayerGame:', typeof window.joinMultiplayerGame);
        initializeApp();
    }, 500); // Increased timeout to ensure modules load
});

function initializeApp() {
    console.log('🎮 Initializing Friendly Fire...');
    console.log('Multiplayer functions available:', typeof window.createMultiplayerGame);
    
    // Mode selection
    const multiplayerBtn = document.getElementById('multiplayer-mode');
    const singleDeviceBtn = document.getElementById('single-device-mode');
    
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', () => {
            console.log('Multiplayer mode selected');
            gameState.mode = 'multiplayer';
            showScreen('multiplayer-setup');
        });
    }
    
    if (singleDeviceBtn) {
        singleDeviceBtn.addEventListener('click', () => {
            console.log('Single device mode selected');
            gameState.mode = 'single';
            showScreen('setup-screen');
            updatePlayerNameInputs();
        });
    }
    
    // Multiplayer setup
    const createBtn = document.getElementById('create-game');
    const joinBtn = document.getElementById('join-game');
    
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            console.log('🎮 Create Game button clicked!');
            createGame();
        });
        console.log('✅ Create game button listener attached');
    } else {
        console.error('❌ Create game button not found!');
    }
    
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            console.log('🔗 Join Game button clicked!');
            joinGame();
        });
        console.log('✅ Join game button listener attached');
    }
    
    document.getElementById('back-to-home')?.addEventListener('click', () => showScreen('home-screen'));
    
    // Lobby
    document.getElementById('start-multiplayer-game')?.addEventListener('click', startGameMultiplayer);
    document.getElementById('leave-lobby')?.addEventListener('click', leaveLobby);
    document.getElementById('copy-code')?.addEventListener('click', copyGameCode);
    document.getElementById('share-lobby-link')?.addEventListener('click', shareLobbyLink);
    
    // Single device setup
    document.getElementById('back-to-home-setup')?.addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('player-count')?.addEventListener('input', updatePlayerNameInputs);
    document.getElementById('start-game')?.addEventListener('click', startGame);
    
    // Game screens
    document.getElementById('continue-to-submit')?.addEventListener('click', showSubmitScreen);
    document.getElementById('submit-all')?.addEventListener('click', submitComments);
    document.getElementById('submit-votes')?.addEventListener('click', submitVotesHandler);
    document.getElementById('next-round')?.addEventListener('click', nextRound);
    document.getElementById('view-scoreboard')?.addEventListener('click', showScoreboard);
    document.getElementById('play-again')?.addEventListener('click', resetGame);
    
    // Initialize emoji picker
    initializeEmojiPicker();
}

// ============ MULTIPLAYER FUNCTIONS ============

// Make createGame globally accessible for onclick handler
window.createGameDirect = async function() {
    console.log('🔥 createGameDirect called from onclick');
    await createGame();
};

async function createGame() {
    console.log('🎯 createGame function called');
    const hostName = document.getElementById('host-name').value.trim();
    if (!hostName) {
        alert('Please enter your name');
        return;
    }
    
    console.log('Creating game for:', hostName);
    
    // Check if Firebase is ready
    if (!window.database) {
        alert('Firebase not initialized. Please refresh the page.');
        console.error('❌ Firebase database not available');
        return;
    }
    
    // Check if multiplayer functions are loaded
    if (typeof window.createMultiplayerGame !== 'function') {
        alert('Multiplayer module not loaded. Please refresh the page.');
        console.error('❌ window.createMultiplayerGame is not a function:', typeof window.createMultiplayerGame);
        return;
    }
    
    console.log('✅ All checks passed, creating multiplayer game...');
    
    try {
        const { gameCode, playerId } = await window.createMultiplayerGame(hostName);
        window.multiplayerState.isMultiplayer = true;
        console.log('✅ Game created:', gameCode);
        
        // Show lobby
        showLobby(gameCode);
        
        // Subscribe to game updates
        window.subscribeToGame(gameCode, handleGameUpdate);
        
    } catch (error) {
        console.error('❌ Error creating game:', error);
        alert('Failed to create game: ' + error.message);
    }
}

async function joinGame() {
    const gameCode = document.getElementById('game-code').value.trim().toUpperCase();
    const playerName = document.getElementById('player-name-join').value.trim();
    
    if (!gameCode || !playerName) {
        alert('Please enter game code and your name');
        return;
    }
    
    console.log('Joining game:', gameCode, 'as', playerName);
    
    // Check if Firebase is ready
    if (!window.database) {
        alert('Firebase not initialized. Please refresh the page.');
        console.error('Firebase database not available');
        return;
    }
    
    try {
        await window.joinMultiplayerGame(gameCode, playerName);
        window.multiplayerState.isMultiplayer = true;
        console.log('Joined game:', gameCode);
        
        // Show lobby
        showLobby(gameCode);
        
        // Subscribe to game updates
        window.subscribeToGame(gameCode, handleGameUpdate);
        
    } catch (error) {
        alert('Failed to join game: ' + error.message);
    }
}

function showLobby(gameCode) {
    showScreen('lobby-screen');
    document.getElementById('lobby-game-code').textContent = gameCode;
    
    // Only show settings to host
    if (!window.multiplayerState.isHost) {
        const settings = document.getElementById('lobby-settings');
        if (settings) {
            settings.style.display = 'none';
        }
    }
}

function handleGameUpdate(gameData) {
    const currentScreen = document.querySelector('.screen.active').id;
    
    // Update lobby
    if (currentScreen === 'lobby-screen') {
        updateLobbyPlayers(gameData.players);
        const playerCount = Object.keys(gameData.players).length;
        const startBtn = document.getElementById('start-multiplayer-game');
        if (playerCount >= 3) {
            startBtn.disabled = false;
            startBtn.textContent = `Start Game (${playerCount} players)`;
        }
    }
    
    // Game started
    if (gameData.status === 'playing' && currentScreen === 'lobby-screen') {
        // Initialize multiplayer game state
        gameState.totalRounds = gameData.settings.rounds;
        gameState.gameMode = gameData.settings.gameMode;
        gameState.players = Object.entries(gameData.players).map(([id, data]) => ({
            id,
            name: data.name
        }));
        
        // Show topic screen
        const round = gameData.rounds[gameData.currentRound];
        if (round) {
            displayTopic(round.topic, round.category, gameData.currentRound);
        }
    }
    
    // Handle round status changes
    if (gameData.status === 'playing' && gameData.currentRound > 0) {
        const round = gameData.rounds[gameData.currentRound];
        
        if (round.status === 'submitting' && currentScreen === 'topic-screen') {
            // Wait a bit before auto-advancing
        } else if (round.status === 'voting' && currentScreen === 'waiting-screen') {
            showVotingScreen(gameData);
        } else if (round.status === 'results' && currentScreen === 'waiting-screen') {
            showRoundResults(gameData);
        }
        
        // Check if we're waiting
        if (round.status === 'submitting' && currentScreen === 'submit-screen') {
            checkSubmissionStatus(gameData);
        } else if (round.status === 'voting' && currentScreen === 'voting-screen') {
            checkVotingStatus(gameData);
        }
    }
}

function updateLobbyPlayers(players) {
    const playersList = document.getElementById('players-list');
    const playerCount = document.getElementById('player-count-lobby');
    
    const count = Object.keys(players).length;
    playerCount.textContent = count;
    
    playersList.innerHTML = Object.entries(players).map(([id, player]) => {
        const isYou = id === window.multiplayerState.playerId;
        const hostBadge = player.isHost ? ' 👑' : '';
        const youBadge = isYou ? ' (you)' : '';
        const onlineStatus = player.online ? '🟢' : '🔴';
        return `<div class="player-item">${onlineStatus} ${player.name}${hostBadge}${youBadge}</div>`;
    }).join('');
}

async function startGameMultiplayer() {
    if (!window.multiplayerState.isHost) {
        alert('Only the host can start the game');
        return;
    }
    
    const rounds = parseInt(document.getElementById('lobby-rounds').value);
    const gameMode = document.getElementById('lobby-game-mode').value;
    
    await window.updateGameSettings(window.multiplayerState.gameCode, {
        rounds,
        gameMode
    });
    
    await window.startMultiplayerGame(window.multiplayerState.gameCode);
}

function leaveLobby() {
    if (confirm('Are you sure you want to leave?')) {
        window.leaveGame(window.multiplayerState.gameCode, window.multiplayerState.playerId);
        showScreen('home-screen');
    }
}

function copyGameCode() {
    const code = document.getElementById('lobby-game-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Game code copied!');
    });
}

function shareLobbyLink() {
    const code = window.multiplayerState.gameCode;
    const url = `${window.location.origin}${window.location.pathname}?game=${code}`;
    const text = `🔥 Join my Friendly Fire game!\nGame Code: ${code}\nOr click: ${url}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}

// Check URL for game code
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const gameCode = params.get('game');
    if (gameCode) {
        document.getElementById('game-code').value = gameCode;
        gameState.mode = 'multiplayer';
        showScreen('multiplayer-setup');
    }
});

async function checkSubmissionStatus(gameData) {
    const round = gameData.rounds[gameData.currentRound];
    const mySubmission = round.submissions?.[window.multiplayerState.playerId];
    
    if (mySubmission) {
        // Show waiting screen
        const submitted = Object.keys(round.submissions).length;
        const total = Object.keys(gameData.players).length;
        
        document.getElementById('submissions-count').textContent = submitted;
        document.getElementById('total-players').textContent = total;
        showScreen('waiting-screen');
        
        // Host checks if all submitted
        if (window.multiplayerState.isHost) {
            const allSubmitted = await window.checkAllSubmitted(
                window.multiplayerState.gameCode,
                gameData.currentRound
            );
            if (allSubmitted) {
                await window.moveToVoting(window.multiplayerState.gameCode, gameData.currentRound);
            }
        }
    }
}

async function checkVotingStatus(gameData) {
    const round = gameData.rounds[gameData.currentRound];
    const myVote = round.votes?.[window.multiplayerState.playerId];
    
    if (myVote) {
        // Show waiting screen
        const voted = Object.keys(round.votes).length;
        const total = Object.keys(gameData.players).length;
        
        document.getElementById('submissions-count').textContent = voted;
        document.getElementById('total-players').textContent = total;
        document.getElementById('waiting-message').textContent = 'Waiting for votes...';
        showScreen('waiting-screen');
        
        // Host calculates results
        if (window.multiplayerState.isHost) {
            const allVoted = await window.checkAllVoted(
                window.multiplayerState.gameCode,
                gameData.currentRound
            );
            if (allVoted) {
                await window.calculateRoundResults(
                    window.multiplayerState.gameCode,
                    gameData.currentRound
                );
            }
        }
    }
}

function showVotingScreen(gameData) {
    const round = gameData.rounds[gameData.currentRound];
    const submissions = round.submissions || {};
    
    gameState.currentRound = gameData.currentRound;
    gameState.totalRounds = gameData.settings.rounds;
    gameState.submissions = Object.entries(submissions).map(([playerId, sub]) => ({
        player: gameData.players[playerId].name,
        playerId: playerId,
        text: sub.text
    }));
    
    displayVoting();
}

function showRoundResults(gameData) {
    const round = gameData.rounds[gameData.currentRound];
    const results = round.results;
    
    gameState.currentRound = gameData.currentRound;
    gameState.scores = gameData.scores;
    
    const submissions = round.submissions || {};
    gameState.submissions = Object.entries(submissions).map(([playerId, sub]) => ({
        player: gameData.players[playerId].name,
        playerId: playerId,
        text: sub.text
    }));
    
    displayResults(results, round.topic, gameData);
}

// ============ SINGLE DEVICE FUNCTIONS ============

function updatePlayerNameInputs() {
    const count = parseInt(document.getElementById('player-count').value);
    const container = document.getElementById('player-names-inputs');
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i} Name`;
        input.className = 'player-name-input';
        input.id = `player-name-${i}`;
        container.appendChild(input);
    }
}

function startGame() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    const players = [];
    
    for (let i = 1; i <= playerCount; i++) {
        const nameInput = document.getElementById(`player-name-${i}`);
        const name = nameInput.value.trim() || `Player ${i}`;
        players.push({ name, id: `player${i}` });
    }
    
    gameState.players = players;
    gameState.totalRounds = parseInt(document.getElementById('round-count').value);
    gameState.gameMode = document.getElementById('game-mode').value;
    gameState.currentRound = 1;
    gameState.scores = {};
    players.forEach(p => gameState.scores[p.id] = 0);
    
    startRound();
}

function startRound() {
    const allTopics = Object.values(TOPICS).flat();
    const topic = allTopics[Math.floor(Math.random() * allTopics.length)];
    gameState.currentTopic = topic;
    
    displayTopic(topic.text, topic.category, gameState.currentRound);
}

function displayTopic(topicText, category, roundNum) {
    document.getElementById('topic-text').textContent = topicText;
    document.querySelectorAll('.topic-category').forEach(el => {
        el.textContent = `Category: ${category}`;
    });
    document.querySelectorAll('.round-number, #current-round').forEach(el => {
        el.textContent = roundNum;
    });
    document.querySelectorAll('.total-rounds, #total-rounds').forEach(el => {
        el.textContent = gameState.totalRounds;
    });
    
    showScreen('topic-screen');
}

function showSubmitScreen() {
    const container = document.getElementById('player-submissions');
    
    if (window.multiplayerState.isMultiplayer) {
        // Multiplayer: show only one submission box
        container.innerHTML = `
            <div class="submission-form">
                <label>Your Roast:</label>
                <textarea id="submission-1" placeholder="Enter your witty comment..." rows="4"></textarea>
            </div>
        `;
    } else {
        // Single device: show all player submission boxes
        container.innerHTML = gameState.players.map((player, index) => `
            <div class="submission-form">
                <label>${player.name}'s Roast:</label>
                <textarea id="submission-${index + 1}" data-player="${player.id}" placeholder="Enter ${player.name}'s witty comment..." rows="4"></textarea>
            </div>
        `).join('');
    }
    
    document.getElementById('topic-reminder').textContent = gameState.currentTopic?.text || window.multiplayerState.currentGame?.rounds[window.multiplayerState.currentGame.currentRound]?.topic;
    showScreen('submit-screen');
}

async function submitComments() {
    if (window.multiplayerState.isMultiplayer) {
        // Multiplayer submission
        const comment = document.getElementById('submission-1').value.trim();
        if (!comment) {
            alert('Please enter a comment');
            return;
        }
        
        await window.submitComment(
            window.multiplayerState.gameCode,
            window.multiplayerState.currentGame.currentRound,
            comment
        );
        
        // Will auto-advance via handleGameUpdate
    } else {
        // Single device submission
        gameState.submissions = [];
        
        gameState.players.forEach((player, index) => {
            const textarea = document.getElementById(`submission-${index + 1}`);
            const text = textarea.value.trim();
            if (text) {
                gameState.submissions.push({
                    player: player.name,
                    playerId: player.id,
                    text: text
                });
            }
        });
        
        if (gameState.submissions.length === 0) {
            alert('Please enter at least one comment!');
            return;
        }
        
        displayVoting();
    }
}

function displayVoting() {
    const categories = ['funniest', 'onpoint', 'unexpected'];
    const containers = {
        funniest: document.getElementById('funniest-votes'),
        onpoint: document.getElementById('onpoint-votes'),
        unexpected: document.getElementById('unexpected-votes')
    };
    
    categories.forEach(category => {
        containers[category].innerHTML = gameState.submissions.map((sub, index) => `
            <div class="vote-option">
                <input type="radio" name="${category}" value="${sub.playerId}" id="${category}-${index}">
                <label for="${category}-${index}">
                    <span class="comment-text">"${sub.text}"</span>
                </label>
            </div>
        `).join('');
    });
    
    document.getElementById('voting-topic-reminder').textContent = gameState.currentTopic?.text || window.multiplayerState.currentGame?.rounds[window.multiplayerState.currentGame.currentRound]?.topic;
    showScreen('voting-screen');
}

async function submitVotesHandler() {
    const votes = {
        funniest: document.querySelector('input[name="funniest"]:checked')?.value,
        onpoint: document.querySelector('input[name="onpoint"]:checked')?.value,
        unexpected: document.querySelector('input[name="unexpected"]:checked')?.value
    };
    
    if (!votes.funniest || !votes.onpoint || !votes.unexpected) {
        alert('Please vote in all categories!');
        return;
    }
    
    if (window.multiplayerState.isMultiplayer) {
        await window.submitVotes(
            window.multiplayerState.gameCode,
            window.multiplayerState.currentGame.currentRound,
            votes
        );
    } else {
        // Single device voting
        gameState.votes = votes;
        const results = calculateResults();
        displayResults(results, gameState.currentTopic.text);
    }
}

function calculateResults() {
    const results = {
        funniest: { playerId: gameState.votes.funniest, votes: 1 },
        onpoint: { playerId: gameState.votes.onpoint, votes: 1 },
        unexpected: { playerId: gameState.votes.unexpected, votes: 1 }
    };
    
    // Update scores
    if (results.funniest.playerId) gameState.scores[results.funniest.playerId] += 3;
    if (results.onpoint.playerId) gameState.scores[results.onpoint.playerId] += 2;
    if (results.unexpected.playerId) gameState.scores[results.unexpected.playerId] += 1;
    
    return results;
}

function displayResults(results, topic, gameData = null) {
    const winnersContainer = document.getElementById('round-winners');
    const players = gameData ? gameData.players : {};
    
    const getPlayerName = (playerId) => {
        if (gameData) {
            return players[playerId]?.name || 'Unknown';
        }
        return gameState.players.find(p => p.id === playerId)?.name || 'Unknown';
    };
    
    const getSubmissionText = (playerId) => {
        return gameState.submissions.find(s => s.playerId === playerId)?.text || '';
    };
    
    winnersContainer.innerHTML = `
        <div class="winner-card">
            <h3>🤣 Funniest</h3>
            <p class="winner-name">${results.funniest.playerId ? getPlayerName(results.funniest.playerId) : 'No winner'}</p>
            <p class="winner-comment">"${results.funniest.playerId ? getSubmissionText(results.funniest.playerId) : ''}"</p>
            <p class="vote-count">${results.funniest.votes} vote(s)</p>
        </div>
        <div class="winner-card">
            <h3>🎯 Most On-Point</h3>
            <p class="winner-name">${results.onpoint.playerId ? getPlayerName(results.onpoint.playerId) : 'No winner'}</p>
            <p class="winner-comment">"${results.onpoint.playerId ? getSubmissionText(results.onpoint.playerId) : ''}"</p>
            <p class="vote-count">${results.onpoint.votes} vote(s)</p>
        </div>
        <div class="winner-card">
            <h3>😲 Most Unexpected</h3>
            <p class="winner-name">${results.unexpected.playerId ? getPlayerName(results.unexpected.playerId) : 'No winner'}</p>
            <p class="winner-comment">"${results.unexpected.playerId ? getSubmissionText(results.unexpected.playerId) : ''}"</p>
            <p class="vote-count">${results.unexpected.votes} vote(s)</p>
        </div>
    `;
    
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = gameState.submissions.map(sub => `
        <div class="comment-item">
            <strong>${sub.player}:</strong> "${sub.text}"
        </div>
    `).join('');
    
    document.getElementById('results-topic-reminder').textContent = topic;
    showScreen('results-screen');
}

function nextRound() {
    if (gameState.currentRound < gameState.totalRounds) {
        gameState.currentRound++;
        gameState.submissions = [];
        gameState.votes = { funniest: {}, onpoint: {}, unexpected: {} };
        startRound();
    } else {
        showScoreboard();
    }
}

function showScoreboard() {
    const scoresContainer = document.getElementById('player-scores');
    const sortedPlayers = gameState.players.sort((a, b) => 
        (gameState.scores[b.id] || 0) - (gameState.scores[a.id] || 0)
    );
    
    scoresContainer.innerHTML = sortedPlayers.map((player, index) => `
        <div class="score-item ${index === 0 ? 'winner' : ''}">
            <span class="rank">${index === 0 ? '🏆' : index + 1}</span>
            <span class="player-name">${player.name}</span>
            <span class="score">${gameState.scores[player.id] || 0} pts</span>
        </div>
    `).join('');
    
    showScreen('scoreboard-screen');
}

function resetGame() {
    showScreen('home-screen');
    gameState.currentRound = 0;
    gameState.submissions = [];
    gameState.votes = { funniest: {}, onpoint: {}, unexpected: {} };
    gameState.scores = {};
}

// ============ UTILITY FUNCTIONS ============

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId)?.classList.add('active');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function initializeEmojiPicker() {
    const grid = document.getElementById('emoji-grid');
    if (!grid) return;
    
    grid.innerHTML = EMOJIS.map(emoji => 
        `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
    ).join('');
    
    grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-btn')) {
            const emoji = e.target.dataset.emoji;
            insertEmoji(emoji);
        }
    });
}

function insertEmoji(emoji) {
    const activeTextarea = document.activeElement;
    if (activeTextarea && activeTextarea.tagName === 'TEXTAREA') {
        const start = activeTextarea.selectionStart;
        const end = activeTextarea.selectionEnd;
        const text = activeTextarea.value;
        activeTextarea.value = text.substring(0, start) + emoji + text.substring(end);
        activeTextarea.selectionStart = activeTextarea.selectionEnd = start + emoji.length;
        activeTextarea.focus();
    }
}
