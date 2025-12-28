import React, { useState } from 'react';
import { FileDown, FileText, Table, Loader2, Calendar, Filter, CheckCircle } from 'lucide-react';
import { Transaction, FraudScore } from '../types';
import { format, subDays } from 'date-fns';

interface ExportReportProps {
  transactions: Transaction[];
  fraudScores: Record<string, FraudScore>;
  onExport: (format: 'pdf' | 'csv', options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  dateRange: { start: Date; end: Date };
  includeDetails: boolean;
  riskLevelsToInclude: ('low' | 'medium' | 'high' | 'critical')[];
  reportTitle?: string;
}

export const ExportReport: React.FC<ExportReportProps> = ({
  transactions,
  fraudScores,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    },
    includeDetails: true,
    riskLevelsToInclude: ['low', 'medium', 'high', 'critical'],
    reportTitle: 'FraudGuard Analysis Report'
  });

  const riskLevels = [
    { key: 'low', label: 'Low Risk', color: 'bg-green-500' },
    { key: 'medium', label: 'Medium Risk', color: 'bg-yellow-500' },
    { key: 'high', label: 'High Risk', color: 'bg-orange-500' },
    { key: 'critical', label: 'Critical Risk', color: 'bg-red-500' }
  ] as const;

  const datePresets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 }
  ];

  const handlePresetClick = (days: number) => {
    setOptions({
      ...options,
      dateRange: {
        start: subDays(new Date(), days),
        end: new Date()
      }
    });
  };

  const toggleRiskLevel = (level: typeof riskLevels[number]['key']) => {
    const levels = [...options.riskLevelsToInclude];
    const index = levels.indexOf(level);
    if (index > -1) {
      levels.splice(index, 1);
    } else {
      levels.push(level);
    }
    setOptions({ ...options, riskLevelsToInclude: levels });
  };

  const filteredTransactions = transactions.filter((t) => {
    const score = fraudScores[t.transaction_id];
    if (!score) return false;
    if (!options.riskLevelsToInclude.includes(score.risk_level)) return false;
    const txDate = new Date(t.timestamp);
    return txDate >= options.dateRange.start && txDate <= options.dateRange.end;
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      await onExport(exportFormat, options);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-red-500/20">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <FileDown className="w-5 h-5 text-white" />
          </div>
          Export Report
        </h2>
        <p className="text-gray-400 mt-2">
          Generate and download fraud analysis reports in PDF or CSV format
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm text-red-200 mb-3">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                exportFormat === 'pdf'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-red-500/30 bg-slate-900/50 hover:border-red-500/50'
              }`}
            >
              <FileText className={`w-6 h-6 ${exportFormat === 'pdf' ? 'text-red-400' : 'text-gray-500'}`} />
              <div className="text-left">
                <h4 className={`font-bold ${exportFormat === 'pdf' ? 'text-white' : 'text-gray-400'}`}>
                  PDF Report
                </h4>
                <p className="text-xs text-gray-500">Formatted document with charts</p>
              </div>
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                exportFormat === 'csv'
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : 'border-red-500/30 bg-slate-900/50 hover:border-red-500/50'
              }`}
            >
              <Table className={`w-6 h-6 ${exportFormat === 'csv' ? 'text-cyan-400' : 'text-gray-500'}`} />
              <div className="text-left">
                <h4 className={`font-bold ${exportFormat === 'csv' ? 'text-white' : 'text-gray-400'}`}>
                  CSV Export
                </h4>
                <p className="text-xs text-gray-500">Raw data for analysis</p>
              </div>
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm text-red-200 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="flex gap-2 mb-3">
            {datePresets.map((preset) => (
              <button
                key={preset.days}
                onClick={() => handlePresetClick(preset.days)}
                className="px-3 py-1 text-sm rounded-full border border-red-500/30 text-gray-400 hover:border-red-500 hover:text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                value={format(options.dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, start: new Date(e.target.value) }
                })}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <input
                type="date"
                value={format(options.dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, end: new Date(e.target.value) }
                })}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Risk Level Filter */}
        <div>
          <label className="block text-sm text-red-200 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Include Risk Levels
          </label>
          <div className="flex gap-2">
            {riskLevels.map((level) => (
              <button
                key={level.key}
                onClick={() => toggleRiskLevel(level.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  options.riskLevelsToInclude.includes(level.key)
                    ? 'border-white/30 bg-slate-700/50'
                    : 'border-red-500/30 bg-slate-900/50 opacity-50'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className={options.riskLevelsToInclude.includes(level.key) ? 'text-white' : 'text-gray-500'}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Report Title (PDF only) */}
        {exportFormat === 'pdf' && (
          <div>
            <label className="block text-sm text-red-200 mb-2">Report Title</label>
            <input
              type="text"
              value={options.reportTitle}
              onChange={(e) => setOptions({ ...options, reportTitle: e.target.value })}
              className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="Enter report title..."
            />
          </div>
        )}

        {/* Include Details Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-red-500/30">
          <div>
            <h4 className="font-bold text-white">Include Transaction Details</h4>
            <p className="text-sm text-gray-500">Add full transaction data and fraud indicators</p>
          </div>
          <button
            onClick={() => setOptions({ ...options, includeDetails: !options.includeDetails })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              options.includeDetails ? 'bg-red-500' : 'bg-gray-600'
            }`}
          >
            <span 
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                options.includeDetails ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/30">
          <h4 className="font-bold text-white mb-2">Export Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-400">{filteredTransactions.length}</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {filteredTransactions.filter(t => fraudScores[t.transaction_id]?.risk_level === 'high' || fraudScores[t.transaction_id]?.risk_level === 'critical').length}
              </p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {format(options.dateRange.start, 'MMM d')} - {format(options.dateRange.end, 'MMM d')}
              </p>
              <p className="text-xs text-gray-500">Date Range</p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || filteredTransactions.length === 0}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            exportSuccess
              ? 'bg-green-500 text-white'
              : isExporting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500'
          }`}
        >
          {exportSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Report Downloaded!
            </>
          ) : isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              Export {exportFormat.toUpperCase()} Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportReport;
