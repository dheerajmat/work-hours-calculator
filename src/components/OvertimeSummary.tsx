import React, { useState, useEffect } from 'react';
import { DaySummary, formatHoursMinutes } from '../utils/timeParser';

interface OvertimeSummaryProps {
  summaries: DaySummary[];
}

interface OvertimeDescription {
  [date: string]: string;
}

const STORAGE_KEY = 'workHoursCalc_overtimeDescriptions';

const OvertimeSummary: React.FC<OvertimeSummaryProps> = ({ summaries }) => {
  const [descriptions, setDescriptions] = useState<OvertimeDescription>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // Load descriptions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDescriptions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load overtime descriptions:', e);
      }
    }
  }, []);

  // Save descriptions to localStorage
  const saveDescriptions = (newDescriptions: OvertimeDescription) => {
    setDescriptions(newDescriptions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDescriptions));
  };

  // Filter summaries with overtime
  const daysWithOvertime = summaries.filter(s => s.isOvertime && s.overtimeHours > 0);

  // Calculate totals
  const totalOvertimeHours = daysWithOvertime.reduce((sum, s) => sum + s.overtimeHours, 0);

  // Export function
  const exportOvertimeReport = () => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let content = 'OVERTIME REPORT\n';
    content += '===============\n';
    content += `Generated: ${timestamp}\n\n`;

    daysWithOvertime.forEach((summary, index) => {
      content += `Date: ${summary.date}\n`;
      content += `Employee: ${summary.name}\n`;
      content += `Overtime: ${summary.overtimeFormatted}\n`;
      content += `Work Description: ${descriptions[summary.date] || 'No description provided'}\n`;
      
      if (index < daysWithOvertime.length - 1) {
        content += '\n---\n\n';
      }
    });

    content += '\n\n';
    content += '=========================\n';
    content += `Total Overtime: ${formatHoursMinutes(totalOvertimeHours)}\n`;
    content += `Total Days: ${daysWithOvertime.length}\n`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overtime-report-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update description
  const updateDescription = (date: string, description: string) => {
    const newDescriptions = { ...descriptions, [date]: description };
    saveDescriptions(newDescriptions);
    setEditingDate(null);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Days with Overtime</p>
          <p className="text-2xl font-bold text-slate-100">{daysWithOvertime.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Overtime Hours</p>
          <p className="text-2xl font-bold text-amber-400">{formatHoursMinutes(totalOvertimeHours)}</p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Overtime</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Work Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {daysWithOvertime.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No overtime data available
                  </td>
                </tr>
              ) : (
                daysWithOvertime.map((summary) => (
                  <tr key={summary.date} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-300">{summary.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{summary.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-amber-400">
                      {summary.overtimeFormatted}
                    </td>
                    <td className="px-4 py-3">
                      {editingDate === summary.date ? (
                        <input
                          type="text"
                          defaultValue={descriptions[summary.date] || ''}
                          onBlur={(e) => updateDescription(summary.date, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateDescription(summary.date, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingDate(null);
                            }
                          }}
                          autoFocus
                          placeholder="Enter work description..."
                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <div className="text-sm text-slate-300">
                          {descriptions[summary.date] || (
                            <span className="text-slate-500 italic">No description</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingDate === summary.date ? (
                        <button
                          onClick={() => setEditingDate(null)}
                          className="text-slate-400 hover:text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingDate(summary.date)}
                          className="text-primary-400 hover:text-primary-300 text-xs font-medium"
                        >
                          {descriptions[summary.date] ? 'Edit' : 'Add'}
                        </button>
                      )}
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
          onClick={exportOvertimeReport}
          disabled={daysWithOvertime.length === 0}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Overtime Report
        </button>
      </div>
    </div>
  );
};

export default OvertimeSummary;
