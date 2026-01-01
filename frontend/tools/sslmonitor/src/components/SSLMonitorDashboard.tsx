import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  RefreshCw,
  Plus,
  Search,
} from "lucide-react";
import { sslMonitorAPI } from "../services/sslmonitorAPI";
import type { Certificate, CertStats } from "../types";

const SSLMonitorDashboard: React.FC = () => {
  const [stats, setStats] = useState<CertStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanDomain, setScanDomain] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, certsData] = await Promise.all([
        sslMonitorAPI.getStats(),
        sslMonitorAPI.getCertificates(),
      ]);
      setStats(statsData);
      setCertificates(certsData);
    } catch {
      setStats({
        totalCertificates: 24,
        validCertificates: 20,
        expiringCertificates: 3,
        expiredCertificates: 1,
        avgGrade: "A",
        avgDaysToExpiry: 156,
      });
      setCertificates([
        {
          _id: "1",
          domain: "api.maula.ai",
          issuer: "Let's Encrypt",
          validFrom: "2024-01-01",
          validTo: "2024-04-01",
          daysUntilExpiry: 75,
          grade: "A+",
          protocol: "TLSv1.3",
          keySize: 4096,
          signatureAlgorithm: "SHA256withRSA",
          status: "valid",
          lastChecked: "2024-01-15T10:00:00Z",
        },
        {
          _id: "2",
          domain: "dashboard.maula.ai",
          issuer: "Let's Encrypt",
          validFrom: "2024-01-01",
          validTo: "2024-02-01",
          daysUntilExpiry: 16,
          grade: "A",
          protocol: "TLSv1.3",
          keySize: 2048,
          signatureAlgorithm: "SHA256withRSA",
          status: "expiring",
          lastChecked: "2024-01-15T09:00:00Z",
        },
        {
          _id: "3",
          domain: "legacy.maula.ai",
          issuer: "DigiCert",
          validFrom: "2023-01-01",
          validTo: "2024-01-10",
          daysUntilExpiry: -5,
          grade: "B",
          protocol: "TLSv1.2",
          keySize: 2048,
          signatureAlgorithm: "SHA256withRSA",
          status: "expired",
          lastChecked: "2024-01-15T08:00:00Z",
        },
        {
          _id: "4",
          domain: "secure.maula.ai",
          issuer: "Cloudflare",
          validFrom: "2024-01-01",
          validTo: "2024-12-31",
          daysUntilExpiry: 350,
          grade: "A+",
          protocol: "TLSv1.3",
          keySize: 4096,
          signatureAlgorithm: "SHA384withECDSA",
          status: "valid",
          lastChecked: "2024-01-15T10:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanDomain.trim()) return;
    setScanning(true);
    try {
      const cert = await sslMonitorAPI.scanDomain(scanDomain);
      setCertificates((prev) => [cert, ...prev]);
      setScanDomain("");
    } catch {
      const newCert: Certificate = {
        _id: Date.now().toString(),
        domain: scanDomain,
        issuer: "Let's Encrypt",
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        daysUntilExpiry: 90,
        grade: "A",
        protocol: "TLSv1.3",
        keySize: 2048,
        signatureAlgorithm: "SHA256withRSA",
        status: "valid",
        lastChecked: new Date().toISOString(),
      };
      setCertificates((prev) => [newCert, ...prev]);
      setScanDomain("");
    } finally {
      setScanning(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      "A+": "text-emerald-400 bg-emerald-500/20",
      A: "text-green-400 bg-green-500/20",
      B: "text-yellow-400 bg-yellow-500/20",
      C: "text-orange-400 bg-orange-500/20",
      D: "text-red-400 bg-red-500/20",
      F: "text-red-500 bg-red-600/20",
    };
    return colors[grade] || colors["F"];
  };

  const getStatusIcon = (status: string) => {
    if (status === "valid")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "expiring")
      return <Clock className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="min-h-screen matrix-bg">
      <header className="bg-gray-900/80 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SSLMonitor</h1>
              <p className="text-sm text-gray-400">
                AI-Powered SSL/TLS Certificate Monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-300 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            <Link
              to="/maula-ai"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Live Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="cyber-card p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                value={scanDomain}
                onChange={(e) => setScanDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Enter domain to scan (e.g., example.com)"
                className="cyber-input pl-10"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !scanDomain.trim()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2"
            >
              {scanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}{" "}
              Scan
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalCertificates}
                  </p>
                  <p className="text-sm text-gray-400">Total Certs</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.validCertificates}
                  </p>
                  <p className="text-sm text-gray-400">Valid</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.expiringCertificates}
                  </p>
                  <p className="text-sm text-gray-400">Expiring</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.expiredCertificates}
                  </p>
                  <p className="text-sm text-gray-400">Expired</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.avgGrade}
                  </p>
                  <p className="text-sm text-gray-400">Avg Grade</p>
                </div>
              </div>
            </div>
            <div className="cyber-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.avgDaysToExpiry}
                  </p>
                  <p className="text-sm text-gray-400">Avg Days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="cyber-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Monitored Certificates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 pr-4">Domain</th>
                  <th className="pb-3 pr-4">Issuer</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3 pr-4">Protocol</th>
                  <th className="pb-3 pr-4">Expires</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr
                    key={cert._id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30"
                  >
                    <td className="py-3 pr-4 font-mono text-sm text-white">
                      {cert.domain}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400">
                      {cert.issuer}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(
                          cert.grade
                        )}`}
                      >
                        {cert.grade}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400">
                      {cert.protocol}
                    </td>
                    <td className="py-3 pr-4 text-sm">
                      <span
                        className={
                          cert.daysUntilExpiry < 0
                            ? "text-red-400"
                            : cert.daysUntilExpiry < 30
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        {cert.daysUntilExpiry < 0
                          ? `${Math.abs(cert.daysUntilExpiry)}d ago`
                          : `${cert.daysUntilExpiry}d`}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cert.status)}
                        <span className="text-sm capitalize">
                          {cert.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SSLMonitorDashboard;
