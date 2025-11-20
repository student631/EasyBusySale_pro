# WebSocket Test Karo - Step by Step

## Problem: Message database mein nahi ja raha

## Test Kaise Karein

### Step 1: Backend Restart Karo

Terminal mein jao aur:
```bash
cd olx-backend
# Pehle band karo (Ctrl+C)
# Phir start karo
npm start
```

**Dekhna Chahiye:**
```
✅ Database connected successfully!
✅ Server is running on port 5000
🔌 WebSocket server is ready!
```

### Step 2: Frontend Restart Karo

Naye terminal mein:
```bash
cd olx-website
# Pehle band karo (Ctrl+C)
# Phir start karo
npm run dev
```

**Dekhna Chahiye:**
```
✓ Ready in 2s
○ Local: http://localhost:3000
```

### Step 3: Browser Console Open Karo

1. Browser mein jao: http://localhost:3000/messages
2. F12 press karo (DevTools open hoga)
3. "Console" tab pe click karo

**Ye logs dikhne chahiye:**
```
Socket connected: abc123xyz
Socket authenticated for user: 55
🚪 Joining conversation 9
```

**Agar nahi dikhe toh:**
- Page refresh karo (Ctrl+Shift+R)
- Check karo ke login ho ya nahi

### Step 4: Message Bhejo

1. Koi message type karo: "testing 123"
2. Enter press karo ya Send button click karo

**Teen jagah check karo:**

#### A) Frontend Console (F12):
**Hona Chahiye:**
```
📤 Sending message: convId=9, receiverId=55, text="testing 123"
✅ Message sent via WebSocket
✅ Message sent successfully: 789
📨 Received new_message event: {...}
✅ Message is for current conversation, adding to UI
```

**Agar yeh dikha:**
```
❌ Message error: {message: "Not authenticated..."}
```
**Toh:** Page refresh karo aur phir login karo

#### B) Backend Terminal:
**Hona Chahiye:**
```
📡 Event received: "send_message" from socket abc123xyz
📨 Message received from User 56 to User 55 in conversation 9
✅ Message saved to database with ID: 789
🔊 Broadcasting to room conversation_9, members: 1
```

**Agar kuch nahi dikha:**
- WebSocket connected nahi hai
- Backend restart karo

**Agar ye dikha:**
```
❌ ERROR: socket.userId is undefined! User not authenticated.
```
**Toh:** Authentication problem hai (neeche dekho)

#### C) Database Check:
Terminal mein run karo:
```bash
cd olx-backend
node -e "const pool = require('./config/database'); (async () => { const msgs = await pool.query('SELECT id, sender_id, receiver_id, message_text, created_at FROM messages WHERE conversation_id = 9 ORDER BY created_at DESC LIMIT 5'); console.log('Messages:'); msgs.rows.forEach(m => console.log('  [' + m.id + '] User ' + m.sender_id + ' -> User ' + m.receiver_id + ': ' + m.message_text)); await pool.end(); })()"
```

**Hona Chahiye:**
```
Messages:
  [789] User 56 -> User 55: testing 123
  [6] User 55 -> User 56: hhh
```

**Agar nahi dikha:**
- Message database mein save nahi hua
- Backend terminal check karo error ke liye

---

## Common Problems aur Solutions

### Problem 1: Backend pe koi log nahi aa raha

**Matlab:** WebSocket event backend tak pohonch nahi raha

**Solution:**
1. Check karo backend chal raha hai: http://localhost:5000
2. Frontend `.env.local` check karo:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Dono restart karo (backend phir frontend)
4. Browser cache clear karo (Ctrl+Shift+Delete)

### Problem 2: "socket.userId is undefined" error

**Matlab:** Authentication nahi ho raha

**Solution:**
1. Frontend console check karo:
   ```javascript
   localStorage.getItem('token')
   ```
   Agar `null` hai toh login nahi ho

2. Logout karo aur login karo:
   - http://localhost:3000/login
   - Fresh login karo

3. Token check karo backend pe:
   - Frontend console mein:
     ```javascript
     console.log('Token:', localStorage.getItem('token'))
     ```
   - Agar token bahut lamba hai (100+ characters) toh sahi hai

### Problem 3: Message save ho raha but broadcast nahi ho raha

**Matlab:** Database mein message aa raha but receiver ko nahi mil raha

**Solution:**
1. Check karo dono users conversation mein join hue:
   Backend terminal mein ye 2 baar dikhna chahiye:
   ```
   Socket abc123 joined conversation 9
   Socket def456 joined conversation 9
   ```

2. Agar sirf 1 baar dikha:
   - Receiver ne conversation open nahi kiya
   - Receiver ko messages page pe jaana hoga
   - Conversation 9 pe click karna hoga

3. Broadcasting log check karo:
   ```
   🔊 Broadcasting to room conversation_9, members: 2
   ```
   Members: 2 hona chahiye (dono users)

### Problem 4: Frontend console mein "Socket connected" nahi aa raha

**Matlab:** WebSocket connection hi nahi ban raha

**Solution:**
1. Network tab check karo (F12 → Network → WS filter):
   - Ek WebSocket connection dikhna chahiye
   - Status "101 Switching Protocols" (green) hona chahiye

2. Agar nahi dikha:
   - Backend ke CORS settings check karo
   - Backend port 5000 pe chal raha hai ya nahi: http://localhost:5000

3. Try karo:
   ```bash
   # Backend stop karo
   # Phir start karo
   cd olx-backend
   npm start
   ```

---

## Quick Debug Commands

### Check Backend Running:
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"OK","message":"Server is running"}`

### Check Database Connection:
```bash
cd olx-backend
node -e "const pool = require('./config/database'); pool.query('SELECT NOW()', (err, res) => { console.log(err ? 'ERROR' : 'Connected'); pool.end(); })"
```
Expected: `Connected`

### Check Messages in Database:
```bash
cd olx-backend
node -e "const pool = require('./config/database'); (async () => { const result = await pool.query('SELECT COUNT(*) FROM messages WHERE conversation_id = 9'); console.log('Total messages:', result.rows[0].count); await pool.end(); })()"
```

### Check User Authentication:
Open frontend console (F12) and run:
```javascript
// Check token exists
console.log('Has token:', !!localStorage.getItem('token'));

// Check socket connected
console.log('Socket connected:', window.socket?.connected);

// Check socket authenticated
console.log('Socket ID:', window.socket?.id);
```

---

## Agar Sab Kuch Fail Ho Jaye

1. **Pura backend-frontend restart karo:**
   ```bash
   # Backend terminal (Ctrl+C to stop)
   cd olx-backend
   npm start

   # Frontend terminal (Ctrl+C to stop)
   cd olx-website
   npm run dev
   ```

2. **Fresh login karo:**
   - http://localhost:3000/logout (ya localStorage.clear() console mein)
   - http://localhost:3000/login
   - Fresh login karo

3. **Database migrations run karo:**
   ```bash
   cd olx-backend
   node scripts/run-migration.js
   ```

4. **Test manually database mein save ho raha hai:**
   ```bash
   cd olx-backend
   node -e "const Message = require('./models/Message'); (async () => { const msg = await Message.create(9, 55, 56, 'manual test'); console.log('Saved:', msg); process.exit(); })()"
   ```
   Agar ye work kare toh database theek hai, WebSocket mein problem hai.

---

## Next Step

**Abhi karo:**
1. Dono servers restart karo (backend phir frontend)
2. Browser refresh karo (Ctrl+Shift+R)
3. Message bhejo
4. **Teen terminals dekho**:
   - Frontend console (F12)
   - Backend terminal
   - Database check command

**Mujhe batao kya dikha har jagah!**
