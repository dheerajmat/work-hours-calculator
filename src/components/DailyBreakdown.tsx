import React from 'react';
import { DaySummary, formatHoursMinutes } from '../utils/timeParser';
import TimelineCycle from './TimelineCycle';

interface DailyBreakdownProps {
  summary: DaySummary;
  compact?: boolean;
}

const DailyBreakdown: React.FC<DailyBreakdownProps> = ({ summary, compact = false }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg ${compact ? 'p-4' : 'p-5'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
              {summary.date}
            </h3>
            {summary.isToday && (
              <span className="bg-primary-500/20 text-primary-400 text-xs font-semibold px-2 py-0.5 rounded">
                TODAY
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs">{summary.name}</p>
        </div>
        <div className="text-right">
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-slate-100`}>
            {summary.totalFormatted}
          </p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
      </div>

      {/* Goal Status - Enhanced with live updates */}
      <div className={`flex ${compact ? 'flex-col gap-2' : 'items-center gap-4'} mb-3 pb-3 border-b border-slate-800`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Goal (8h)</span>
          {summary.isOvertime ? (
            <span className="badge-warning-compact">
              {summary.remainingFormattedWithSeconds} Overtime
            </span>
          ) : summary.remaining === 0 ? (
            <span className="badge-success-compact animate-pulse">
              🎉 Goal Reached!
            </span>
          ) : (
            <span className="badge-info-compact font-mono">
              {summary.remainingFormattedWithSeconds} Remaining
            </span>
          )}
        </div>
        
        {summary.currentlyWorking && summary.leaveByTime && (
          <div className={`flex items-center gap-2 ${compact ? '' : 'ml-auto'}`}>
            <span className="text-xs text-slate-400">Leave by</span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-full text-xs font-semibold">
              {summary.leaveByTime}
            </span>
          </div>
        )}
      </div>

      {/* Event Timeline */}
      {!compact && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300">Event Timeline</h4>
            <TimelineCycle summary={summary} />
          </div>
          <div className="space-y-2">
            {summary.intervals.map((interval, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono text-xs">{interval.start}</span>
                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-slate-300 font-mono text-xs">{interval.end}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary-400 font-semibold text-xs">
                    {formatHoursMinutes(interval.durationHours)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Timeline */}
      {compact && (
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2">
            {summary.intervals.length} Session{summary.intervals.length !== 1 ? 's' : ''}
          </h4>
          <div className="space-y-1">
            {summary.intervals.map((interval, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-800/50 rounded p-2 text-xs"
              >
                <span className="text-slate-400 font-mono">
                  {interval.start} → {interval.end}
                </span>
                <span className="text-primary-400 font-semibold">
                  {formatHoursMinutes(interval.durationHours)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBreakdown;
