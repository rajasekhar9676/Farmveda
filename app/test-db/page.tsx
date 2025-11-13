'use client';

import { useState } from 'react';
import Button from '@/components/Button';

export default function TestDB() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/test-db');
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">MongoDB Connection Test</h1>
        
        <Button onClick={testConnection} disabled={loading} className="mb-6">
          {loading ? 'Testing...' : 'Test MongoDB Connection'}
        </Button>

        {result && (
          <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <h2 className={`font-bold text-lg mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Connection Successful!' : '❌ Connection Failed'}
            </h2>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>Has MONGODB_URI:</strong> {result.hasUri ? '✅ Yes' : '❌ No'}
              </div>
              {result.uriLength && (
                <div>
                  <strong>URI Length:</strong> {result.uriLength} characters
                </div>
              )}
              {result.message && (
                <div>
                  <strong>Message:</strong> {result.message}
                </div>
              )}
              {result.error && (
                <div className="text-red-700">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>

            {!result.hasUri && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Setup Required:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                  <li>Create a file named <code className="bg-yellow-100 px-1 rounded">.env.local</code> in the <code className="bg-yellow-100 px-1 rounded">farmveda</code> folder</li>
                  <li>Add your MongoDB connection string:
                    <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-x-auto">
{`MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/farmveda?retryWrites=true&w=majority`}
                    </pre>
                  </li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

