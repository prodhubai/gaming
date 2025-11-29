# Firebase Setup for Friendly Fire Multiplayer

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `friendly-fire-game` (or any name)
4. Disable Google Analytics (optional, not needed)
5. Click "Create project"

### Step 2: Enable Realtime Database

1. In your Firebase project, click "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose location (select closest to you)
4. Start in **TEST MODE** for now
   - This allows anyone to read/write (fine for a party game)
   - Rules will be:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
5. Click "Enable"

### Step 3: Get Your Config

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the **Web** icon `</>`
5. Give your app a nickname: "Friendly Fire Web"
6. **DO NOT** check "Firebase Hosting" (we're using GitHub Pages)
7. Click "Register app"
8. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "friendly-fire-xxxxx.firebaseapp.com",
  databaseURL: "https://friendly-fire-xxxxx-default-rtdb.firebaseio.com",
  projectId: "friendly-fire-xxxxx",
  storageBucket: "friendly-fire-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### Step 4: Update Your Code

1. Open `/workspaces/gaming/index.html`
2. Find this section (around line 230):
```javascript
// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace it with YOUR config from Step 3
4. Save the file

### Step 5: Test Locally

```bash
cd /workspaces/gaming
python3 -m http.server 8000
```

Open http://localhost:8000 in two browser windows/tabs:
- Window 1: Click "Multiplayer Mode" → "Create New Game"
- Window 2: Click "Multiplayer Mode" → "Join Existing Game" → Enter the code from Window 1

### Step 6: Deploy to GitHub Pages

```bash
git add index.html
git commit -m "Add Firebase config for multiplayer"
git push origin main
```

The GitHub Actions workflow will automatically deploy.

## Security Rules (Optional - Production)

If you want to add basic security after testing:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace with:
```json
{
  "rules": {
    "games": {
      "$gameCode": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status", "currentRound"]
      }
    }
  }
}
```

## How Multiplayer Works

### Game Flow

1. **Host Creates Game**
   - Generates random 6-character code (e.g., "ABC123")
   - Creates game in Firebase: `/games/ABC123`
   - Joins lobby as host

2. **Players Join**
   - Enter game code
   - Added to `/games/ABC123/players/{playerId}`
   - See all players in lobby

3. **Host Starts Game**
   - Sets game status to "playing"
   - Initializes first round with random topic
   - All players automatically see topic screen

4. **Each Round**
   - Players see topic on their own device
   - Each player submits ONE comment from their device
   - When all submit, host auto-advances to voting
   - Each player votes independently
   - When all vote, host calculates results
   - All players see results simultaneously

5. **Scoring**
   - Funniest: +3 points
   - Most On-Point: +2 points
   - Most Unexpected: +1 point
   - Scores synced across all devices

### Data Structure in Firebase

```
games/
  ABC123/
    host: "player_123"
    status: "playing"
    currentRound: 1
    settings:
      rounds: 5
      gameMode: "standard"
    players:
      player_123:
        name: "Alice"
        isHost: true
        online: true
      player_456:
        name: "Bob"
        isHost: false
        online: true
    rounds:
      1:
        topic: "Most likely to become a superhero"
        category: "Friend Group"
        status: "submitting"  # or "voting" or "results"
        submissions:
          player_123: {text: "Bob with his coffee addiction", timestamp: 1234567}
          player_456: {text: "Alice saving everyone", timestamp: 1234568}
        votes:
          player_123: {funniest: "player_456", onpoint: "player_456", unexpected: "player_456"}
          player_456: {funniest: "player_123", onpoint: "player_123", unexpected: "player_123"}
        results:
          funniest: {playerId: "player_456", votes: 1}
          onpoint: {playerId: "player_456", votes: 1}
          unexpected: {playerId: "player_456", votes: 1}
    scores:
      player_123: 3
      player_456: 6
```

## Features

✅ **Real-time sync** - All players see updates instantly  
✅ **Auto-advance** - Host automatically moves game forward when all players ready  
✅ **Disconnect handling** - Shows offline status if player loses connection  
✅ **WhatsApp sharing** - Share game code via WhatsApp  
✅ **URL joining** - Players can join via link with code pre-filled  
✅ **Waiting screens** - Shows progress while waiting for other players  

## Troubleshooting

### "Failed to create game"
- Check Firebase config is correct
- Ensure Realtime Database is created and rules allow write access
- Check browser console for errors (F12)

### "Game not found" when joining
- Verify game code is correct (case-sensitive)
- Check if host left (game is deleted when host leaves)

### Players not seeing updates
- Check internet connection
- Verify Firebase Realtime Database URL in config
- Open browser console to see Firebase connection status

### Game code doesn't work
- Codes are case-sensitive
- Try copying/pasting instead of typing
- Ensure both players are connected to internet

## Free Tier Limits

Firebase Realtime Database Free tier:
- **1 GB stored** - Way more than needed for party game
- **10 GB/month download** - ~1000 games/month
- **100 simultaneous connections** - ~20 concurrent games

Perfect for a party game with friends!

## Cost Estimate

For typical use (playing with friends):
- **FREE** - Will never exceed free tier limits
- Each game uses ~10-50KB of data
- Games auto-delete when host leaves

## Next Steps

1. Complete Firebase setup above
2. Test locally with 2+ browser windows
3. Deploy to GitHub Pages
4. Share game link with friends via WhatsApp
5. Play! 🔥
