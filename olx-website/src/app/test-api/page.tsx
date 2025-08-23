'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAdsEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ads');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Test Health Endpoint
          </button>
          
          <button
            onClick={testAdsEndpoint}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300 ml-4"
          >
            Test Ads Endpoint
          </button>
        </div>

        {loading && (
          <div className="text-blue-600">Testing connection...</div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}



