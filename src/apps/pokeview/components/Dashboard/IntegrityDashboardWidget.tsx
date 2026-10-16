/**
 * @file IntegrityDashboardWidget.tsx
 * @package pokeview
 * @description Dashboard widget displaying project integrity scan results and warnings.
 */

import React, { useState } from 'react';
import { DecompiledProject } from '@/src/packages/pokedcomp/types.ts';
import { IntegrityChecker, IntegrityIssue } from '@/src/services/integrityChecker.ts';
import { ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Filter, Wrench } from 'lucide-react';

interface IntegrityDashboardWidgetProps {
  project: DecompiledProject;
  onUpdateProject?: (project: DecompiledProject) => void;
}

export const IntegrityDashboardWidget: React.FC<IntegrityDashboardWidgetProps> = ({
  project,
  onUpdateProject
}) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [repairMsg, setRepairMsg] = useState<string>('');
  const issues = IntegrityChecker.checkProject(project);

  const filtered = issues.filter(i => {
    if (filter === 'error') return i.severity === 'error';
    if (filter === 'warning') return i.severity === 'warning';
    return true;
  });

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  const handleAutoRepair = () => {
    const { repairedProject, fixCount } = IntegrityChecker.repairProject(project);
    if (onUpdateProject) {
      onUpdateProject(repairedProject);
    }
    setRepairMsg(`Successfully auto-repaired ${fixCount} project issues!`);
    setTimeout(() => setRepairMsg(''), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto text-slate-100">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {repairMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{repairMsg}</span>
          </div>
        )}
        {/* Header Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
              errorCount > 0 ? 'bg-rose-600' : warningCount > 0 ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {errorCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Project Integrity & Reference Dashboard
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time traversal scanner inspecting references across maps, species, trainers, moves, and items.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(errorCount > 0 || warningCount > 0) && onUpdateProject && (
              <button
                onClick={handleAutoRepair}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Auto-Repair All</span>
              </button>
            )}
            <div className="text-right">
              <div className="text-sm font-mono font-bold text-white">
                {errorCount} Errors · {warningCount} Warnings
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Status: {errorCount > 0 ? 'Action Required' : 'Healthy'}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Issues:</span>
          </div>
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${filter === 'error' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Errors ({errorCount})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${filter === 'warning' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Warnings ({warningCount})
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-2.5">
          {filtered.map(iss => (
            <div
              key={iss.id}
              className={`p-4 rounded-xl border text-xs flex items-start gap-3.5 ${
                iss.severity === 'error'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : iss.severity === 'warning'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}
            >
              {iss.severity === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : iss.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wider opacity-80">
                    [{iss.category}]
                  </span>
                  <span className="font-mono text-[10px] opacity-60">{iss.id}</span>
                </div>
                <div className="leading-relaxed">{iss.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
