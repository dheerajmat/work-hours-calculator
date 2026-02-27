import React, { useState } from 'react';
import { DaySummary } from '../utils/timeParser';
import BreakSummary from './BreakSummary';
import OvertimeSummary from './OvertimeSummary';

interface SummaryReportProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: DaySummary[];
}

type TabType = 'break' | 'overtime';

const SummaryReport: React.FC<SummaryReportProps> = ({ isOpen, onClose, summaries }) => {
  const [activeTab, setActiveTab] = useState<TabType>('break');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            📊 Summary Report
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6">
          <button
            onClick={() => setActiveTab('break')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'break'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            ☕ Break Summary
          </button>
          <button
            onClick={() => setActiveTab('overtime')}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === 'overtime'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🔥 Overtime Summary
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'break' ? (
            <BreakSummary summaries={summaries} />
          ) : (
            <OvertimeSummary summaries={summaries} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;
