import React, { useState } from 'react';
import { DaySummary, formatHoursMinutes } from '../utils/timeParser';

interface TimelineCycleProps {
  summary: DaySummary;
}

const TimelineCycle: React.FC<TimelineCycleProps> = ({ summary }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate hourly timeline from 0-24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Parse time string (HH:MM) to decimal hours
  const timeToDecimal = (timeStr: string): number => {
    if (timeStr === 'Now') {
      const now = new Date();
      return now.getHours() + now.getMinutes() / 60;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  // Calculate breaks between sessions
  const getBreaks = () => {
    const breaks: { start: number; end: number }[] = [];
    for (let i = 0; i < summary.intervals.length - 1; i++) {
      const currentEnd = timeToDecimal(summary.intervals[i].end);
      const nextStart = timeToDecimal(summary.intervals[i + 1].start);
      if (nextStart > currentEnd) {
        breaks.push({ start: currentEnd, end: nextStart });
      }
    }
    return breaks;
  };

  const breaks = getBreaks();

  // Check if a time falls within a work session
  const isInWorkSession = (hour: number): { inSession: boolean; sessionIndex: number } => {
    for (let i = 0; i < summary.intervals.length; i++) {
      const start = timeToDecimal(summary.intervals[i].start);
      const end = timeToDecimal(summary.intervals[i].end);
      if (hour >= start && hour < end) {
        return { inSession: true, sessionIndex: i };
      }
    }
    return { inSession: false, sessionIndex: -1 };
  };

  // Check if a time falls within a break
  const isInBreak = (hour: number): boolean => {
    for (const breakPeriod of breaks) {
      if (hour >= breakPeriod.start && hour < breakPeriod.end) {
        return true;
      }
    }
    return false;
  };

  // Get current time for clock hands
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentMinute = now.getMinutes() + now.getSeconds() / 60;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>View Timeline</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Modal Content - Much Smaller */}
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-xl shadow-2xl animate-scaleIn">
            {/* Header - Compact */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-xl">🕐</span>
                    24-Hour Work Clock
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{summary.date}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Legend - Compact */}
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                  <span className="text-slate-300">Work</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                  <span className="text-slate-300">Break</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                  <span className="text-slate-300">Inactive</span>
                </div>
              </div>
            </div>

            {/* Content - Compact */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Clock - Smaller */}
                <div className="flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-xs">
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl">
                      {/* Definitions */}
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <radialGradient id="clockFace" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </radialGradient>
                      </defs>

                      {/* Clock outer rim */}
                      <circle cx="200" cy="200" r="190" fill="none" stroke="#334155" strokeWidth="3" />
                      
                      {/* Clock face background */}
                      <circle cx="200" cy="200" r="187" fill="url(#clockFace)" />

                      {/* Hour segments (colored rings) */}
                      {hours.map((hour) => {
                        const angle = (hour * 15) - 90;
                        const nextAngle = ((hour + 1) * 15) - 90;
                        
                        const workStatus = isInWorkSession(hour);
                        const inBreak = isInBreak(hour);
                        
                        let color = '#1e293b';
                        let opacity = 0.3;
                        if (workStatus.inSession) {
                          color = '#22c55e';
                          opacity = 0.8;
                        } else if (inBreak) {
                          color = '#f59e0b';
                          opacity = 0.7;
                        }

                        const innerRadius = 160;
                        const outerRadius = 185;
                        
                        const startAngleRad = (angle * Math.PI) / 180;
                        const endAngleRad = (nextAngle * Math.PI) / 180;
                        
                        const x1 = 200 + innerRadius * Math.cos(startAngleRad);
                        const y1 = 200 + innerRadius * Math.sin(startAngleRad);
                        const x2 = 200 + outerRadius * Math.cos(startAngleRad);
                        const y2 = 200 + outerRadius * Math.sin(startAngleRad);
                        const x3 = 200 + outerRadius * Math.cos(endAngleRad);
                        const y3 = 200 + outerRadius * Math.sin(endAngleRad);
                        const x4 = 200 + innerRadius * Math.cos(endAngleRad);
                        const y4 = 200 + innerRadius * Math.sin(endAngleRad);

                        const pathData = `
                          M ${x1} ${y1}
                          L ${x2} ${y2}
                          A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
                          L ${x4} ${y4}
                          A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
                          Z
                        `;

                        return (
                          <path
                            key={hour}
                            d={pathData}
                            fill={color}
                            fillOpacity={opacity}
                            stroke="#0f172a"
                            strokeWidth="0.5"
                            className="transition-all duration-200"
                            filter={workStatus.inSession || inBreak ? "url(#glow)" : ""}
                          />
                        );
                      })}

                      {/* Hour markers and numbers */}
                      {hours.map((hour) => {
                        const angle = (hour * 15) - 90;
                        const angleRad = (angle * Math.PI) / 180;
                        
                        const tickStart = 152;
                        const tickEnd = hour % 6 === 0 ? 135 : 142;
                        
                        const x1 = 200 + tickStart * Math.cos(angleRad);
                        const y1 = 200 + tickStart * Math.sin(angleRad);
                        const x2 = 200 + tickEnd * Math.cos(angleRad);
                        const y2 = 200 + tickEnd * Math.sin(angleRad);

                        return (
                          <g key={hour}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={hour % 6 === 0 ? "#94a3b8" : "#475569"}
                              strokeWidth={hour % 6 === 0 ? "2.5" : "1.5"}
                              strokeLinecap="round"
                            />
                            
                            {hour % 3 === 0 && (
                              <text
                                x={200 + 120 * Math.cos(angleRad)}
                                y={200 + 120 * Math.sin(angleRad) + 5}
                                textAnchor="middle"
                                className="fill-slate-300 text-base font-bold"
                                style={{ fontFamily: 'monospace' }}
                              >
                                {hour}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Center circle */}
                      <circle cx="200" cy="200" r="60" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
                      
                      {/* Center text */}
                      <text x="200" y="195" textAnchor="middle" className="fill-slate-100 text-2xl font-bold">
                        {summary.totalFormatted}
                      </text>
                      <text x="200" y="212" textAnchor="middle" className="fill-slate-400 text-xs font-medium">
                        Total Hours
                      </text>

                      {/* Clock hands for current time */}
                      {summary.intervals.some(i => i.end === 'Now') && (
                        <>
                          <line
                            x1="200"
                            y1="200"
                            x2={200 + 60 * Math.cos(((currentHour * 15) - 90) * Math.PI / 180)}
                            y2={200 + 60 * Math.sin(((currentHour * 15) - 90) * Math.PI / 180)}
                            stroke="#3b82f6"
                            strokeWidth="5"
                            strokeLinecap="round"
                            filter="url(#glow)"
                          />
                          
                          <line
                            x1="200"
                            y1="200"
                            x2={200 + 90 * Math.cos(((currentMinute * 6) - 90) * Math.PI / 180)}
                            y2={200 + 90 * Math.sin(((currentMinute * 6) - 90) * Math.PI / 180)}
                            stroke="#60a5fa"
                            strokeWidth="3"
                            strokeLinecap="round"
                            filter="url(#glow)"
                          />
                        </>
                      )}

                      {/* Session markers */}
                      {summary.intervals.map((interval, idx) => {
                        const startTime = timeToDecimal(interval.start);
                        const endTime = timeToDecimal(interval.end);
                        const startAngle = (startTime * 15) - 90;
                        const endAngle = (endTime * 15) - 90;
                        
                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = (endAngle * Math.PI) / 180;
                        
                        const markerRadius = 172;
                        
                        return (
                          <g key={idx}>
                            <circle
                              cx={200 + markerRadius * Math.cos(startAngleRad)}
                              cy={200 + markerRadius * Math.sin(startAngleRad)}
                              r="6"
                              fill="#22c55e"
                              stroke="#0f172a"
                              strokeWidth="2"
                              filter="url(#glow)"
                            />
                            
                            {interval.end !== 'Now' && (
                              <circle
                                cx={200 + markerRadius * Math.cos(endAngleRad)}
                                cy={200 + markerRadius * Math.sin(endAngleRad)}
                                r="6"
                                fill="#ef4444"
                                stroke="#0f172a"
                                strokeWidth="2"
                                filter="url(#glow)"
                              />
                            )}
                          </g>
                        );
                      })}

                      <circle cx="200" cy="200" r="8" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Details Panel - Compact */}
                <div className="space-y-4">
                  {/* Session Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                      <span className="text-green-400 text-xs">●</span>
                      Work Sessions
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {summary.intervals.map((interval, idx) => (
                        <div
                          key={idx}
                          className="group bg-slate-800/50 hover:bg-slate-800 rounded-lg p-2.5 border border-slate-700/50 hover:border-green-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-bold group-hover:scale-110 transition-transform">
                                {idx + 1}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-green-400 font-mono font-semibold">{interval.start}</span>
                                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-red-400 font-mono font-semibold">{interval.end}</span>
                              </div>
                            </div>
                            <span className="text-primary-400 font-bold text-sm">
                              {formatHoursMinutes(interval.durationHours)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Break Details */}
                  {breaks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                        <span className="text-amber-400 text-xs">●</span>
                        Breaks
                      </h3>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {breaks.map((breakPeriod, idx) => {
                          const duration = breakPeriod.end - breakPeriod.start;
                          const startHour = Math.floor(breakPeriod.start);
                          const startMin = Math.round((breakPeriod.start - startHour) * 60);
                          const endHour = Math.floor(breakPeriod.end);
                          const endMin = Math.round((breakPeriod.end - endHour) * 60);
                          
                          return (
                            <div
                              key={idx}
                              className="group bg-amber-500/5 hover:bg-amber-500/10 rounded-lg p-2.5 border border-amber-500/20 hover:border-amber-500/40 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm group-hover:scale-110 transition-transform">
                                    ☕
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-amber-400 font-mono font-semibold">
                                      {String(startHour).padStart(2, '0')}:{String(startMin).padStart(2, '0')}
                                    </span>
                                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="text-amber-400 font-mono font-semibold">
                                      {String(endHour).padStart(2, '0')}:{String(endMin).padStart(2, '0')}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-amber-400 font-bold text-sm">
                                  {formatHoursMinutes(duration)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TimelineCycle;
