import React, { useState } from 'react';
import { Bell, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Mail, Webhook, MessageSquare, Slack, AlertTriangle, Activity, MapPin, Zap } from 'lucide-react';
import { Alert } from '../types';

interface AlertsPanelProps {
  alerts: Alert[];
  onCreateAlert: (alert: Omit<Alert, 'id' | 'created_at' | 'triggered_count'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string, active: boolean) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    alert_type: 'high_risk_transaction' as Alert['alert_type'],
    threshold: 70,
    notification_channels: ['email'] as Alert['notification_channels'],
    active: true
  });

  const alertTypeConfig = {
    high_risk_transaction: { 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: 'High Risk Transaction',
      description: 'Triggers when a transaction exceeds the fraud score threshold'
    },
    suspicious_pattern: { 
      icon: <Activity className="w-5 h-5" />, 
      label: 'Suspicious Pattern',
      description: 'Detects unusual transaction patterns'
    },
    velocity_breach: { 
      icon: <Zap className="w-5 h-5" />, 
      label: 'Velocity Breach',
      description: 'Triggers on rapid consecutive transactions'
    },
    unusual_location: { 
      icon: <MapPin className="w-5 h-5" />, 
      label: 'Unusual Location',
      description: 'Detects transactions from unexpected locations'
    }
  };

  const channelConfig = {
    email: { icon: <Mail className="w-4 h-4" />, label: 'Email' },
    webhook: { icon: <Webhook className="w-4 h-4" />, label: 'Webhook' },
    sms: { icon: <MessageSquare className="w-4 h-4" />, label: 'SMS' },
    slack: { icon: <Slack className="w-4 h-4" />, label: 'Slack' }
  };

  const toggleChannel = (channel: keyof typeof channelConfig) => {
    const channels = [...newAlert.notification_channels];
    const index = channels.indexOf(channel);
    if (index > -1) {
      channels.splice(index, 1);
    } else {
      channels.push(channel);
    }
    setNewAlert({ ...newAlert, notification_channels: channels });
  };

  const handleCreate = () => {
    onCreateAlert(newAlert);
    setShowCreateForm(false);
    setNewAlert({
      alert_type: 'high_risk_transaction',
      threshold: 70,
      notification_channels: ['email'],
      active: true
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-red-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Fraud Alerts
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </button>
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="p-6 border-b border-red-500/20 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white mb-4">Create New Alert</h3>
          
          <div className="space-y-4">
            {/* Alert Type */}
            <div>
              <label className="block text-sm text-red-200 mb-2">Alert Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(alertTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setNewAlert({ ...newAlert, alert_type: type as Alert['alert_type'] })}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      newAlert.alert_type === type
                        ? 'border-red-500 bg-red-500/20 text-white'
                        : 'border-red-500/30 bg-slate-900/50 text-gray-400 hover:border-red-500/50'
                    }`}
                  >
                    {config.icon}
                    <span className="text-sm">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-sm text-red-200 mb-2">
                Threshold Score: <span className="text-white font-bold">{newAlert.threshold}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>40</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <label className="block text-sm text-red-200 mb-2">Notification Channels</label>
              <div className="flex gap-2">
                {Object.entries(channelConfig).map(([channel, config]) => (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(channel as keyof typeof channelConfig)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      newAlert.notification_channels.includes(channel as any)
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-red-500/30 bg-slate-900/50 text-gray-400 hover:border-red-500/50'
                    }`}
                  >
                    {config.icon}
                    <span className="text-sm">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-500 hover:to-pink-500 transition-all"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="divide-y divide-red-500/10">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts configured</p>
            <p className="text-sm mt-1">Create your first fraud alert to get notified</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const typeConfig = alertTypeConfig[alert.alert_type];
            
            return (
              <div 
                key={alert.id} 
                className={`p-4 flex items-center gap-4 ${alert.active ? '' : 'opacity-50'}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  alert.active ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/20 text-gray-500'
                }`}>
                  {typeConfig.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{typeConfig.label}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      Threshold: {alert.threshold}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{typeConfig.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {alert.notification_channels.map((channel) => (
                      <span 
                        key={channel}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400"
                      >
                        {channelConfig[channel].icon}
                        {channelConfig[channel].label}
                      </span>
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      Triggered {alert.triggered_count} times
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAlert(alert.id, !alert.active)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title={alert.active ? 'Disable' : 'Enable'}
                  >
                    {alert.active ? (
                      <ToggleRight className="w-6 h-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
