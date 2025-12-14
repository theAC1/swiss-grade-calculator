import React, { useMemo } from 'react';
import { GradingConfig, Language } from '../types';
import { getMinPointsForGrade, TRANSLATIONS } from '../utils';

interface GradeScaleTableProps {
  config: GradingConfig;
  lang: Language;
}

const GradeScaleTable: React.FC<GradeScaleTableProps> = ({ config, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const scaleRows = useMemo(() => {
    const rows: { grade: number; minPoints: number }[] = [];
    const step = config.roundingStep;
    const epsilon = 0.0001;
    
    for (let g = config.gradeMax; g >= config.gradeMin; g -= step) {
      const currentGrade = Math.round(g * 100) / 100;
      let minRawGrade = currentGrade - (step / 2);
      
      if (currentGrade === config.gradeMin) {
        rows.push({ grade: currentGrade, minPoints: 0 });
        continue;
      }
      
      // We clamp minRawGrade to be at least MinGrade to avoid calculation errors
      if (minRawGrade < config.gradeMin) minRawGrade = config.gradeMin;

      let points = getMinPointsForGrade(minRawGrade + epsilon, config);
      points = Math.max(0, Math.min(config.maxPossiblePoints, points));
      
      rows.push({ grade: currentGrade, minPoints: points });
    }
    return rows;
  }, [config]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-lg text-slate-800">{t.gradeScale}</h2>
        <p className="text-xs text-slate-500">Step {config.roundingStep}</p>
      </div>
      
      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium">{t.grade}</th>
              <th className="px-6 py-3 font-medium text-right">Min. {t.points}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scaleRows.map((row) => (
              <tr key={row.grade} className={`hover:bg-slate-50 ${row.grade >= 4.0 ? 'bg-white' : 'bg-red-50/30'}`}>
                <td className="px-6 py-2 font-bold text-slate-700">
                  <span className={`px-2 py-0.5 rounded ${
                      row.grade >= 4.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {row.grade.toFixed(config.roundingStep === 1 ? 0 : config.roundingStep === 0.25 ? 2 : 1)}
                  </span>
                </td>
                <td className="px-6 py-2 text-right font-mono text-slate-600">
                  {row.minPoints.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeScaleTable;