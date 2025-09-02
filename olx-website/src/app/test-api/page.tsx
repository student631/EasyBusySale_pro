'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test 1: Basic fetch to backend
      const response = await fetch('http://localhost:5000/api/ads?limit=8');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setTestResult(`✅ Success! Received ${data.ads?.length || 0} ads`);
    } catch (error) {
      console.error('Error details:', error);
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setTestResult('Testing health check...');
    
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setTestResult(`✅ Health check: ${JSON.stringify(data)}`);
    } catch (error) {
      setTestResult(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Backend Connection</h2>
          <div className="space-y-4">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Ads API
            </button>
            
            <button
              onClick={testHealthCheck}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              Test Health Check
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm">{testResult}</pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>Backend URL:</strong> http://localhost:5000</p>
            <p><strong>API Endpoint:</strong> http://localhost:5000/api/ads</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}




