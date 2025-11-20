# Login/Signup Debug Guide

## ✅ Backend Status: **WORKING PERFECTLY**

I tested:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser1234","email":"test1234@example.com","password":"Test@123","full_name":"Test User","phone":"1234567890","location":"Texas"}'
```

Result: ✅ User created successfully (ID: 65)

---

## 🐛 Issue: Frontend Cannot Connect to Backend

### Quick Diagnosis Steps:

### Step 1: Check Frontend Port
Open browser console and type:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
```

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to signup
4. Look for the POST request to `/api/auth/signup`
5. Click on it and check:
   - **Request URL**: Should be `http://localhost:5000/api/auth/signup`
   - **Status Code**: What status code? (404, 500, CORS error?)
   - **Response**: What error message?

### Step 3: Check Console Errors
Look for these specific errors:
- ❌ `CORS policy` → CORS issue
- ❌ `Failed to fetch` → Backend not running or wrong URL
- ❌ `Network error` → Connection refused

---

## 🔧 Common Fixes:

### Fix 1: Hard Refresh Browser
```
Press: Ctrl + Shift + R (Windows)
Or: Ctrl + F5
```

### Fix 2: Clear Site Data
1. F12 → Open DevTools
2. Go to **Application** tab
3. Click **Clear site data**
4. Refresh page

### Fix 3: Restart Frontend Dev Server
```bash
# Stop current server (Ctrl+C)
cd d:\olx\olx-website
npm run dev
```

### Fix 4: Verify .env.local
Check file: `d:\olx\olx-website\.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Fix 5: Check Frontend Port
Frontend should be running on: **http://localhost:3000**
If it's on different port, update CORS in backend:

File: `d:\olx\olx-backend\server.js` (line 41)
```javascript
origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', '*'],
```

---

## 🧪 Manual Test (Without Frontend)

Test backend directly from browser console:

### Test Signup:
```javascript
fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser567',
    email: 'test567@example.com',
    password: 'Test@123',
    full_name: 'Test User',
    phone: '1234567890',
    location: 'Texas'
  })
})
.then(r => r.json())
.then(data => console.log('Signup result:', data))
.catch(err => console.error('Signup error:', err));
```

### Test Login:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test567@example.com',
    password: 'Test@123'
  })
})
.then(r => r.json())
.then(data => console.log('Login result:', data))
.catch(err => console.error('Login error:', err));
```

---

## 📊 What to Share for Debugging:

If still not working, share these details:

1. **Frontend Port**: What URL is frontend running on? (check browser address bar)
   - Example: http://localhost:3000 or http://localhost:3001?

2. **Network Tab Screenshot**:
   - F12 → Network tab → Try signup → Share screenshot of failed request

3. **Console Errors**:
   - Any red errors in browser console?

4. **Browser Used**:
   - Chrome, Firefox, Edge?

5. **Exact Error Message on UI**:
   - What message shows on signup form?

---

## ✅ Expected Success Flow:

1. Fill signup form
2. Click "Create Account"
3. Browser sends POST to `http://localhost:5000/api/auth/signup`
4. Backend responds with `{success: true, user: {...}, token: "..."}`
5. Frontend saves token to localStorage
6. Redirects to homepage
7. User is logged in ✅

---

## 🚨 Most Likely Issues (Priority Order):

1. **Browser cache has old code** → Hard refresh (Ctrl+Shift+R)
2. **Frontend dev server needs restart** → Stop and `npm run dev` again
3. **Wrong API URL in frontend** → Check .env.local
4. **CORS blocking** → Check Network tab for CORS error
5. **Backend not running** → We confirmed it IS running, so not this

---

**Try these steps and tell me:**
- What you see in Network tab (Status code? Error?)
- What error message shows on UI?
- What's in browser console?
