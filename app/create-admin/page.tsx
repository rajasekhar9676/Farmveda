'use client';

import { useState } from 'react';
import Button from '@/components/Button';

export default function CreateAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createAdmin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
      });
      
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Admin User</h1>
        
        <p className="text-gray-600 mb-6">
          Click the button below to create the default admin user if it doesn't exist.
        </p>

        <Button 
          onClick={createAdmin} 
          disabled={loading}
          className="w-full mb-6"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <div>
                <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                <p className="text-sm text-green-700 mb-3">{result.message}</p>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Admin Credentials:</p>
                  <p className="text-sm text-gray-600">Mobile: <strong>1234567890</strong></p>
                  <p className="text-sm text-gray-600">Password: <strong>admin123</strong></p>
                </div>
                <p className="text-xs text-green-600 mt-3">
                  You can now login at <a href="/admin/login" className="underline">/admin/login</a>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-sm text-red-700">{result.error}</p>
                {result.details && (
                  <p className="text-xs text-red-600 mt-2">{result.details}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


