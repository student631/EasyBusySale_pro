@echo off
echo ========================================
echo WebSocket Diagnostic Tool
echo ========================================
echo.

echo Step 1: Checking if backend is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Backend is NOT running!
    echo.
    echo Please start backend:
    echo   cd olx-backend
    echo   npm start
    echo.
    pause
    exit /b 1
)
echo [PASS] Backend is running
echo.

echo Step 2: Running WebSocket connection test...
node test-websocket-connection.js
echo.

echo Step 3: Checking database messages...
cd olx-backend
node -e "const pool = require('./config/database'); (async () => { try { const result = await pool.query('SELECT COUNT(*) as count FROM messages WHERE conversation_id = 9'); console.log('[INFO] Total messages in conversation 9:', result.rows[0].count); const recent = await pool.query('SELECT message_text, created_at FROM messages WHERE conversation_id = 9 ORDER BY created_at DESC LIMIT 1'); if(recent.rows.length > 0) { console.log('[INFO] Last message:', recent.rows[0].message_text); console.log('[INFO] Sent at:', recent.rows[0].created_at); } else { console.log('[WARN] No messages found in conversation 9'); } await pool.end(); } catch(e) { console.log('[FAIL] Database error:', e.message); process.exit(1); } })()"
cd ..
echo.

echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
echo Next steps:
echo 1. Check backend terminal for WebSocket logs
echo 2. Send a test message from browser
echo 3. Run this script again to verify message saved
echo.
pause
