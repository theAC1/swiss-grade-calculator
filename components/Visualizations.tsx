import React, { useMemo } from 'react';
import { Student, GradingConfig, Language } from '../types';
import { calculateRawGrade, TRANSLATIONS } from '../utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine
} from 'recharts';

interface VisualizationsProps {
  students: Student[];
  config: GradingConfig;
  lang: Language;
}

const Visualizations: React.FC<VisualizationsProps> = ({ students, config, lang }) => {
  const t = TRANSLATIONS[lang];

  // Prepare Distribution Data
  const distributionData = useMemo(() => {
    const buckets = [
      { name: '1.0-1.9', min: 1, max: 2, count: 0, fill: '#ef4444' },
      { name: '2.0-2.9', min: 2, max: 3, count: 0, fill: '#f87171' },
      { name: '3.0-3.9', min: 3, max: 4, count: 0, fill: '#fca5a5' },
      { name: '4.0-4.9', min: 4, max: 5, count: 0, fill: '#34d399' },
      { name: '5.0-5.9', min: 5, max: 6, count: 0, fill: '#10b981' },
      { name: '6.0', min: 6, max: 7, count: 0, fill: '#059669' },
    ];

    students.forEach(s => {
      const g = s.grade;
      if (g >= 6) buckets[5].count++;
      else if (g >= 5) buckets[4].count++;
      else if (g >= 4) buckets[3].count++;
      else if (g >= 3) buckets[2].count++;
      else if (g >= 2) buckets[1].count++;
      else buckets[0].count++;
    });

    return buckets;
  }, [students]);

  // Prepare Curve Data
  const curveData = useMemo(() => {
    const data = [];
    const steps = 50; 
    const stepSize = config.maxPossiblePoints / steps;
    
    for (let i = 0; i <= steps; i++) {
      const points = i * stepSize;
      const grade = calculateRawGrade(points, config);
      data.push({ points: parseFloat(points.toFixed(1)), grade });
    }
    // Ensure exact key points are hit for visual correctness
    // We add them and sort
    data.push({ points: config.pointsFor4, grade: 4.0 });
    data.push({ points: config.pointsFor6, grade: 6.0 });
    
    return data.sort((a,b) => a.points - b.points);
  }, [config]);

  return (
    <div className="space-y-6">
      
      {/* Distribution Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:break-inside-avoid">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">{t.gradeDistribution}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Curve Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:break-inside-avoid">
         <h3 className="text-sm font-semibold text-slate-600 mb-4">{t.gradingCurve}</h3>
         <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="points" 
                type="number" 
                domain={[0, config.maxPossiblePoints]} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                label={{ value: t.points, position: 'insideBottomRight', offset: -5, fontSize: 10 }} 
              />
              <YAxis 
                domain={[config.gradeMin, config.gradeMax]} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickCount={6}
              />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <ReferenceLine y={4} stroke="#10b981" strokeDasharray="3 3" />
              {/* Show vertical line for Pass Point */}
              <ReferenceLine x={config.pointsFor4} stroke="#f59e0b" strokeDasharray="3 3" />
              
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};

export default Visualizations;