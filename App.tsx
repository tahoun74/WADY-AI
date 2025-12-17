import React, { useEffect, useState } from 'react';
import { ExtensionTokenData, STORAGE_KEY } from './types';

declare var chrome: any;

// Icons
const LinkIcon = () => (
  <svg xmlns="http://www.wady.ai/link" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const App: React.FC = () => {
  const [authData, setAuthData] = useState<ExtensionTokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing token
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (result: any) => {
        if (result[STORAGE_KEY]) {
          setAuthData(result[STORAGE_KEY] as ExtensionTokenData);
        }
        setLoading(false);
      });
    } else {
      // Fallback for development without extension environment
      setLoading(false);
    }
  }, []);

  const handleConnect = () => {
    // Mock authentication for testing (remove this when you have a real dashboard)
    const mockAuthData: ExtensionTokenData = {
      token: 'mock-token-' + Date.now(),
      supplierId: 'SUPPLIER-' + Math.floor(Math.random() * 10000),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
    };
    
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: mockAuthData }, () => {
        setAuthData(mockAuthData);
      });
    }
    
    // TODO: Replace with real authentication
    // window.open('https://dashboard.wady.ai/extension/link', '_blank');
  };

  const handleLogout = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        setAuthData(null);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <span>Wady</span>
          <span className="text-indigo-200 text-xs font-normal border border-indigo-400 rounded px-1">EXT</span>
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        {authData ? (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircleIcon />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Connected</h2>
            <p className="mt-2 text-sm text-gray-500">
              Linked to Supplier ID: <span className="font-mono text-gray-700">{authData.supplierId}</span>
            </p>
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 text-left w-full">
              <p className="text-xs text-green-800 font-medium mb-1">How to use:</p>
              <ul className="text-xs text-green-700 list-disc list-inside space-y-1">
                <li>Select text on any webpage</li>
                <li>Right-click the selection</li>
                <li>Choose "Send to Wady Inbox"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircleIcon />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Not Connected</h2>
            <p className="mt-2 text-sm text-gray-500">
              Link this extension to your Wady supplier account to start capturing orders.
            </p>
            <button
              onClick={handleConnect}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
            >
              <LinkIcon />
              Connect Account
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        {authData ? (
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 w-full text-center transition-colors"
          >
            Unlink Account
          </button>
        ) : (
          <p className="text-xs text-gray-400 text-center">
            Need help? Visit <a href="https://wady.ai/support" target="_blank" rel="noreferrer" className="underline hover:text-indigo-600">wady.ai/support</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default App;