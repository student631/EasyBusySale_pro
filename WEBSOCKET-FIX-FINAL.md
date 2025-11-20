# WebSocket Fix - Final Solution

## Problem Confirmed ✅

Database check shows only 1 old message in conversation 9:
- Message "hhh" from 3 days ago
- New messages ("bi", "hi", "two", "baby") NOT in database
- **WebSocket events are NOT reaching backend**

## Root Cause

Frontend is sending messages BUT backend is not receiving the `send_message` events.

This means:
1. WebSocket connection might not be established
2. OR authentication is failing
3. OR events are being emitted but not received

## Solution - Follow These Exact Steps

### Step 1: Completely Restart Everything

**Backend:**
```bash
# Press Ctrl+C to stop
cd olx-backend
npm start
```

**Wait until you see:**
```
✅ Database connected successfully!
✅ Server is running on port 5000
🔌 WebSocket server is ready!
```

**Frontend:**
```bash
# Press Ctrl+C to stop
cd olx-website
npm run dev
```

**Wait until you see:**
```
✓ Ready in 2s
○ Local: http://localhost:3000
```

### Step 2: Fresh Browser Session

1. Close ALL browser tabs
2. Clear browser cache: Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Select "Cookies and other site data"
   - Click "Clear data"
3. Open fresh browser: http://localhost:3000
4. Login fresh

### Step 3: Open DevTools BEFORE Going to Messages

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Clear console (click 🚫 icon)
4. NOW go to: http://localhost:3000/messages

### Step 4: Check Console Logs

You MUST see these logs in order:
```
Socket connected: xyz123abc
Socket authenticated for user: 56
🚪 Joining conversation 9
```

**If you DON'T see "Socket connected":**
- WebSocket is NOT connecting
- Check Network tab → WS filter
- Should see WebSocket connection with status 101

**If you DON'T see "Socket authenticated":**
- Token is invalid or missing
- Logout and login again
- Check: `localStorage.getItem('token')` in console

### Step 5: Send Test Message

1. Type message: "TESTING123"
2. Click Send
3. **IMMEDIATELY check 3 places:**

**A) Frontend Console:**
Should show:
```
📤 Sending message: convId=9, receiverId=55, text="TESTING123"
✅ Message sent via WebSocket
```

**B) Backend Terminal:**
Should show **IMMEDIATELY**:
```
📡 Event received: "send_message" from socket xyz123
📨 Message received from User 56 to User 55 in conversation 9
✅ Message saved to database with ID: 7
🔊 Broadcasting to room conversation_9, members: 1
```

**C) Database:**
Run this command:
```bash
cd olx-backend
node -e "const pool = require('./config/database'); (async () => { const msgs = await pool.query('SELECT message_text FROM messages WHERE conversation_id = 9 ORDER BY created_at DESC LIMIT 1'); console.log('Last message:', msgs.rows[0]?.message_text || 'NONE'); await pool.end(); })()"
```

Should show: `Last message: TESTING123`

## If Backend Shows NO LOGS

If backend terminal shows NOTHING when you send message, the problem is:

### Problem A: Socket Not Connected

**Check in browser console:**
```javascript
console.log('Connected?', window.socket?.connected);
```

**If FALSE or undefined:**
- WebSocket didn't connect
- Check `.env.local` file has: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Restart frontend

### Problem B: Authentication Failed

**Check in browser console:**
```javascript
console.log('Token:', localStorage.getItem('token'));
```

**If NULL:**
- You're not logged in
- Go to /login and login again

**If token exists but authentication failing:**
- Token might be expired
- Logout: `localStorage.clear()`
- Login again

### Problem C: Event Not Being Emitted

**Add this in browser console:**
```javascript
// Monitor all socket emissions
const oldEmit = window.socket?.emit;
if (oldEmit) {
  window.socket.emit = function(...args) {
    console.log('🚀 Emitting event:', args[0], 'with data:', args[1]);
    return oldEmit.apply(this, args);
  };
}
```

Then send message. Should show:
```
🚀 Emitting event: send_message with data: {conversationId: 9, ...}
```

## If Still Not Working

### Nuclear Option - Complete Reset

1. **Stop both servers** (Ctrl+C)

2. **Clear all data:**
```bash
# Frontend
cd olx-website
rm -rf .next node_modules/.cache

# Backend
cd olx-backend
# (Keep database, just restart)
```

3. **Restart:**
```bash
# Backend first
cd olx-backend
npm start

# Then frontend
cd olx-website
npm run dev
```

4. **Browser:**
- Close ALL tabs
- Clear ALL data (Ctrl+Shift+Delete → Everything)
- Open fresh: http://localhost:3000
- Create NEW user account (don't login to old one)
- Try messaging

## Debug Commands

### Check WebSocket is listening:
```bash
netstat -an | findstr :5000
```
Should show: `TCP    0.0.0.0:5000    LISTENING`

### Check database messages:
```bash
cd olx-backend
node -e "const pool = require('./config/database'); (async () => { const result = await pool.query('SELECT COUNT(*) as count, MAX(created_at) as last FROM messages WHERE conversation_id = 9'); console.log('Messages:', result.rows[0].count, 'Last:', result.rows[0].last); await pool.end(); })()"
```

### Monitor backend logs in real-time:
Just watch the backend terminal - it should show emoji logs for every event

## Expected Flow

When everything works:

1. **Browser loads** → `🔌 New client connected: xyz123`
2. **Auth happens** → `✅ User 56 authenticated successfully`
3. **Join conversation** → `Socket xyz123 joined conversation 9`
4. **Send message** → `📡 Event received: "send_message"`
5. **Save to DB** → `✅ Message saved to database with ID: 7`
6. **Broadcast** → `🔊 Broadcasting to room conversation_9`
7. **Receiver gets** → `📨 Received new_message event` (in other user's console)

## Most Likely Issues

1. **Token expired** - Logout and login again
2. **Backend not restarted** - Restart with latest code
3. **Frontend cached** - Clear .next folder and restart
4. **Socket not initialized** - Check if AuthContext is wrapping the app

## Quick Test

Run this in browser console:
```javascript
// Test if socket exists and is connected
if (window.socket) {
  console.log('Socket exists:', window.socket.id);
  console.log('Connected:', window.socket.connected);

  // Try manual send
  window.socket.emit('send_message', {
    conversationId: 9,
    receiverId: 55,
    messageText: 'MANUAL_TEST'
  });
  console.log('Manual message sent - check backend terminal!');
} else {
  console.log('Socket not initialized!');
}
```

If backend shows logs after this, then the socket.ts functions have an issue.
If backend shows nothing, WebSocket connection is broken.

---

**Next Step:** Restart everything, clear browser, and send ONE test message. Share what backend terminal shows!
