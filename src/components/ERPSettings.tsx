import React, { useState, useEffect } from 'react';
import { ERPConfig, saveERPConfig, loadERPConfig, clearERPConfig, ERPClient } from '../utils/erpClient';

interface ERPSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ERPConfig) => void;
}

const ERPSettings: React.FC<ERPSettingsProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<ERPConfig>({
    baseUrl: 'https://erp.naapbooks.com:9443',
    employeeId: 'NB-24-0012',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
  });

  const [authMethod, setAuthMethod] = useState<'apiKey' | 'password'>('password');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const saved = loadERPConfig();
    if (saved) {
      setConfig(saved);
      // Determine auth method based on saved config
      if (saved.apiKey && saved.apiSecret) {
        setAuthMethod('apiKey');
      } else if (saved.username && saved.password) {
        setAuthMethod('password');
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    // Clear unused auth fields based on method
    const configToSave = { ...config };
    if (authMethod === 'apiKey') {
      delete configToSave.username;
      delete configToSave.password;
    } else {
      delete configToSave.apiKey;
      delete configToSave.apiSecret;
    }

    saveERPConfig(configToSave);
    onSave(configToSave);
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const client = new ERPClient(config);

      // If using password auth, try to login first
      if (authMethod === 'password') {
        const loginResult = await client.login();
        setTestResult(loginResult);
      } else {
        // Test connection with API key
        const result = await client.testConnection();
        setTestResult(result);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearERPConfig();
    setConfig({
      baseUrl: 'https://erp.naapbooks.com:9443',
      employeeId: 'NB-24-0012',
      apiKey: '',
      apiSecret: '',
      username: '',
      password: '',
    });
    setTestResult(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-xl shadow-2xl animate-scaleIn">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  ERP Integration Settings
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure automatic data fetching from ERPNext</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* ERP URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ERP Base URL
              </label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://erp.naapbooks.com:9443"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">The base URL of your ERPNext installation</p>
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={config.employeeId}
                onChange={(e) => setConfig({ ...config, employeeId: e.target.value })}
                placeholder="NB-24-0012"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Your employee ID in the ERP system</p>
            </div>

            {/* Authentication Method */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Authentication Method
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAuthMethod('apiKey')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    authMethod === 'apiKey'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  API Key (Recommended)
                </button>
                <button
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    authMethod === 'password'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  Username/Password
                </button>
              </div>
            </div>

            {/* API Key Authentication */}
            {authMethod === 'apiKey' && (
              <div className="space-y-4 bg-slate-950/50 border border-slate-700/50 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={config.apiSecret || ''}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="Enter your API secret"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    <strong>How to get API Key:</strong><br />
                    1. Login to ERPNext<br />
                    2. Go to User → API Access<br />
                    3. Generate API Key and Secret
                  </p>
                </div>
              </div>
            )}

            {/* Password Authentication */}
            {authMethod === 'password' && (
              <div className="space-y-4 bg-slate-950/50 border border-slate-700/50 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={config.username || ''}
                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-xs text-amber-400">
                    <strong>Note:</strong> You need to login first before fetching data. The 403 error means you're not authenticated yet.
                  </p>
                </div>
              </div>
            )}

            {/* Test Connection */}
            <div>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Test Connection
                  </>
                )}
              </button>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg border ${
                    testResult.success
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <p className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResult.message}
                  </p>
                </div>
              )}
            </div>

            {/* CORS & Auth Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Important Notes
              </h3>
              <ul className="text-xs text-amber-300 space-y-1 list-disc list-inside">
                <li><strong>403 FORBIDDEN:</strong> You need to login first. Click "Test Connection" to authenticate.</li>
                <li><strong>CORS:</strong> Install "Allow CORS" browser extension if you get CORS errors</li>
                <li><strong>API Key:</strong> Recommended for better security and fewer issues</li>
                <li><strong>Fallback:</strong> Manual copy-paste always works if automation fails</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              Clear Settings
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-lg shadow-primary-500/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ERPSettings;
