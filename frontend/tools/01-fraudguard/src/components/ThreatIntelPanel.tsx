import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  AlertTriangle,
  Search,
  Database,
  Eye,
  EyeOff,
  MapPin,
  Server,
  Mail,
  Smartphone,
  CreditCard,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { threatIntelAPI } from '../services/fraudguardAPI';
import { 
  IPReputation, 
  EmailReputation, 
  DeviceReputation, 
  ThreatIntelligence,
  ThreatFeedMatch 
} from '../types';

interface ThreatIntelPanelProps {
  initialQuery?: { type: 'ip' | 'email' | 'device'; value: string };
  onBlockEntity?: (type: string, value: string) => void;
}

const ThreatIntelPanel: React.FC<ThreatIntelPanelProps> = ({ initialQuery, onBlockEntity }) => {
  const [searchType, setSearchType] = useState<'ip' | 'email' | 'device' | 'card_bin'>('ip');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipResult, setIpResult] = useState<IPReputation | null>(null);
  const [emailResult, setEmailResult] = useState<EmailReputation | null>(null);
  const [deviceResult, setDeviceResult] = useState<DeviceReputation | null>(null);
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeedMatch[]>([]);
  const [recentSearches, setRecentSearches] = useState<{ type: string; value: string; score: number }[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [showBlacklist, setShowBlacklist] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchType(initialQuery.type);
      setSearchValue(initialQuery.value);
      handleSearch(initialQuery.type, initialQuery.value);
    }
    loadBlacklist();
  }, [initialQuery]);

  const loadBlacklist = async () => {
    try {
      const data = await threatIntelAPI.getBlacklist();
      setBlacklist(data);
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    }
  };

  const handleSearch = async (type?: 'ip' | 'email' | 'device' | 'card_bin', value?: string) => {
    const queryType = type || searchType;
    const queryValue = value || searchValue;
    
    if (!queryValue.trim()) return;

    setLoading(true);
    setIpResult(null);
    setEmailResult(null);
    setDeviceResult(null);
    setThreatFeeds([]);

    try {
      switch (queryType) {
        case 'ip':
          const ipData = await threatIntelAPI.checkIP(queryValue);
          setIpResult(ipData);
          break;
        case 'email':
          const emailData = await threatIntelAPI.checkEmail(queryValue);
          setEmailResult(emailData);
          break;
        case 'device':
          const deviceData = await threatIntelAPI.checkDevice(queryValue);
          setDeviceResult(deviceData);
          break;
      }

      // Add to recent searches
      setRecentSearches(prev => [
        { type: queryType, value: queryValue, score: Math.floor(Math.random() * 100) },
        ...prev.filter(s => s.value !== queryValue).slice(0, 9),
      ]);
    } catch (error) {
      console.error('Threat intel lookup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (type: 'ip' | 'email' | 'device' | 'card', value: string) => {
    try {
      await threatIntelAPI.addToBlacklist(type, value, 'Manual block from Threat Intel Panel');
      await loadBlacklist();
      onBlockEntity?.(type, value);
    } catch (error) {
      console.error('Failed to block entity:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return 'text-green-400';
    if (score <= 50) return 'text-yellow-400';
    if (score <= 75) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score <= 25) return 'bg-green-500/20 border-green-500/30';
    if (score <= 50) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score <= 75) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          Threat Intelligence Lookup
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Type Selector */}
          <div className="flex bg-slate-900/50 rounded-lg p-1">
            {[
              { type: 'ip' as const, icon: Server, label: 'IP Address' },
              { type: 'email' as const, icon: Mail, label: 'Email' },
              { type: 'device' as const, icon: Smartphone, label: 'Device' },
              { type: 'card_bin' as const, icon: CreditCard, label: 'Card BIN' },
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  searchType === type
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  searchType === 'ip' ? '192.168.1.1' :
                  searchType === 'email' ? 'user@example.com' :
                  searchType === 'device' ? 'Device fingerprint...' :
                  '421234'
                }
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Recent:</span>
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchType(search.type as any);
                  setSearchValue(search.value);
                  handleSearch(search.type as any, search.value);
                }}
                className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-300 hover:bg-slate-600/50 transition-colors flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${getScoreColor(search.score).replace('text-', 'bg-')}`} />
                {search.value.length > 20 ? search.value.substring(0, 20) + '...' : search.value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Reputation Result */}
        {ipResult && (
          <div className={`bg-slate-800/50 backdrop-blur rounded-xl border ${getScoreBg(ipResult.score)} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">IP Reputation</h3>
                  <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                    {ipResult.ip}
                    <button onClick={() => copyToClipboard(ipResult.ip)} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(ipResult.score)}`}>
                {ipResult.score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoRow label="Country" value={ipResult.country} />
              <InfoRow label="ISP" value={ipResult.isp} />
              <InfoRow label="ASN" value={ipResult.asn} />
              <InfoRow label="Abuse Reports" value={ipResult.abuse_reports.toString()} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge active={ipResult.is_vpn} label="VPN" color="yellow" />
              <Badge active={ipResult.is_proxy} label="Proxy" color="orange" />
              <Badge active={ipResult.is_tor} label="TOR" color="red" />
              <Badge active={ipResult.is_datacenter} label="Datacenter" color="purple" />
              <Badge active={ipResult.is_bot} label="Bot" color="pink" />
            </div>

            {ipResult.threat_types && ipResult.threat_types.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Threat Types:</p>
                <div className="flex flex-wrap gap-2">
                  {ipResult.threat_types.map((threat, index) => (
                    <span key={index} className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleBlock('ip', ipResult.ip)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                <Ban className="w-4 h-4" />
                Block IP
              </button>
              <button
                onClick={() => window.open(`https://www.abuseipdb.com/check/${ipResult.ip}`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-gray-300 hover:bg-slate-600/50 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Email Reputation Result */}
        {emailResult && (
          <div className={`bg-slate-800/50 backdrop-blur rounded-xl border ${getScoreBg(emailResult.score)} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Reputation</h3>
                  <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                    {emailResult.email}
                    <button onClick={() => copyToClipboard(emailResult.email)} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(emailResult.score)}`}>
                {emailResult.score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoRow label="Domain Age" value={`${emailResult.domain_age_days} days`} />
              <InfoRow label="First Seen" value={emailResult.first_seen} />
              <InfoRow label="Data Breaches" value={emailResult.data_breaches.toString()} />
              <InfoRow label="Deliverable" value={emailResult.is_deliverable ? 'Yes' : 'No'} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge active={emailResult.is_disposable} label="Disposable" color="red" />
              <Badge active={emailResult.is_free_provider} label="Free Provider" color="yellow" />
              <Badge active={emailResult.has_mx_records} label="Valid MX" color="green" positive />
            </div>

            {emailResult.profiles_found && emailResult.profiles_found.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Profiles Found:</p>
                <div className="flex flex-wrap gap-2">
                  {emailResult.profiles_found.map((profile, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                      {profile}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleBlock('email', emailResult.email)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                <Ban className="w-4 h-4" />
                Block Email
              </button>
              <button
                onClick={() => window.open(`https://haveibeenpwned.com/account/${emailResult.email}`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg text-gray-300 hover:bg-slate-600/50 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Device Reputation Result */}
        {deviceResult && (
          <div className={`bg-slate-800/50 backdrop-blur rounded-xl border ${getScoreBg(deviceResult.score)} p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Device Reputation</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {deviceResult.fingerprint.substring(0, 16)}...
                  </p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(deviceResult.score)}`}>
                {deviceResult.score}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoRow label="First Seen" value={deviceResult.first_seen} />
              <InfoRow label="Fraud History" value={deviceResult.fraud_history.toString()} />
              <InfoRow label="Linked Accounts" value={deviceResult.associated_accounts.toString()} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge active={deviceResult.is_emulator} label="Emulator" color="red" />
              <Badge active={deviceResult.is_rooted} label="Rooted/Jailbroken" color="orange" />
              <Badge active={deviceResult.is_headless} label="Headless" color="purple" />
            </div>

            <button
              onClick={() => handleBlock('device', deviceResult.fingerprint)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              <Ban className="w-4 h-4" />
              Block Device
            </button>
          </div>
        )}
      </div>

      {/* Blacklist Section */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            Active Blacklist
            <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400">
              {blacklist.length}
            </span>
          </h3>
          <button
            onClick={() => setShowBlacklist(!showBlacklist)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showBlacklist ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {showBlacklist && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Value</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Added</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map((item, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3">
                      <span className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 uppercase">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-sm text-white">{item.value}</td>
                    <td className="py-3 text-sm text-gray-400">{item.reason}</td>
                    <td className="py-3 text-xs text-gray-400">{item.added_at}</td>
                    <td className="py-3">
                      <button
                        onClick={async () => {
                          await threatIntelAPI.removeFromBlacklist(item.type, item.value);
                          loadBlacklist();
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm text-white truncate">{value}</p>
  </div>
);

const Badge: React.FC<{ active: boolean; label: string; color: string; positive?: boolean }> = ({ 
  active, 
  label, 
  color,
  positive 
}) => {
  if (!active && !positive) return null;
  
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
  };

  return (
    <span className={`px-2 py-1 border rounded text-xs flex items-center gap-1 ${colorClasses[color]}`}>
      {positive ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {label}
    </span>
  );
};

export default ThreatIntelPanel;
