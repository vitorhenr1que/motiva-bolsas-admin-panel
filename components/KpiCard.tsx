
import React from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, color, loading }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
