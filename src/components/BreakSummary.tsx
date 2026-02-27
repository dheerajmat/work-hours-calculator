import React, { useState } from 'react';
import { DaySummary, formatHoursMinutes } from '../utils/timeParser';

interface BreakSummaryProps {
  summaries: DaySummary[];
}

const BreakSummary: React.FC<BreakSummaryProps> = ({ summaries }) => {
  const [excludedDays, setExcludedDays] = useState<Set<string>>(new Set());

  // Filter summaries with break time
  const daysWithBreaks = summaries.filter(s => s.breakHours > 0);

  // Toggle exclude day
  const toggleExclude = (date: string) => {
    const newExcluded = new Set(excludedDays);
    if (newExcluded.has(date)) {
      newExcluded.delete(date);
    } else {
      newExcluded.add(date);
    }
    setExcludedDays(newExcluded);
  };

  // Calculate totals (excluding selected days)
  const includedDays = daysWithBreaks.filter(s => !excludedDays.has(s.date));
  const totalBreakTime = includedDays.reduce((sum, s) => sum + s.breakHours, 0);
  const daysWithExcessBreak = includedDays.filter(s => s.breakExceeded).length;

  // Export function
  const exportBreakSummary = () => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let content = 'BREAK TIME SUMMARY REPORT\n';
    content += '=========================\n';
    content += `Generated: ${timestamp}\n\n`;
    content += 'Date          | Employee Name                | Break Time | Status\n';
    content += '----------------------------------------------------------------\n';

    includedDays.forEach(summary => {
      const date = summary.date.padEnd(13);
      const name = summary.name.padEnd(28);
      const breakTime = summary.breakFormatted.padEnd(10);
      const status = summary.breakExceeded ? '⚠️ Exceeds 1h' : '✓ OK';
      content += `${date} | ${name} | ${breakTime} | ${status}\n`;
    });

    content += '\n';
    content += `Total Break Time: ${formatHoursMinutes(totalBreakTime)}\n`;
    content += `Days with Break > 1h: ${daysWithExcessBreak}\n`;
    content += `Total Days: ${includedDays.length}\n`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `break-summary-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Days</p>
          <p className="text-2xl font-bold text-slate-100">{includedDays.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Break Time</p>
          <p className="text-2xl font-bold text-blue-400">{formatHoursMinutes(totalBreakTime)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Days Exceeding 1h</p>
          <p className="text-2xl font-bold text-red-400">{daysWithExcessBreak}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Break Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">Exclude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {daysWithBreaks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No break time data available
                  </td>
                </tr>
              ) : (
                daysWithBreaks.map((summary) => (
                  <tr
                    key={summary.date}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      excludedDays.has(summary.date) ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-slate-300">{summary.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{summary.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-400">
                      {summary.breakFormatted}
                    </td>
                    <td className="px-4 py-3">
                      {summary.breakExceeded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                          ⚠️ Exceeds 1h
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                          ✓ OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={excludedDays.has(summary.date)}
                        onChange={() => toggleExclude(summary.date)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportBreakSummary}
          disabled={includedDays.length === 0}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Break Summary
        </button>
      </div>
    </div>
  );
};

export default BreakSummary;
