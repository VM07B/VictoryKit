import React, { useState } from 'react';
import { History, Search, Filter, ChevronDown, ChevronUp, Eye, MoreVertical, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  onAnalyze: (transaction: Transaction) => void;
  loading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  onViewTransaction, 
  onAnalyze,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'fraud_score'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (risk_level?: string) => {
    if (!risk_level) return null;
    
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${colors[risk_level as keyof typeof colors]}`}>
        {risk_level}
      </span>
    );
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = 
        tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.merchant_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = filterRisk === 'all' || tx.risk_level === filterRisk;
      
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'fraud_score') {
        comparison = (a.fraud_score || 0) - (b.fraud_score || 0);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-600" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-red-400" />
      : <ChevronDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-red-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            Transaction History
          </h2>
          <span className="text-sm text-gray-400">{filteredTransactions.length} transactions</span>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, email, or merchant..."
              className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="bg-slate-900/50 border border-red-500/30 rounded-lg pl-10 pr-8 py-2 text-white focus:border-red-500 focus:outline-none appearance-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Date/Time <SortIcon field="timestamp" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Amount <SortIcon field="amount" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('fraud_score')}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Fraud Score <SortIcon field="fraud_score" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-500/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    Loading transactions...
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr 
                    className="hover:bg-red-500/5 transition-colors cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-cyan-400">{tx.transaction_id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-gray-500 font-normal ml-1">{tx.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${getScoreColor(tx.fraud_score)}`}>
                        {tx.fraud_score ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getRiskBadge(tx.risk_level)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="text-sm text-gray-300 capitalize">{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewTransaction(tx); }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onAnalyze(tx); }}
                          className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
                          title="Re-analyze"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedRow === tx.id && (
                    <tr className="bg-slate-900/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="text-white">{tx.email || '—'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">IP Address:</span>
                            <p className="text-white font-mono">{tx.user_ip || '—'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Card:</span>
                            <p className="text-white">•••• {tx.card_last4 || '••••'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Merchant:</span>
                            <p className="text-white">{tx.merchant_id || '—'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
