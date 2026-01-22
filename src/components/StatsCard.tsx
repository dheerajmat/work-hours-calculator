import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  icon?: string;
  color?: 'primary' | 'secondary';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color = 'primary' }) => {
  return (
    <div className="stat-card-compact">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color === 'primary' ? 'text-primary-400' : 'text-slate-100'}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div className="text-2xl opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
