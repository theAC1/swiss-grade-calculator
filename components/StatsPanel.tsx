import React from 'react';
import { Stats, Language } from '../types';
import { TRANSLATIONS } from '../utils';
import { Calculator, TrendingUp, Users, AlertCircle } from 'lucide-react';

interface StatsPanelProps {
  stats: Stats;
  lang: Language;
  variant?: 'cards' | 'tile';
  className?: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, lang, variant = 'cards', className = '' }) => {
  const t = TRANSLATIONS[lang];
  
  const items = [
    { label: t.stats.avg, value: stats.average, icon: Calculator, color: "bg-blue-500 text-blue-600" },
    { label: t.stats.median, value: stats.median, icon: TrendingUp, color: "bg-indigo-500 text-indigo-600" },
    { label: t.stats.passRate, value: `${stats.passRate}%`, icon: Users, color: stats.passRate >= 80 ? "bg-emerald-500 text-emerald-600" : "bg-orange-500 text-orange-600" },
    { label: t.stats.stdDev, value: stats.stdDev, icon: AlertCircle, color: "bg-slate-500 text-slate-600" }
  ];

  if (variant === 'tile') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden ${className}`}>
        {items.map((item, idx) => (
          <div key={idx} className="p-4 flex items-center justify-center gap-3">
             <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
                <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">{item.label}</p>
                <p className="text-lg font-bold text-slate-800">{item.value}</p>
              </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
              <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">{item.label}</p>
              <p className="text-lg font-bold text-slate-800">{item.value}</p>
            </div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;