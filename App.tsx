import React, { useState, useEffect, useMemo } from 'react';
import { GradingConfig, AlgorithmType, Student, Language } from './types';
import { calculateGrade, calculateStats, generateId, TRANSLATIONS } from './utils';
import ConfigPanel from './components/ConfigPanel';
import StudentTable from './components/StudentTable';
import Visualizations from './components/Visualizations';
import StatsPanel from './components/StatsPanel';
import GradeScaleTable from './components/GradeScaleTable';
import { Printer, LayoutTemplate, Presentation, Languages } from 'lucide-react';

// Default Data
const DEFAULT_STUDENTS: Student[] = [
  { id: '1', name: 'Anna Muster', points: 42, grade: 0, isPassing: false },
  { id: '2', name: 'Beat Beispiel', points: 35, grade: 0, isPassing: false },
  { id: '3', name: 'Charlie Code', points: 58, grade: 0, isPassing: false },
  { id: '4', name: 'Dora Demo', points: 21, grade: 0, isPassing: false },
  { id: '5', name: 'Emil Example', points: 49, grade: 0, isPassing: false },
];

const DEFAULT_CONFIG: GradingConfig = {
  maxPossiblePoints: 60,
  pointsFor6: 55, // 6.0 at 55
  pointsFor4: 33, // 4.0 at 33 (60% of 55)
  gradeMin: 1.0,
  gradeMax: 6.0,
  roundingStep: 0.5,
  algorithm: AlgorithmType.LINEAR,
};

function App() {
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [config, setConfig] = useState<GradingConfig>(DEFAULT_CONFIG);
  const [isReportMode, setIsReportMode] = useState(false);
  const [lang, setLang] = useState<Language>('de');

  const t = TRANSLATIONS[lang];

  // Real-time calculation effect
  const calculatedStudents = useMemo(() => {
    return students.map(s => {
      const g = calculateGrade(s.points, config);
      return {
        ...s,
        grade: g,
        isPassing: g >= 4.0
      };
    });
  }, [students, config]);

  const stats = useMemo(() => calculateStats(calculatedStudents), [calculatedStudents]);

  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  const toggleReportMode = () => {
    setIsReportMode(!isReportMode);
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-all flex flex-col ${isReportMode ? 'p-8 bg-white' : 'p-4 md:p-8'}`}>
      
      {/* Top Navigation / Header */}
      <header className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-8 h-8 text-indigo-600" />
            Notenrechner
            {isReportMode && <span className="text-slate-400 text-lg font-normal ml-2">{t.classroomMode}</span>}
          </h1>
          <p className="text-slate-500 mt-1">Swiss Grade Calculator</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleReportMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
              isReportMode 
              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' 
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isReportMode ? (
              <> <LayoutTemplate size={18} /> {t.editView} </>
            ) : (
              <> <Presentation size={18} /> {t.reportView} </>
            )}
          </button>
          {isReportMode && (
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm"
            >
              <Printer size={18} /> Print
            </button>
          )}
        </div>
      </header>

      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t.gradingCurve} Report</h1>
        <p className="text-slate-600">{new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-7xl mx-auto w-full flex flex-col gap-6 flex-1">
        
        {/* Full-width Stats Tile in Report Mode */}
        {isReportMode && (
           <StatsPanel stats={stats} lang={lang} variant="tile" className="w-full" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Left Column */}
          <div className={`space-y-6 lg:col-span-4 ${isReportMode ? 'order-2 lg:order-1' : ''}`}>
            
            {/* Config Panel - Hidden in Report Mode */}
            {!isReportMode && (
               <ConfigPanel config={config} onChange={setConfig} lang={lang} />
            )}

            {/* In Report Mode, we show Charts on left (or they wrap) */}
            <Visualizations students={calculatedStudents} config={config} lang={lang} />
            
            {/* Stats Summary Panel - Only in Edit Mode (Sidebar) */}
            {!isReportMode && (
               <StatsPanel stats={stats} lang={lang} variant="cards" />
            )}
          </div>

          {/* Right Column: Content changes based on mode */}
          <div className={`lg:col-span-8 space-y-6 flex flex-col h-full ${isReportMode ? 'order-1 lg:order-2' : ''}`}>
            
            {isReportMode ? (
              /* Report View: Show Notenspiegel (Grade Scale) instead of students */
              <div className="flex-1 min-h-[500px]">
                <GradeScaleTable config={config} lang={lang} />
              </div>
            ) : (
              /* Edit View: Show Student List */
              <div className="flex-1 min-h-[500px]">
                <StudentTable 
                  students={calculatedStudents} 
                  config={config} 
                  onUpdateStudents={handleUpdateStudents}
                  lang={lang} 
                />
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-slate-200 flex justify-between items-end print:hidden">
         <p className="text-slate-400 text-sm">
           {t.generatedBy}
         </p>

         {/* Language Switcher */}
         <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Languages size={16} className="ml-2 text-slate-400" />
            <div className="flex">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('de')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'de' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                DE
              </button>
              <button 
                onClick={() => setLang('fr')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'fr' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                FR
              </button>
            </div>
         </div>
      </footer>
      
      {/* Print Footer */}
       <footer className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm print:fixed print:bottom-0 print:w-full">
          <p>{t.generatedBy}</p>
        </footer>
    </div>
  );
}

export default App;