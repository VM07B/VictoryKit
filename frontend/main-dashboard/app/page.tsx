import ToolCard from '@/components/ToolCard';
import { Shield, Menu } from 'lucide-react';

const tools = [
  { id: 1, name: 'FraudGuard', description: 'AI-powered fraud detection', category: 'Fraud Detection', subdomain: 'fguard.fyzo.xyz', color: 'from-red-500 to-pink-500' },
  { id: 2, name: 'IntelliScout', description: 'Intelligence gathering', category: 'Intelligence', subdomain: 'iscout.fyzo.xyz', color: 'from-blue-500 to-cyan-500' },
  { id: 3, name: 'ThreatRadar', description: 'Threat detection', category: 'Threat Detection', subdomain: 'tradar.fyzo.xyz', color: 'from-orange-500 to-red-500' },
  { id: 4, name: 'MalwareHunter', description: 'Malware analysis', category: 'Malware', subdomain: 'mhunter.fyzo.xyz', color: 'from-purple-500 to-pink-500' },
  { id: 5, name: 'PhishGuard', description: 'Phishing detection', category: 'Phishing', subdomain: 'pguard.fyzo.xyz', color: 'from-green-500 to-emerald-500' },
  { id: 6, name: 'VulnScan', description: 'Vulnerability scanner', category: 'Vulnerability', subdomain: 'vscan.fyzo.xyz', color: 'from-yellow-500 to-orange-500' },
  { id: 7, name: 'PenTestAI', description: 'Penetration testing', category: 'Penetration Testing', subdomain: 'pentest.fyzo.xyz', color: 'from-red-500 to-rose-500' },
  { id: 8, name: 'SecureCode', description: 'Code security audit', category: 'Code Security', subdomain: 'scode.fyzo.xyz', color: 'from-indigo-500 to-purple-500' },
  { id: 9, name: 'ComplianceCheck', description: 'Compliance monitoring', category: 'Compliance', subdomain: 'compliance.fyzo.xyz', color: 'from-teal-500 to-cyan-500' },
  { id: 10, name: 'DataGuardian', description: 'Data protection', category: 'Data Protection', subdomain: 'dguardian.fyzo.xyz', color: 'from-blue-500 to-indigo-500' },
  
  { id: 11, name: 'CryptoShield', description: 'Cryptography tools', category: 'Cryptography', subdomain: 'cshield.fyzo.xyz', color: 'from-violet-500 to-purple-500' },
  { id: 12, name: 'IAMControl', description: 'Identity & access', category: 'IAM', subdomain: 'iamctrl.fyzo.xyz', color: 'from-pink-500 to-rose-500' },
  { id: 13, name: 'LogIntel', description: 'Log analysis', category: 'Logging', subdomain: 'logintel.fyzo.xyz', color: 'from-amber-500 to-orange-500' },
  { id: 14, name: 'NetDefender', description: 'Network security', category: 'Network', subdomain: 'ndefender.fyzo.xyz', color: 'from-cyan-500 to-blue-500' },
  { id: 15, name: 'EndpointShield', description: 'Endpoint protection', category: 'Endpoint', subdomain: 'eshield.fyzo.xyz', color: 'from-lime-500 to-green-500' },
  { id: 16, name: 'CloudSecure', description: 'Cloud security', category: 'Cloud', subdomain: 'csecure.fyzo.xyz', color: 'from-sky-500 to-blue-500' },
  { id: 17, name: 'APIGuardian', description: 'API security', category: 'API', subdomain: 'aguardian.fyzo.xyz', color: 'from-fuchsia-500 to-pink-500' },
  { id: 18, name: 'ContainerWatch', description: 'Container security', category: 'Container', subdomain: 'cwatch.fyzo.xyz', color: 'from-emerald-500 to-teal-500' },
  { id: 19, name: 'DevSecOps', description: 'DevSecOps tools', category: 'DevSecOps', subdomain: 'devsecops.fyzo.xyz', color: 'from-rose-500 to-red-500' },
  { id: 20, name: 'IncidentCommand', description: 'Incident response', category: 'Incident Response', subdomain: 'incident.fyzo.xyz', color: 'from-red-600 to-orange-600' },
  
  { id: 21, name: 'ForensicsLab', description: 'Digital forensics', category: 'Forensics', subdomain: 'forensics.fyzo.xyz', color: 'from-slate-500 to-gray-500' },
  { id: 22, name: 'ThreatIntel', description: 'Threat intelligence', category: 'Intelligence', subdomain: 'tintel.fyzo.xyz', color: 'from-red-500 to-pink-600' },
  { id: 23, name: 'BehaviorWatch', description: 'Behavior analysis', category: 'Behavior', subdomain: 'bwatch.fyzo.xyz', color: 'from-purple-600 to-indigo-600' },
  { id: 24, name: 'AnomalyDetect', description: 'Anomaly detection', category: 'Anomaly', subdomain: 'anomaly.fyzo.xyz', color: 'from-orange-600 to-red-600' },
  { id: 25, name: 'RedTeamAI', description: 'Red team tools', category: 'Red Team', subdomain: 'redteam.fyzo.xyz', color: 'from-red-700 to-rose-700' },
  { id: 26, name: 'BlueTeamAI', description: 'Blue team tools', category: 'Blue Team', subdomain: 'blueteam.fyzo.xyz', color: 'from-blue-700 to-cyan-700' },
  { id: 27, name: 'SIEMCommander', description: 'SIEM integration', category: 'SIEM', subdomain: 'siem.fyzo.xyz', color: 'from-indigo-600 to-purple-600' },
  { id: 28, name: 'SOAREngine', description: 'Security orchestration', category: 'SOAR', subdomain: 'soar.fyzo.xyz', color: 'from-violet-600 to-purple-700' },
  { id: 29, name: 'RiskScoreAI', description: 'Risk assessment', category: 'Risk', subdomain: 'riskscore.fyzo.xyz', color: 'from-yellow-600 to-amber-600' },
  { id: 30, name: 'PolicyEngine', description: 'Policy management', category: 'Policy', subdomain: 'policy.fyzo.xyz', color: 'from-teal-600 to-cyan-600' },
  
  { id: 31, name: 'AuditTracker', description: 'Audit management', category: 'Audit', subdomain: 'audit.fyzo.xyz', color: 'from-blue-600 to-indigo-700' },
  { id: 32, name: 'ZeroTrustAI', description: 'Zero trust security', category: 'Zero Trust', subdomain: 'zerotrust.fyzo.xyz', color: 'from-gray-600 to-slate-700' },
  { id: 33, name: 'PasswordVault', description: 'Password security', category: 'Password', subdomain: 'pvault.fyzo.xyz', color: 'from-green-600 to-emerald-700' },
  { id: 34, name: 'BiometricAI', description: 'Biometric security', category: 'Biometric', subdomain: 'biometric.fyzo.xyz', color: 'from-pink-600 to-rose-700' },
  { id: 35, name: 'EmailGuard', description: 'Email security', category: 'Email', subdomain: 'emailguard.fyzo.xyz', color: 'from-sky-600 to-blue-700' },
  { id: 36, name: 'WebFilter', description: 'Web filtering', category: 'Web', subdomain: 'webfilter.fyzo.xyz', color: 'from-lime-600 to-green-700' },
  { id: 37, name: 'DNSShield', description: 'DNS security', category: 'DNS', subdomain: 'dnsshield.fyzo.xyz', color: 'from-cyan-600 to-teal-700' },
  { id: 38, name: 'FirewallAI', description: 'Firewall management', category: 'Firewall', subdomain: 'firewall.fyzo.xyz', color: 'from-orange-700 to-red-800' },
  { id: 39, name: 'VPNGuardian', description: 'VPN security', category: 'VPN', subdomain: 'vpnguard.fyzo.xyz', color: 'from-indigo-700 to-purple-800' },
  { id: 40, name: 'WirelessWatch', description: 'Wireless security', category: 'Wireless', subdomain: 'wireless.fyzo.xyz', color: 'from-violet-700 to-fuchsia-800' },
  
  { id: 41, name: 'IoTSecure', description: 'IoT security', category: 'IoT', subdomain: 'iotsecure.fyzo.xyz', color: 'from-emerald-700 to-teal-800' },
  { id: 42, name: 'MobileDefend', description: 'Mobile security', category: 'Mobile', subdomain: 'mdefend.fyzo.xyz', color: 'from-blue-700 to-sky-800' },
  { id: 43, name: 'BackupGuard', description: 'Backup security', category: 'Backup', subdomain: 'backup.fyzo.xyz', color: 'from-amber-700 to-orange-800' },
  { id: 44, name: 'DRPlan', description: 'Disaster recovery', category: 'DR', subdomain: 'drplan.fyzo.xyz', color: 'from-red-800 to-rose-900' },
  { id: 45, name: 'PrivacyShield', description: 'Privacy protection', category: 'Privacy', subdomain: 'privacy.fyzo.xyz', color: 'from-slate-700 to-gray-800' },
  { id: 46, name: 'GDPRCompliance', description: 'GDPR compliance', category: 'GDPR', subdomain: 'gdpr.fyzo.xyz', color: 'from-teal-700 to-cyan-800' },
  { id: 47, name: 'HIPAAGuard', description: 'HIPAA compliance', category: 'HIPAA', subdomain: 'hipaa.fyzo.xyz', color: 'from-green-700 to-lime-800' },
  { id: 48, name: 'PCI-DSS', description: 'PCI-DSS compliance', category: 'PCI-DSS', subdomain: 'pcidss.fyzo.xyz', color: 'from-purple-700 to-violet-800' },
  { id: 49, name: 'BugBountyAI', description: 'Bug bounty platform', category: 'Bug Bounty', subdomain: 'bugbounty.fyzo.xyz', color: 'from-yellow-700 to-amber-800' },
  { id: 50, name: 'CyberEduAI', description: 'Cybersecurity training', category: 'Education', subdomain: 'cyberedu.fyzo.xyz', color: 'from-pink-700 to-rose-800' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">FYZO.XYZ</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-purple-200 hover:text-white transition-colors">Login</button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-medium transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
            AI-Powered Security Services
          </h2>
          <p className="text-2xl text-purple-200 mb-8">
            50+ AI-powered tools to protect your business
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-purple-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span>All systems operational</span>
            </div>
            <span>•</span>
            <span>99.9% uptime</span>
            <span>•</span>
            <span>152 microservices</span>
          </div>
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 backdrop-blur mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-300">
            <p>&copy; 2024 FYZO.XYZ - All rights reserved</p>
            <p className="text-sm mt-2">Powered by AI • Built with ❤️</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
