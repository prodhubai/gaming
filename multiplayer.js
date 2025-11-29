// Multiplayer.js - Firebase Real-time Multiplayer System
import { getDatabase, ref, set, onValue, update, remove, push, get, onDisconnect } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Global multiplayer state
window.multiplayerState = {
    gameCode: null,
    playerId: null,
    playerName: null,
    isHost: false,
    isMultiplayer: false,
    currentGame: null
};

// Generate random game code
function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate unique player ID
function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create new multiplayer game
export async function createMultiplayerGame(hostName) {
    const db = window.database;
    const gameCode = generateGameCode();
    const playerId = generatePlayerId();
    
    const gameRef = ref(db, `games/${gameCode}`);
    
    const gameData = {
        host: playerId,
        settings: {
            rounds: 5,
            gameMode: 'standard'
        },
        status: 'lobby', // lobby, playing, finished
        currentRound: 0,
        players: {
            [playerId]: {
                name: hostName,
                joined: Date.now(),
                isHost: true,
                online: true
            }
        },
        rounds: {},
        scores: {
            [playerId]: 0
        }
    };
    
    await set(gameRef, gameData);
    
    // Setup disconnect handler
    const playerOnlineRef = ref(db, `games/${gameCode}/players/${playerId}/online`);
    onDisconnect(playerOnlineRef).set(false);
    
    window.multiplayerState = {
        gameCode,
        playerId,
        playerName: hostName,
        isHost: true,
        isMultiplayer: true,
        currentGame: gameData
    };
    
    return { gameCode, playerId };
}

// Join existing game
export async function joinMultiplayerGame(gameCode, playerName) {
    const db = window.database;
    const gameRef = ref(db, `games/${gameCode}`);
    
    // Check if game exists
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
        throw new Error('Game not found');
    }
    
    const gameData = snapshot.val();
    if (gameData.status !== 'lobby') {
        throw new Error('Game already started');
    }
    
    const playerId = generatePlayerId();
    const playerRef = ref(db, `games/${gameCode}/players/${playerId}`);
    
    await set(playerRef, {
        name: playerName,
        joined: Date.now(),
        isHost: false,
        online: true
    });
    
    // Initialize score
    const scoreRef = ref(db, `games/${gameCode}/scores/${playerId}`);
    await set(scoreRef, 0);
    
    // Setup disconnect handler
    const playerOnlineRef = ref(db, `games/${gameCode}/players/${playerId}/online`);
    onDisconnect(playerOnlineRef).set(false);
    
    window.multiplayerState = {
        gameCode,
        playerId,
        playerName,
        isHost: false,
        isMultiplayer: true,
        currentGame: gameData
    };
    
    return { gameCode, playerId };
}

// Listen to game updates
export function subscribeToGame(gameCode, callback) {
    const db = window.database;
    const gameRef = ref(db, `games/${gameCode}`);
    
    onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
            const gameData = snapshot.val();
            window.multiplayerState.currentGame = gameData;
            callback(gameData);
        }
    });
}

// Update game settings (host only)
export async function updateGameSettings(gameCode, settings) {
    const db = window.database;
    const settingsRef = ref(db, `games/${gameCode}/settings`);
    await update(settingsRef, settings);
}

// Start game (host only)
export async function startMultiplayerGame(gameCode) {
    const db = window.database;
    const statusRef = ref(db, `games/${gameCode}/status`);
    await set(statusRef, 'playing');
    
    // Initialize first round
    await initializeRound(gameCode, 1);
}

// Initialize a new round
export async function initializeRound(gameCode, roundNumber) {
    const db = window.database;
    const roundRef = ref(db, `games/${gameCode}/rounds/${roundNumber}`);
    
    // Get random topic
    const allTopics = Object.values(window.TOPICS).flat();
    const topic = allTopics[Math.floor(Math.random() * allTopics.length)];
    
    await set(roundRef, {
        topic: topic.text,
        category: topic.category,
        submissions: {},
        votes: {},
        results: null,
        status: 'submitting' // submitting, voting, results
    });
    
    // Update current round
    const currentRoundRef = ref(db, `games/${gameCode}/currentRound`);
    await set(currentRoundRef, roundNumber);
}

// Submit comment for current round
export async function submitComment(gameCode, roundNumber, comment) {
    const db = window.database;
    const { playerId } = window.multiplayerState;
    const submissionRef = ref(db, `games/${gameCode}/rounds/${roundNumber}/submissions/${playerId}`);
    
    await set(submissionRef, {
        text: comment,
        playerId: playerId,
        timestamp: Date.now()
    });
}

// Check if all players submitted
export async function checkAllSubmitted(gameCode, roundNumber) {
    const db = window.database;
    const gameRef = ref(db, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) return false;
    
    const gameData = snapshot.val();
    const players = Object.keys(gameData.players || {});
    const submissions = Object.keys(gameData.rounds?.[roundNumber]?.submissions || {});
    
    return players.length === submissions.length && players.length > 0;
}

// Move round to voting phase
export async function moveToVoting(gameCode, roundNumber) {
    const db = window.database;
    const statusRef = ref(db, `games/${gameCode}/rounds/${roundNumber}/status`);
    await set(statusRef, 'voting');
}

// Submit votes
export async function submitVotes(gameCode, roundNumber, votes) {
    const db = window.database;
    const { playerId } = window.multiplayerState;
    const voteRef = ref(db, `games/${gameCode}/rounds/${roundNumber}/votes/${playerId}`);
    
    await set(voteRef, {
        funniest: votes.funniest,
        onpoint: votes.onpoint,
        unexpected: votes.unexpected,
        timestamp: Date.now()
    });
}

// Check if all players voted
export async function checkAllVoted(gameCode, roundNumber) {
    const db = window.database;
    const gameRef = ref(db, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) return false;
    
    const gameData = snapshot.val();
    const players = Object.keys(gameData.players || {});
    const votes = Object.keys(gameData.rounds?.[roundNumber]?.votes || {});
    
    return players.length === votes.length && players.length > 0;
}

// Calculate round results
export async function calculateRoundResults(gameCode, roundNumber) {
    const db = window.database;
    const gameRef = ref(db, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) return;
    
    const gameData = snapshot.val();
    const round = gameData.rounds[roundNumber];
    const votes = round.votes || {};
    
    // Count votes
    const voteCounts = {
        funniest: {},
        onpoint: {},
        unexpected: {}
    };
    
    Object.values(votes).forEach(vote => {
        if (vote.funniest) voteCounts.funniest[vote.funniest] = (voteCounts.funniest[vote.funniest] || 0) + 1;
        if (vote.onpoint) voteCounts.onpoint[vote.onpoint] = (voteCounts.onpoint[vote.onpoint] || 0) + 1;
        if (vote.unexpected) voteCounts.unexpected[vote.unexpected] = (voteCounts.unexpected[vote.unexpected] || 0) + 1;
    });
    
    // Find winners
    const findWinner = (counts) => {
        let maxVotes = 0;
        let winner = null;
        Object.entries(counts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                winner = playerId;
            }
        });
        return { playerId: winner, votes: maxVotes };
    };
    
    const results = {
        funniest: findWinner(voteCounts.funniest),
        onpoint: findWinner(voteCounts.onpoint),
        unexpected: findWinner(voteCounts.unexpected)
    };
    
    // Update scores
    const updates = {};
    if (results.funniest.playerId) {
        updates[`scores/${results.funniest.playerId}`] = (gameData.scores[results.funniest.playerId] || 0) + 3;
    }
    if (results.onpoint.playerId) {
        updates[`scores/${results.onpoint.playerId}`] = (gameData.scores[results.onpoint.playerId] || 0) + 2;
    }
    if (results.unexpected.playerId) {
        updates[`scores/${results.unexpected.playerId}`] = (gameData.scores[results.unexpected.playerId] || 0) + 1;
    }
    
    // Save results
    updates[`rounds/${roundNumber}/results`] = results;
    updates[`rounds/${roundNumber}/status`] = 'results';
    
    const gameUpdateRef = ref(db, `games/${gameCode}`);
    await update(gameUpdateRef, updates);
    
    return results;
}

// Leave game
export async function leaveGame(gameCode, playerId) {
    const db = window.database;
    
    // If host is leaving, delete entire game
    const gameRef = ref(db, `games/${gameCode}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
        const gameData = snapshot.val();
        if (gameData.host === playerId) {
            await remove(gameRef);
        } else {
            const playerRef = ref(db, `games/${gameCode}/players/${playerId}`);
            await remove(playerRef);
        }
    }
    
    window.multiplayerState = {
        gameCode: null,
        playerId: null,
        playerName: null,
        isHost: false,
        isMultiplayer: false,
        currentGame: null
    };
}

// Export functions
window.createMultiplayerGame = createMultiplayerGame;
window.joinMultiplayerGame = joinMultiplayerGame;
window.subscribeToGame = subscribeToGame;
window.updateGameSettings = updateGameSettings;
window.startMultiplayerGame = startMultiplayerGame;
window.initializeRound = initializeRound;
window.submitComment = submitComment;
window.checkAllSubmitted = checkAllSubmitted;
window.moveToVoting = moveToVoting;
window.submitVotes = submitVotes;
window.checkAllVoted = checkAllVoted;
window.calculateRoundResults = calculateRoundResults;
window.leaveGame = leaveGame;
