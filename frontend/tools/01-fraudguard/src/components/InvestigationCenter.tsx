import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Link2,
  ChevronDown,
  ChevronRight,
  Filter,
  SortAsc,
  Calendar,
  Tag,
  FileText,
  MoreVertical,
  Edit3,
  Trash2,
  Share2,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import { investigationAPI } from '../services/fraudguardAPI';
import { Investigation, RiskLevel, Transaction } from '../types';

interface InvestigationCenterProps {
  onViewTransaction?: (transactionId: string) => void;
}

const InvestigationCenter: React.FC<InvestigationCenterProps> = ({ onViewTransaction }) => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'escalated'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority'>('updated');
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadInvestigations();
  }, [filter]);

  const loadInvestigations = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await investigationAPI.getAll(params);
      setInvestigations(data);
    } catch (error) {
      console.error('Failed to load investigations:', error);
      // Fallback mock data
      setInvestigations([
        {
          id: 'INV-001',
          title: 'Velocity Attack Pattern Detected',
          status: 'in_progress',
          priority: 'critical',
          assigned_to: 'john.analyst',
          transactions: ['TX001', 'TX002', 'TX003'],
          notes: [
            { id: '1', author: 'system', content: 'Multiple rapid transactions from same device detected', timestamp: '2026-01-01T10:00:00Z' },
            { id: '2', author: 'john.analyst', content: 'Investigating correlation with known fraud ring', timestamp: '2026-01-01T10:30:00Z' },
          ],
          timeline: [
            { timestamp: '2026-01-01T09:45:00Z', event_type: 'created', description: 'Investigation created', actor: 'system' },
            { timestamp: '2026-01-01T10:00:00Z', event_type: 'assigned', description: 'Assigned to john.analyst', actor: 'system' },
          ],
          created_at: '2026-01-01T09:45:00Z',
          updated_at: '2026-01-01T10:30:00Z',
        },
        {
          id: 'INV-002',
          title: 'Geographic Anomaly - Multi-Country Access',
          status: 'open',
          priority: 'high',
          transactions: ['TX004', 'TX005'],
          notes: [],
          timeline: [
            { timestamp: '2026-01-01T08:00:00Z', event_type: 'created', description: 'Investigation created', actor: 'system' },
          ],
          created_at: '2026-01-01T08:00:00Z',
          updated_at: '2026-01-01T08:00:00Z',
        },
        {
          id: 'INV-003',
          title: 'Synthetic Identity Fraud Suspected',
          status: 'escalated',
          priority: 'critical',
          assigned_to: 'senior.analyst',
          transactions: ['TX006', 'TX007', 'TX008', 'TX009'],
          notes: [
            { id: '1', author: 'ml_engine', content: 'Account age and transaction velocity inconsistent with normal user behavior', timestamp: '2026-01-01T07:00:00Z' },
          ],
          timeline: [],
          created_at: '2025-12-31T20:00:00Z',
          updated_at: '2026-01-01T07:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedInvestigation || !newNote.trim()) return;
    
    try {
      const updated = await investigationAPI.addNote(selectedInvestigation.id, newNote);
      setSelectedInvestigation(updated);
      setInvestigations(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleStatusChange = async (investigationId: string, newStatus: Investigation['status']) => {
    try {
      const updated = await investigationAPI.update(investigationId, { status: newStatus });
      setInvestigations(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
      if (selectedInvestigation?.id === investigationId) {
        setSelectedInvestigation(updated);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: Investigation['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'in_progress': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'resolved': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'escalated': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getPriorityColor = (priority: RiskLevel) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Investigation['status']) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <FileSearch className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredInvestigations = investigations
    .filter(inv => filter === 'all' || inv.status === filter)
    .sort((a, b) => {
      if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Investigation List */}
      <div className="w-1/3 flex flex-col bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              Investigations
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'open', 'in_progress', 'resolved', 'escalated'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-700/50 text-gray-400 hover:text-white'
                }`}
              >
                {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredInvestigations.map(investigation => (
            <div
              key={investigation.id}
              onClick={() => setSelectedInvestigation(investigation)}
              className={`p-4 border-b border-slate-700/50 cursor-pointer transition-colors ${
                selectedInvestigation?.id === investigation.id
                  ? 'bg-slate-700/50'
                  : 'hover:bg-slate-700/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${getPriorityColor(investigation.priority)}`} />
                  <span className="text-sm font-medium text-white">{investigation.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(investigation.status)}`}>
                  {investigation.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2 line-clamp-2">{investigation.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {investigation.transactions.length} txns
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {investigation.notes.length}
                </span>
                {investigation.assigned_to && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {investigation.assigned_to}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investigation Detail */}
      <div className="flex-1 flex flex-col bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
        {selectedInvestigation ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-mono text-cyan-400">{selectedInvestigation.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedInvestigation.status)}`}>
                      {getStatusIcon(selectedInvestigation.status)}
                      <span className="ml-1">{selectedInvestigation.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(selectedInvestigation.priority)} bg-current/10`}>
                      {selectedInvestigation.priority.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selectedInvestigation.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedInvestigation.status}
                    onChange={(e) => handleStatusChange(selectedInvestigation.id, e.target.value as Investigation['status'])}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {new Date(selectedInvestigation.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated: {new Date(selectedInvestigation.updated_at).toLocaleString()}
                </span>
                {selectedInvestigation.assigned_to && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedInvestigation.assigned_to}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Linked Transactions */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Linked Transactions ({selectedInvestigation.transactions.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInvestigation.transactions.map(txId => (
                    <button
                      key={txId}
                      onClick={() => onViewTransaction?.(txId)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-sm text-cyan-400 hover:bg-slate-600/50 transition-colors"
                    >
                      <span className="font-mono">{txId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                  <button className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-600 rounded-lg text-sm text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                    <Plus className="w-3 h-3" />
                    Add Transaction
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Investigation Notes
                </h3>
                <div className="space-y-3">
                  {selectedInvestigation.notes.map(note => (
                    <div key={note.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{note.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{note.content}</p>
                    </div>
                  ))}

                  {/* Add Note */}
                  <div className="flex gap-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity Timeline
                </h3>
                <div className="space-y-3">
                  {selectedInvestigation.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-cyan-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()} by {event.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-700/50 flex justify-between">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-gray-300 hover:bg-slate-600/50 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-gray-300 hover:bg-slate-600/50 transition-colors text-sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
              {selectedInvestigation.status !== 'resolved' && (
                <button
                  onClick={() => handleStatusChange(selectedInvestigation.id, 'resolved')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Resolved
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an investigation to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigationCenter;
