import { useState, useEffect } from 'react';
import StatsCard from './components/StatsCard';
import DailyBreakdown from './components/DailyBreakdown';
import ERPSettings from './components/ERPSettings';
import SummaryReport from './components/SummaryReport';
import {
  parsePunches,
  computeDailySummary,
  calculateOverallStats,
  formatHoursMinutes,
  DaySummary,
} from './utils/timeParser';
import { ERPConfig, ERPClient, loadERPConfig } from './utils/erpClient';

// Local storage keys
const STORAGE_KEYS = {
  RAW_TEXT: 'workHoursCalc_rawText',
  GRID_VIEW: 'workHoursCalc_gridView',
};

function App() {
  // Load initial state from localStorage
  const [rawText, setRawText] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RAW_TEXT);
    return saved || '';
  });
  
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  
  const [gridView, setGridView] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GRID_VIEW);
    return saved === 'true';
  });
  
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [soundPlayed, setSoundPlayed] = useState(false);
  
  // ERP Integration states
  const [showERPSettings, setShowERPSettings] = useState(false);
  const [erpConfig, setErpConfig] = useState<ERPConfig | null>(null);
  const [fetchingFromERP, setFetchingFromERP] = useState(false);
  const [erpMessage, setErpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Summary Report state
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  // Load data from URL hash if present (from Chrome extension)
  // Extension opens: https://.../#data=BASE64_ENCODED_LOG_DATA
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      try {
        const encoded = hash.slice(6);
        const decoded = decodeURIComponent(escape(atob(encoded)));
        if (decoded.trim()) {
          setRawText(decoded);
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) {
        console.error('Failed to decode URL data:', e);
      }
    }
  }, []);

  // Load ERP config on mount
  useEffect(() => {
    const config = loadERPConfig();
    if (config) {
      setErpConfig(config);
    }
  }, []);

  // Save rawText to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RAW_TEXT, rawText);
  }, [rawText]);

  // Save gridView to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRID_VIEW, gridView.toString());
  }, [gridView]);

  // Auto-parse when rawText has data (on mount, or when loaded from URL hash)
  useEffect(() => {
    if (rawText.trim()) {
      handleParse();
    }
  }, [rawText]); // Re-run when rawText changes (e.g. from URL hash)

  // Auto-refresh every 1 second if there's data (for live "Now" updates with seconds)
  useEffect(() => {
    if (summaries.length > 0 && rawText.trim()) {
      const interval = setInterval(() => {
        handleParse();
      }, 1000); // Refresh every 1 second for live seconds updates
      return () => clearInterval(interval);
    }
  }, [summaries.length, rawText]);

  // Check for goal completion and play sound
  useEffect(() => {
    const todaySummary = summaries.find(s => s.isToday && s.currentlyWorking);
    if (todaySummary && todaySummary.remaining <= 0 && !todaySummary.isOvertime && !soundPlayed) {
      playNotificationSound();
      setSoundPlayed(true);
    }
    // Reset sound flag if remaining time goes back above 0
    if (todaySummary && todaySummary.remaining > 0) {
      setSoundPlayed(false);
    }
  }, [summaries, soundPlayed]);

  // Auto-dismiss ERP messages after 5 seconds
  useEffect(() => {
    if (erpMessage) {
      const timer = setTimeout(() => {
        setErpMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [erpMessage]);

  const playNotificationSound = () => {
    // Create a pleasant notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play a second tone
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  };

  const handleParse = () => {
    try {
      if (!rawText.trim()) {
        setError('Please paste some log data first.');
        setSummaries([]);
        return;
      }

      const records = parsePunches(rawText);
      if (!records.length) {
        setError('No valid IN/OUT records found. Please check the format. Expected format: Name on one line, IN/OUT on next line, Date-Time (DD-MM-YYYY HH:MM:SS) on next line.');
        setSummaries([]);
        return;
      }

      const dailySummaries = computeDailySummary(records, false); // Always show all days
      setSummaries(dailySummaries);
      setError(null);
      
      // Update timestamp
      const now = new Date();
      setLastUpdated(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    } catch (e) {
      console.error('Parse error:', e);
      setError(`Error parsing logs: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setSummaries([]);
    }
  };

  const handleClear = () => {
    setRawText('');
    setSummaries([]);
    setError(null);
    setErpMessage(null);
    localStorage.removeItem(STORAGE_KEYS.RAW_TEXT);
  };

  const handleFetchFromERP = async () => {
    if (!erpConfig) {
      setErpMessage({ type: 'error', text: 'Please configure ERP settings first' });
      setShowERPSettings(true);
      return;
    }

    setFetchingFromERP(true);
    setErpMessage(null);
    setError(null);

    try {
      const client = new ERPClient(erpConfig);

      // Calculate date range (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Use the combined login + fetch method
      const logData = await client.fetchCheckinsWithAuth(startDate, endDate);

      if (!logData || logData.trim().length === 0) {
        throw new Error('No data received from ERP. Please check your employee ID and date range.');
      }

      // Set the fetched data
      setRawText(logData);
      const recordCount = logData.split('\n').filter(l => l.includes('IN') || l.includes('OUT')).length;
      setErpMessage({ type: 'success', text: `Successfully fetched ${recordCount} records from ERP!` });

      // Auto-parse the fetched data
      setTimeout(() => {
        handleParse();
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setErpMessage({ type: 'error', text: errorMessage });
      console.error('ERP fetch error:', err);
    } finally {
      setFetchingFromERP(false);
    }
  };

  const handleERPConfigSave = (config: ERPConfig) => {
    setErpConfig(config);
    setErpMessage({ type: 'success', text: 'ERP settings saved successfully!' });
  };

  const stats = summaries.length > 0 ? calculateOverallStats(summaries) : null;

  const exampleText = `Dheeraj Deepak Mathur
IN
19-01-2026 10:54:14
Approved
1 h
0
·

Dheeraj Deepak Mathur
OUT
19-01-2026 15:31:15
Approved
2 h
0
·

Dheeraj Deepak Mathur
IN
19-01-2026 16:10:48
Approved
1 h
0
·`;

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                ⏱️ Work Hours Calculator
              </h1>
              <p className="text-slate-400 text-sm">
                Parse your logs instantly. Calculate working hours, breaks, and detect anomalies.
              </p>
            </div>
            {summaries.length > 0 && (
              <button
                onClick={() => setShowSummaryReport(true)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Summary Report
              </button>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-slate-400">
              Paste logs here or fetch from ERP...
            </label>
            <div className="flex items-center gap-2">
              {rawText && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
              <button
                onClick={() => setShowERPSettings(true)}
                className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-800 rounded-lg transition-all"
                title="ERP Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          <textarea
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder={exampleText}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleFetchFromERP}
              disabled={fetchingFromERP || !erpConfig}
              className="btn-primary-compact flex items-center gap-2"
              title={!erpConfig ? 'Configure ERP settings first' : 'Fetch data from ERP'}
            >
              {fetchingFromERP ? (
                <>
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Fetch from ERP
                </>
              )}
            </button>
            <button
              onClick={handleParse}
              className="btn-primary-compact"
            >
              Parse Logs
            </button>
            <button
              onClick={handleClear}
              className="btn-secondary-compact"
            >
              Clear
            </button>
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {summaries.length > 0 ? `${summaries.length} ${summaries.length === 1 ? 'entry' : 'entries'}` : 'Ready'}
            </div>
          </div>
        </div>

        {/* ERP Message */}
        {erpMessage && (
          <div className={`rounded-lg p-3 mb-6 border ${
            erpMessage.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 ${erpMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {erpMessage.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className={`text-xs ${erpMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {erpMessage.text}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <>
            {/* Overall Dashboard */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Overall Dashboard
                </h2>
                {stats.isCurrentlyWorking && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs text-green-400 font-semibold">Currently Working</span>
                  </div>
                )}
              </div>
              
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total Hours Worked */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">⏱️ Total Hours Worked</p>
                  <p className="text-3xl font-bold text-primary-400">{stats.totalFormatted}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.totalHours.toFixed(2)} hours</p>
                  {stats.isCurrentlyWorking && stats.todayRemaining > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      → {stats.projectedTotalFormatted} (projected)
                    </p>
                  )}
                </div>
                
                {/* Expected Hours */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">🎯 Expected Hours</p>
                  <p className="text-3xl font-bold text-slate-300">{stats.expectedFormatted}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.daysTracked} days × 9h</p>
                </div>
                
                {/* Difference (Overtime/Remaining) */}
                <div className={`bg-slate-950/50 rounded-lg p-4 border ${
                  stats.isOvertime ? 'border-amber-500/30' : 'border-blue-500/30'
                }`}>
                  <p className="text-slate-400 text-xs mb-1">
                    {stats.isOvertime ? '🔥 Total Overtime' : '⏳ Total Remaining'}
                  </p>
                  <p className={`text-3xl font-bold ${
                    stats.isOvertime ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {stats.differenceFormatted}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.isOvertime ? 'Above target' : 'Below target'}
                  </p>
                  {stats.isCurrentlyWorking && stats.todayRemaining > 0 && !stats.isOvertime && (
                    <p className="text-xs text-green-400 mt-1">
                      (After today: {stats.adjustedRemainingFormatted})
                    </p>
                  )}
                </div>
                
                {/* Average Per Day */}
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">📊 Average/Day</p>
                  <p className="text-3xl font-bold text-green-400">{stats.averageHoursPerDayFormatted}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.averageHoursPerDay.toFixed(2)} hours</p>
                </div>
              </div>
              
              {/* Today's Progress Banner (if currently working) */}
              {stats.isCurrentlyWorking && stats.todayRemaining > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-green-400 mb-1 flex items-center gap-2">
                        <span>🎯</span> Today's Goal Progress
                      </h3>
                      <p className="text-xs text-slate-400">
                        You're currently working. Complete today's goal to reduce overall remaining hours.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Remaining Today</p>
                      <p className="text-2xl font-bold text-green-400">{stats.todayRemainingFormatted}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Days Breakdown */}
                <div className="bg-slate-950/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>📅</span> Days Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total Days Tracked</span>
                      <span className="text-sm font-bold text-slate-100">{stats.daysTracked}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-400">✓ Goal Completed</span>
                      <span className="text-sm font-bold text-green-400">{stats.completedDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-amber-400">🔥 Overtime Days</span>
                      <span className="text-sm font-bold text-amber-400">{stats.overtimeDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-400">⏳ Remaining Days</span>
                      <span className="text-sm font-bold text-blue-400">{stats.remainingDays}</span>
                    </div>
                  </div>
                </div>
                
                {/* Overtime Summary */}
                <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <span>🔥</span> Overtime Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total Overtime</span>
                      <span className="text-sm font-bold text-amber-400">{stats.totalOvertimeFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Days with Overtime</span>
                      <span className="text-sm font-bold text-amber-400">{stats.overtimeDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Avg Overtime/Day</span>
                      <span className="text-sm font-bold text-amber-400">
                        {stats.overtimeDays > 0 
                          ? formatHoursMinutes(stats.totalOvertime / stats.overtimeDays)
                          : '0h'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Remaining Summary */}
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <span>⏳</span> Remaining Summary
                    {stats.isCurrentlyWorking && stats.todayRemaining > 0 && (
                      <span className="text-xs text-slate-500">(excl. today)</span>
                    )}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total Remaining</span>
                      <span className="text-sm font-bold text-blue-400">
                        {stats.isCurrentlyWorking && stats.todayRemaining > 0 
                          ? stats.adjustedRemainingFormatted 
                          : stats.totalRemainingFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Days with Remaining</span>
                      <span className="text-sm font-bold text-blue-400">
                        {stats.isCurrentlyWorking && stats.todayRemaining > 0 
                          ? stats.remainingDays - 1 
                          : stats.remainingDays}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Avg Remaining/Day</span>
                      <span className="text-sm font-bold text-blue-400">
                        {(() => {
                          const daysCount = stats.isCurrentlyWorking && stats.todayRemaining > 0 
                            ? stats.remainingDays - 1 
                            : stats.remainingDays;
                          const totalRem = stats.isCurrentlyWorking && stats.todayRemaining > 0 
                            ? stats.adjustedRemaining 
                            : stats.totalRemaining;
                          return daysCount > 0 
                            ? formatHoursMinutes(totalRem / daysCount)
                            : '0h';
                        })()}
                      </span>
                    </div>
                    {stats.isCurrentlyWorking && stats.todayRemaining > 0 && (
                      <div className="pt-2 mt-2 border-t border-blue-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-400">+ Today's Remaining</span>
                          <span className="text-xs font-semibold text-green-400">{stats.todayRemainingFormatted}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatsCard
                label="Total Hours"
                value={stats.totalFormatted}
                icon="⏱️"
                color="primary"
              />
              <StatsCard
                label="Days Tracked"
                value={stats.daysTracked.toString()}
                icon="📅"
                color="secondary"
              />
              <div className="stat-card-compact">
                <p className="text-slate-400 text-xs font-medium mb-2">Actions</p>
                <div className="flex gap-2 mb-2">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium py-2 px-2 rounded-lg transition-all">
                    📊 Export
                  </button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium py-2 px-2 rounded-lg transition-all">
                    📋 Copy
                  </button>
                </div>
                <button 
                  onClick={playNotificationSound}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium py-2 px-2 rounded-lg transition-all shadow-lg shadow-green-500/30"
                >
                  🔔 Test Notification Sound
                </button>
                {lastUpdated && (
                  <p className="text-xs text-slate-500 mt-2">
                    Updated: {lastUpdated}
                  </p>
                )}
              </div>
            </div>

            {/* Daily Breakdown Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-100">Daily Breakdown</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridView(!gridView)}
                    className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                      gridView
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {gridView ? '📊 Grid View' : '📋 List View'}
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Breakdown List/Grid */}
            <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {summaries.map((summary) => (
                <DailyBreakdown key={summary.date} summary={summary} compact={gridView} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!stats && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No data yet
            </h3>
            <p className="text-slate-500 mb-4">
              Paste your IN/OUT logs above or fetch data from ERP to get started.
            </p>
            {!erpConfig && (
              <button
                onClick={() => setShowERPSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure ERP Integration
              </button>
            )}
          </div>
        )}
      </div>

      {/* ERP Settings Modal */}
      <ERPSettings
        isOpen={showERPSettings}
        onClose={() => setShowERPSettings(false)}
        onSave={handleERPConfigSave}
      />
      
      {/* Summary Report Modal */}
      <SummaryReport
        isOpen={showSummaryReport}
        onClose={() => setShowSummaryReport(false)}
        summaries={summaries}
      />
    </div>
  );
}

export default App;
