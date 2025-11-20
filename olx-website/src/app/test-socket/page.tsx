'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

export default function TestSocketPage() {
  const { socket, connectionStatus, isConnected } = useSocket();
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    if (!socket) {
      addLog('❌ Socket is null');
      return;
    }

    addLog(`✅ Socket exists, ID: ${socket.id}`);
    addLog(`🔌 Connection status: ${connectionStatus}`);
    addLog(`📡 Connected: ${isConnected}`);

    // Listen to all events
    socket.onAny((eventName, ...args) => {
      addLog(`📥 Event received: "${eventName}" with data: ${JSON.stringify(args)}`);
    });

    return () => {
      socket.offAny();
    };
  }, [socket, connectionStatus, isConnected]);

  const sendTestMessage = () => {
    if (!socket) {
      addLog('❌ Cannot send: socket is null');
      return;
    }

    if (!socket.connected) {
      addLog('❌ Cannot send: socket not connected');
      return;
    }

    addLog(`📤 Sending test message: "${testMessage}"`);

    socket.emit('send_message', {
      conversationId: 10,
      receiverId: 56,
      messageText: testMessage
    });

    addLog('✅ Message emitted');
  };

  const testAuthentication = () => {
    if (!socket) {
      addLog('❌ Socket is null');
      return;
    }

    addLog('📤 Testing authentication...');
    socket.emit('authenticate', localStorage.getItem('token'));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WebSocket Debug Panel</h1>

        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p>User: <span className="font-mono">{user?.username || 'Not logged in'}</span></p>
            <p>User ID: <span className="font-mono">{user?.id || 'N/A'}</span></p>
            <p>Socket ID: <span className="font-mono">{socket?.id || 'Not connected'}</span></p>
            <p>Status: <span className={`font-mono ${isConnected ? 'text-green-600' : 'text-red-600'}`}>{connectionStatus}</span></p>
            <p>Connected: <span className={`font-mono ${isConnected ? 'text-green-600' : 'text-red-600'}`}>{isConnected ? 'YES' : 'NO'}</span></p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Test Controls</h2>

          <div className="space-y-4">
            <button
              onClick={testAuthentication}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Authentication
            </button>

            <div>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message"
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={sendTestMessage}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Send Test Message
              </button>
            </div>

            <button
              onClick={() => setLogs([])}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Event Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Event Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check if socket is connected (should be green)</li>
            <li>Click "Test Authentication" and check backend terminal for logs</li>
            <li>Type a message and click "Send Test Message"</li>
            <li>Check backend terminal for: 📡 Event received: "send_message"</li>
            <li>Check database: <code className="bg-gray-200 px-1">SELECT * FROM messages WHERE conversation_id = 10 ORDER BY created_at DESC LIMIT 1</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
