// Game State
const gameState = {
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
    // Initialize player name inputs
    updatePlayerNameInputs();
    document.getElementById('player-count').addEventListener('input', updatePlayerNameInputs);
    
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('continue-to-submit').addEventListener('click', showSubmitScreen);
    document.getElementById('submit-all').addEventListener('click', submitComments);
    document.getElementById('submit-votes').addEventListener('click', submitVotes);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('view-scoreboard').addEventListener('click', showScoreboard);
    document.getElementById('play-again').addEventListener('click', resetGame);
    
    // PWA and sharing functionality
    initializePWA();
    
    // Share buttons
    const shareGameBtn = document.getElementById('share-game');
    const shareResultsBtn = document.getElementById('share-results');
    const copyLinkBtn = document.getElementById('copy-link');
    const copyResultsBtn = document.getElementById('copy-results');
    
    if (shareGameBtn) {
        shareGameBtn.addEventListener('click', shareGame);
        console.log('Share game button found and listener attached');
    } else {
        console.error('Share game button not found!');
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyGameLink);
        console.log('Copy link button found and listener attached');
    } else {
        console.error('Copy link button not found!');
    }
    
    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', shareResults);
        console.log('Share results button found and listener attached');
    } else {
        console.error('Share results button not found!');
    }
    
    if (copyResultsBtn) {
        copyResultsBtn.addEventListener('click', copyResultsText);
        console.log('Copy results button found and listener attached');
    } else {
        console.error('Copy results button not found!');
    }
});

// PWA Installation
let deferredPrompt;

function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
    
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-banner').style.display = 'flex';
    });
    
    // Install button click
    document.getElementById('install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            document.getElementById('install-banner').style.display = 'none';
        }
    });
    
    // Dismiss install banner
    document.getElementById('dismiss-install').addEventListener('click', () => {
        document.getElementById('install-banner').style.display = 'none';
    });
}

// Share game via WhatsApp
function shareGame() {
    const text = `🔥 Join me for Friendly Fire! Light roasts, high laughs, no hard feelings. Let's play! 😄`;
    const url = window.location.href;
    const fullMessage = `${text}\n\n${url}`;
    
    // Always use WhatsApp Web/App link for better compatibility
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    
    // Try to open in new window/tab
    const newWindow = window.open(whatsappUrl, '_blank');
    
    // If popup blocked, show alert with link
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Opening WhatsApp... If it doesn\'t open, please allow popups for this site.');
        window.location.href = whatsappUrl;
    }
}

// Share results
function shareResults() {
    const roundResults = gameState.roundHistory[gameState.roundHistory.length - 1];
    let text = `🔥 Friendly Fire Round Results! 🏆\n\nTopic: ${roundResults.topic}\n\n`;
    
    // Add winners
    const categoryNames = {
        funniest: '🤣 Funniest',
        onpoint: '🎯 Most On-Point',
        unexpected: '😲 Most Unexpected'
    };
    
    Object.entries(roundResults.winners).forEach(([category, winner]) => {
        const player = gameState.players.find(p => p.id === winner.playerId);
        text += `${categoryNames[category]}: ${player.name}\n"${winner.comment}"\n\n`;
    });
    
    // Always use WhatsApp Web/App link
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // Try to open in new window/tab
    const newWindow = window.open(whatsappUrl, '_blank');
    
    // If popup blocked, show alert with link
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Opening WhatsApp... If it doesn\'t open, please allow popups for this site.');
        window.location.href = whatsappUrl;
    }
}

// Copy game link to clipboard
function copyGameLink() {
    const url = window.location.href;
    const text = `🔥 Join me for Friendly Fire! Light roasts, high laughs, no hard feelings. Let's play! 😄\n\n${url}`;
    
    copyToClipboard(text, '✅ Game link copied! Paste it in WhatsApp to share.');
}

// Copy results text to clipboard
function copyResultsText() {
    const roundResults = gameState.roundHistory[gameState.roundHistory.length - 1];
    let text = `🔥 Friendly Fire Round Results! 🏆\n\nTopic: ${roundResults.topic}\n\n`;
    
    // Add winners
    const categoryNames = {
        funniest: '🤣 Funniest',
        onpoint: '🎯 Most On-Point',
        unexpected: '😲 Most Unexpected'
    };
    
    Object.entries(roundResults.winners).forEach(([category, winner]) => {
        const player = gameState.players.find(p => p.id === winner.playerId);
        text += `${categoryNames[category]}: ${player.name}\n"${winner.comment}"\n\n`;
    });
    
    copyToClipboard(text, '✅ Results copied! Paste them in WhatsApp to share.');
}

// Helper function to copy text to clipboard
function copyToClipboard(text, successMessage) {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopyNotification(successMessage);
            })
            .catch(err => {
                // Fallback for clipboard API failure
                fallbackCopyToClipboard(text, successMessage);
            });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(text, successMessage);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification(successMessage);
        } else {
            showCopyNotification('❌ Failed to copy. Please copy manually.');
        }
    } catch (err) {
        showCopyNotification('❌ Copy not supported. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
}

// Show copy notification
function showCopyNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updatePlayerNameInputs() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    const container = document.getElementById('player-names-inputs');
    container.innerHTML = '';

    for (let i = 1; i <= playerCount; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'player-name-input';
        inputGroup.innerHTML = `
            <label for="player-name-${i}">Player ${i}:</label>
            <input type="text" 
                   id="player-name-${i}" 
                   placeholder="Enter name" 
                   maxlength="20"
                   value="Player ${i}">
        `;
        container.appendChild(inputGroup);
    }
}

function startGame() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    const roundCount = parseInt(document.getElementById('round-count').value);
    const gameMode = document.getElementById('game-mode').value;

    // Initialize game state with custom player names
    gameState.players = Array.from({ length: playerCount }, (_, i) => {
        const nameInput = document.getElementById(`player-name-${i + 1}`);
        const playerName = nameInput.value.trim() || `Player ${i + 1}`;
        return {
            id: i + 1,
            name: playerName
        };
    });
    gameState.totalRounds = roundCount;
    gameState.gameMode = gameMode;
    gameState.currentRound = 1;
    gameState.scores = {};
    gameState.roundHistory = [];

    // Initialize scores
    gameState.players.forEach(player => {
        gameState.scores[player.id] = {
            total: 0,
            funniest: 0,
            onpoint: 0,
            unexpected: 0,
            wins: 0
        };
    });

    // Update round displays
    document.querySelectorAll('#total-rounds, .total-rounds').forEach(el => {
        el.textContent = roundCount;
    });

    showTopicScreen();
}

function showTopicScreen() {
    // Get random topic based on game mode
    let topic;
    if (gameState.gameMode === 'double-trouble') {
        const topic1 = getRandomTopic();
        const topic2 = getRandomTopic();
        topic = {
            text: `${topic1.text} AND ${topic2.text}`,
            category: 'Double Trouble'
        };
    } else {
        topic = getRandomTopic();
    }

    gameState.currentTopic = topic;

    document.getElementById('topic-text').textContent = topic.text;
    document.querySelector('.topic-category').textContent = `Category: ${topic.category}`;
    
    // Update round number
    document.querySelectorAll('#current-round, .round-number').forEach(el => {
        el.textContent = gameState.currentRound;
    });

    switchScreen('topic-screen');
}

function showSubmitScreen() {
    const container = document.getElementById('player-submissions');
    container.innerHTML = '';

    // Update topic reminder
    document.getElementById('topic-reminder').textContent = gameState.currentTopic.text;

    // Populate emoji picker
    initializeEmojiPicker();

    // Create submission forms for each player
    gameState.players.forEach(player => {
        const playerForm = document.createElement('div');
        playerForm.className = 'player-submission';
        playerForm.innerHTML = `
            <label for="comment-${player.id}">${player.name}'s Zinger:</label>
            <textarea 
                id="comment-${player.id}" 
                placeholder="Write your funny, friendly roast here..."
                maxlength="200"
                rows="3"
            ></textarea>
            <div class="char-count">
                <span id="count-${player.id}">0</span>/200
            </div>
        `;
        container.appendChild(playerForm);

        // Add character counter and focus tracking
        const textarea = document.getElementById(`comment-${player.id}`);
        textarea.addEventListener('input', (e) => {
            document.getElementById(`count-${player.id}`).textContent = e.target.value.length;
        });
        textarea.addEventListener('focus', (e) => {
            gameState.activeTextarea = e.target;
        });
    });

    // Add timer for lightning round
    if (gameState.gameMode === 'lightning') {
        startLightningTimer(30);
    }

    switchScreen('submit-screen');
}

function initializeEmojiPicker() {
    const emojiGrid = document.getElementById('emoji-grid');
    emojiGrid.innerHTML = '';

    EMOJIS.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'emoji-btn';
        emojiButton.textContent = emoji;
        emojiButton.type = 'button';
        emojiButton.addEventListener('click', () => insertEmoji(emoji));
        emojiGrid.appendChild(emojiButton);
    });
}

function insertEmoji(emoji) {
    const textarea = gameState.activeTextarea || document.querySelector('textarea:focus');
    
    if (!textarea) {
        // If no textarea is focused, insert into the first one
        const firstTextarea = document.querySelector('#player-submissions textarea');
        if (firstTextarea) {
            firstTextarea.focus();
            insertEmojiIntoTextarea(firstTextarea, emoji);
        }
        return;
    }
    
    insertEmojiIntoTextarea(textarea, emoji);
}

function insertEmojiIntoTextarea(textarea, emoji) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    // Check if adding emoji would exceed max length
    if ((before + emoji + after).length <= 200) {
        textarea.value = before + emoji + after;
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
        
        // Trigger input event to update character count
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    }
}

function startLightningTimer(seconds) {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'lightning-timer';
    timerDiv.innerHTML = `<h3>⚡ Time Remaining: <span id="timer">${seconds}</span>s</h3>`;
    document.querySelector('.submit-container').insertBefore(
        timerDiv,
        document.getElementById('player-submissions')
    );

    let timeLeft = seconds;
    const countdown = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitComments();
        }
    }, 1000);
}

function submitComments() {
    gameState.submissions = [];

    gameState.players.forEach(player => {
        const comment = document.getElementById(`comment-${player.id}`).value.trim();
        if (comment) {
            gameState.submissions.push({
                playerId: player.id,
                playerName: player.name,
                comment: comment
            });
        }
    });

    if (gameState.submissions.length === 0) {
        alert('At least one player needs to submit a comment!');
        return;
    }

    showVotingScreen();
}

function showVotingScreen() {
    // Update topic reminder
    document.getElementById('voting-topic-reminder').textContent = gameState.currentTopic.text;

    // Reset votes
    gameState.votes = {
        funniest: {},
        onpoint: {},
        unexpected: {}
    };

    // Shuffle submissions for anonymous voting
    const shuffled = [...gameState.submissions].sort(() => Math.random() - 0.5);

    // Create voting options for each category
    ['funniest', 'onpoint', 'unexpected'].forEach(category => {
        const container = document.getElementById(`${category}-votes`);
        container.innerHTML = '';

        shuffled.forEach((submission, index) => {
            const option = document.createElement('div');
            option.className = 'vote-option';
            option.innerHTML = `
                <input type="radio" 
                       id="${category}-${index}" 
                       name="${category}" 
                       value="${submission.playerId}">
                <label for="${category}-${index}">
                    <div class="comment-text">"${submission.comment}"</div>
                </label>
            `;
            container.appendChild(option);
        });
    });

    switchScreen('voting-screen');
}

function submitVotes() {
    // Collect votes from each category
    const categories = ['funniest', 'onpoint', 'unexpected'];
    let allVoted = true;

    categories.forEach(category => {
        const selected = document.querySelector(`input[name="${category}"]:checked`);
        if (selected) {
            const playerId = parseInt(selected.value);
            gameState.votes[category][playerId] = (gameState.votes[category][playerId] || 0) + 1;
        } else {
            allVoted = false;
        }
    });

    if (!allVoted) {
        alert('Please vote in all three categories!');
        return;
    }

    calculateRoundScores();
    showResultsScreen();
}

function calculateRoundScores() {
    const roundResults = {
        topic: gameState.currentTopic.text,
        winners: {},
        comments: [...gameState.submissions]
    };

    // Find winners in each category
    ['funniest', 'onpoint', 'unexpected'].forEach(category => {
        const votes = gameState.votes[category];
        let maxVotes = 0;
        let winnerId = null;

        Object.keys(votes).forEach(playerId => {
            if (votes[playerId] > maxVotes) {
                maxVotes = votes[playerId];
                winnerId = parseInt(playerId);
            }
        });

        if (winnerId) {
            roundResults.winners[category] = {
                playerId: winnerId,
                votes: maxVotes,
                comment: gameState.submissions.find(s => s.playerId === winnerId).comment
            };
            gameState.scores[winnerId][category]++;
            gameState.scores[winnerId].total++;
        }
    });

    // Track round winner (most categories won)
    const winCounts = {};
    Object.values(roundResults.winners).forEach(winner => {
        winCounts[winner.playerId] = (winCounts[winner.playerId] || 0) + 1;
    });

    const roundWinnerId = parseInt(Object.keys(winCounts).reduce((a, b) => 
        winCounts[a] > winCounts[b] ? a : b
    , 0));
    
    if (roundWinnerId) {
        gameState.scores[roundWinnerId].wins++;
    }

    gameState.roundHistory.push(roundResults);
}

function showResultsScreen() {
    const roundResults = gameState.roundHistory[gameState.roundHistory.length - 1];
    
    // Update topic reminder
    document.getElementById('results-topic-reminder').textContent = roundResults.topic;

    // Display winners
    const winnersContainer = document.getElementById('round-winners');
    winnersContainer.innerHTML = '';

    const categoryIcons = {
        funniest: '🤣',
        onpoint: '🎯',
        unexpected: '😲'
    };

    const categoryNames = {
        funniest: 'Funniest',
        onpoint: 'Most On-Point',
        unexpected: 'Most Unexpected'
    };

    Object.entries(roundResults.winners).forEach(([category, winner]) => {
        const player = gameState.players.find(p => p.id === winner.playerId);
        const winnerCard = document.createElement('div');
        winnerCard.className = 'winner-card';
        winnerCard.innerHTML = `
            <div class="winner-badge">${categoryIcons[category]} ${categoryNames[category]}</div>
            <div class="winner-name">${player.name}</div>
            <div class="winner-comment">"${winner.comment}"</div>
            <div class="winner-votes">${winner.votes} vote${winner.votes > 1 ? 's' : ''}</div>
        `;
        winnersContainer.appendChild(winnerCard);
    });

    // Display all comments
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';

    roundResults.comments.forEach(submission => {
        const player = gameState.players.find(p => p.id === submission.playerId);
        const commentCard = document.createElement('div');
        commentCard.className = 'comment-card';
        commentCard.innerHTML = `
            <div class="comment-author">${player.name}</div>
            <div class="comment-text">"${submission.comment}"</div>
        `;
        commentsList.appendChild(commentCard);
    });

    // Update button
    const nextButton = document.getElementById('next-round');
    if (gameState.currentRound >= gameState.totalRounds) {
        nextButton.textContent = 'View Final Results';
        nextButton.onclick = showScoreboard;
    } else {
        nextButton.textContent = 'Next Round';
        nextButton.onclick = nextRound;
    }

    switchScreen('results-screen');
}

function nextRound() {
    gameState.currentRound++;
    gameState.submissions = [];
    showTopicScreen();
}

function showScoreboard() {
    // Sort players by total score
    const sortedPlayers = gameState.players
        .map(player => ({
            ...player,
            scores: gameState.scores[player.id]
        }))
        .sort((a, b) => b.scores.total - a.scores.total);

    // Display player scores
    const scoresContainer = document.getElementById('player-scores');
    scoresContainer.innerHTML = '';

    sortedPlayers.forEach((player, index) => {
        const scoreCard = document.createElement('div');
        scoreCard.className = 'score-card';
        scoreCard.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="score-breakdown">
                    <span>🤣 ${player.scores.funniest}</span>
                    <span>🎯 ${player.scores.onpoint}</span>
                    <span>😲 ${player.scores.unexpected}</span>
                </div>
            </div>
            <div class="total-score">${player.scores.total} pts</div>
        `;
        scoresContainer.appendChild(scoreCard);
    });

    // Calculate and display awards
    displayAwards(sortedPlayers);

    switchScreen('scoreboard-screen');
}

function displayAwards(sortedPlayers) {
    const awardsContainer = document.getElementById('awards-list');
    awardsContainer.innerHTML = '';

    const awards = [];

    // Dad Joke Assassin - Most funniest wins
    const funniestWinner = sortedPlayers.reduce((max, p) => 
        p.scores.funniest > max.scores.funniest ? p : max
    );
    if (funniestWinner.scores.funniest > 0) {
        awards.push({
            icon: '😂',
            title: 'Dad Joke Assassin',
            winner: funniestWinner.name,
            reason: `${funniestWinner.scores.funniest} funniest wins`
        });
    }

    // The Oracle - Most on-point wins
    const oracleWinner = sortedPlayers.reduce((max, p) => 
        p.scores.onpoint > max.scores.onpoint ? p : max
    );
    if (oracleWinner.scores.onpoint > 0) {
        awards.push({
            icon: '🔮',
            title: 'The Oracle',
            winner: oracleWinner.name,
            reason: `${oracleWinner.scores.onpoint} on-point wins`
        });
    }

    // Most Unexpected Wisdom - Most unexpected wins
    const unexpectedWinner = sortedPlayers.reduce((max, p) => 
        p.scores.unexpected > max.scores.unexpected ? p : max
    );
    if (unexpectedWinner.scores.unexpected > 0) {
        awards.push({
            icon: '💡',
            title: 'Most Unexpected Wisdom',
            winner: unexpectedWinner.name,
            reason: `${unexpectedWinner.scores.unexpected} unexpected wins`
        });
    }

    // Friendly Fire MVP - Most total wins
    const mvp = sortedPlayers[0];
    if (mvp.scores.total > 0) {
        awards.push({
            icon: '🔥',
            title: 'Friendly Fire MVP',
            winner: mvp.name,
            reason: `${mvp.scores.total} total points`
        });
    }

    // Display awards
    awards.forEach(award => {
        const awardCard = document.createElement('div');
        awardCard.className = 'award-card';
        awardCard.innerHTML = `
            <div class="award-icon">${award.icon}</div>
            <div class="award-info">
                <div class="award-title">${award.title}</div>
                <div class="award-winner">${award.winner}</div>
                <div class="award-reason">${award.reason}</div>
            </div>
        `;
        awardsContainer.appendChild(awardCard);
    });
}

function resetGame() {
    gameState.currentRound = 0;
    gameState.submissions = [];
    gameState.roundHistory = [];
    switchScreen('setup-screen');
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function getRandomTopic() {
    if (typeof TOPICS === 'undefined') {
        // Fallback topics if topics.js not loaded
        return {
            text: "What's the most on-brand thing someone in this group would do?",
            category: 'Friend Group'
        };
    }

    const allTopics = Object.values(TOPICS).flat();
    return allTopics[Math.floor(Math.random() * allTopics.length)];
}
