import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Search,
  FileText,
  Settings,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Bot,
} from "lucide-react";
import { NAV_ITEMS, PROVIDER_CONFIG, API_BASE, WS_BASE } from "../constants";
import {
  Incident,
  Responder,
  Indicator,
  TimelineEvent,
  PlaybookRun,
} from "../types";

type Tab =
  | "triage"
  | "timeline"
  | "forensics"
  | "intel"
  | "alerts"
  | "tasks"
  | "reports"
  | "settings";

const IncidentResponseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("triage");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [playbookRuns, setPlaybookRuns] = useState<PlaybookRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading incident response data
    setIncidents([
      {
        id: "inc-001",
        title: "Suspicious Login Attempts",
        description: "Multiple failed login attempts from unusual locations",
        severity: "high",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assigned_to: ["responder-1"],
        tags: ["authentication", "brute-force"],
        source: "SIEM",
        indicators_count: 15,
        timeline_events_count: 23,
      },
      {
        id: "inc-002",
        title: "Data Exfiltration Detected",
        description: "Large data transfer to external IP addresses",
        severity: "critical",
        status: "investigating",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        assigned_to: ["responder-1", "responder-2"],
        tags: ["data-loss", "exfiltration"],
        source: "DLP",
        indicators_count: 8,
        timeline_events_count: 12,
      },
    ]);

    setResponders([
      {
        id: "responder-1",
        name: "Alice Johnson",
        role: "Lead Incident Responder",
        status: "active",
        skills: ["forensics", "network-analysis"],
        contact: { email: "alice@company.com", phone: "+1-555-0101" },
      },
      {
        id: "responder-2",
        name: "Bob Smith",
        role: "Security Analyst",
        status: "available",
        skills: ["threat-intel", "malware-analysis"],
        contact: { email: "bob@company.com", phone: "+1-555-0102" },
      },
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-red-400";
      case "investigating":
        return "text-yellow-400";
      case "contained":
        return "text-blue-400";
      case "resolved":
        return "text-green-400";
      case "closed":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "triage":
        return (
          <div className="space-y-6">
            {/* Active Incidents */}
            <div className="grid gap-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {incident.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {incident.severity.toUpperCase()}
                        </span>
                        <span
                          className={`text-sm font-medium ${getStatusColor(
                            incident.status
                          )}`}
                        >
                          {incident.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {incident.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Source: {incident.source}</span>
                        <span>Indicators: {incident.indicators_count}</span>
                        <span>Events: {incident.timeline_events_count}</span>
                        <span>
                          Created:{" "}
                          {new Date(incident.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                        Investigate
                      </button>
                      <button className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                        Assign
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {incident.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {incident.assigned_to.length} assigned
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-blue-400" />
                  <div className="text-left">
                    <h4 className="font-bold text-white">Create Incident</h4>
                    <p className="text-sm text-gray-400">
                      Manually create new incident
                    </p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Play className="w-8 h-8 text-green-400" />
                  <div className="text-left">
                    <h4 className="font-bold text-white">Run Playbook</h4>
                    <p className="text-sm text-gray-400">
                      Execute automated response
                    </p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div className="text-left">
                    <h4 className="font-bold text-white">Hunt Threats</h4>
                    <p className="text-sm text-gray-400">
                      Proactive threat hunting
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Incident Timeline
              </h3>
              <div className="space-y-4">
                {[
                  {
                    time: "14:32",
                    event: "Suspicious login attempt detected",
                    type: "alert",
                    severity: "medium",
                  },
                  {
                    time: "14:28",
                    event:
                      "Multiple failed authentication from IP 192.168.1.100",
                    type: "security",
                    severity: "high",
                  },
                  {
                    time: "14:25",
                    event: "User account locked due to failed attempts",
                    type: "system",
                    severity: "low",
                  },
                  {
                    time: "14:20",
                    event: "Incident created and assigned to Alice Johnson",
                    type: "incident",
                    severity: "info",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-16 text-sm text-gray-500">
                      {item.time}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        item.severity === "high"
                          ? "bg-red-400"
                          : item.severity === "medium"
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-white">{item.event}</p>
                      <span className="text-xs text-gray-500 uppercase">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "forensics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Evidence Collection
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-white">System Logs</span>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">Network Traffic</span>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Memory Dump</span>
                    </div>
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Analysis Tools
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        Memory Analysis
                      </span>
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        File Carving
                      </span>
                      <Search className="w-5 h-5 text-green-400" />
                    </div>
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        Timeline Reconstruction
                      </span>
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "intel":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-red-400" />
                  <h4 className="font-bold text-white">Threat Indicators</h4>
                </div>
                <p className="text-2xl font-bold text-white">247</p>
                <p className="text-sm text-gray-400">Active indicators</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                  <h4 className="font-bold text-white">Intelligence Feeds</h4>
                </div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-gray-400">Connected sources</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                  <h4 className="font-bold text-white">Matches Found</h4>
                </div>
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-sm text-gray-400">This week</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Recent Intelligence
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "New Ransomware Campaign",
                    source: "Mandiant",
                    severity: "high",
                    time: "2 hours ago",
                  },
                  {
                    title: "Phishing Kit Distribution",
                    source: "CrowdStrike",
                    severity: "medium",
                    time: "4 hours ago",
                  },
                  {
                    title: "Zero-day Vulnerability",
                    source: "Microsoft",
                    severity: "critical",
                    time: "6 hours ago",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.severity === "critical"
                          ? "bg-red-500/20 text-red-400"
                          : item.severity === "high"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "alerts":
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Active Alerts
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "alert-1",
                    title: "Brute Force Attack",
                    severity: "high",
                    status: "active",
                    time: "5 min ago",
                  },
                  {
                    id: "alert-2",
                    title: "Suspicious Data Transfer",
                    severity: "medium",
                    status: "acknowledged",
                    time: "12 min ago",
                  },
                  {
                    id: "alert-3",
                    title: "Privilege Escalation",
                    severity: "critical",
                    status: "active",
                    time: "18 min ago",
                  },
                ].map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.severity === "critical"
                            ? "text-red-400"
                            : alert.severity === "high"
                            ? "text-orange-400"
                            : "text-yellow-400"
                        }`}
                      />
                      <div>
                        <h4 className="text-white font-medium">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-400">{alert.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === "active"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {alert.status}
                      </span>
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Response Tasks
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: "task-1",
                    title: "Isolate affected systems",
                    assignee: "Alice Johnson",
                    status: "completed",
                    priority: "high",
                  },
                  {
                    id: "task-2",
                    title: "Collect forensic evidence",
                    assignee: "Bob Smith",
                    status: "in_progress",
                    priority: "high",
                  },
                  {
                    id: "task-3",
                    title: "Update security policies",
                    assignee: "Alice Johnson",
                    status: "pending",
                    priority: "medium",
                  },
                  {
                    id: "task-4",
                    title: "Notify stakeholders",
                    assignee: "Bob Smith",
                    status: "pending",
                    priority: "low",
                  },
                ].map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-400">
                        Assigned to: {task.assignee}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-500/20 text-red-400"
                            : task.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : task.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Generate Reports
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-left">
                    <h4 className="text-white font-medium">
                      Incident Summary Report
                    </h4>
                    <p className="text-sm text-gray-400">
                      Comprehensive incident overview
                    </p>
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-left">
                    <h4 className="text-white font-medium">
                      Forensic Analysis Report
                    </h4>
                    <p className="text-sm text-gray-400">
                      Technical findings and evidence
                    </p>
                  </button>
                  <button className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-left">
                    <h4 className="text-white font-medium">
                      Executive Summary
                    </h4>
                    <p className="text-sm text-gray-400">
                      High-level incident briefing
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Recent Reports
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Weekly Security Report",
                      date: "2024-01-15",
                      type: "Summary",
                    },
                    {
                      name: "Incident Response #INC-001",
                      date: "2024-01-12",
                      type: "Incident",
                    },
                    {
                      name: "Q4 Threat Analysis",
                      date: "2024-01-10",
                      type: "Analysis",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <h4 className="text-white font-medium">
                          {report.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {report.date} • {report.type}
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-slate-600 text-gray-300 rounded hover:bg-slate-500 transition-colors">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Response Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auto-Assignment
                    </label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                      <option>Round Robin</option>
                      <option>Load Balanced</option>
                      <option>Skill Based</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Escalation Time
                    </label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notification Channels
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2"
                        />
                        <span className="text-gray-300">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2"
                        />
                        <span className="text-gray-300">Slack</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-gray-300">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Integration Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SIEM Integration
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Splunk</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Threat Intelligence
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">MISP</span>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ticketing System
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Jira</span>
                      <div className="w-12 h-6 bg-yellow-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">IncidentResponse</h1>
                <p className="text-xs text-blue-400">AI Incident Response</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Assistant Button */}
            <Link
              to="/maula-ai"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Live Assistant</span>
            </Link>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {incidents.filter((i) => i.status === "active").length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab("settings")}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-blue-500/20 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon =
                {
                  triage: AlertTriangle,
                  timeline: Clock,
                  forensics: Search,
                  intel: Target,
                  alerts: Bell,
                  tasks: CheckCircle,
                  reports: FileText,
                  settings: Settings,
                }[item.id] || Activity;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white"
                      : "text-gray-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/30">
                <h4 className="text-sm font-bold text-white mb-3">
                  Quick Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Incidents</span>
                    <span className="text-red-400 font-bold">
                      {incidents.filter((i) => i.status === "active").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Critical Threats</span>
                    <span className="text-orange-400 font-bold">
                      {
                        incidents.filter((i) => i.severity === "critical")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Responders</span>
                    <span className="text-green-400 font-bold">
                      {responders.filter((r) => r.status === "active").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label ||
                  "IncidentResponse"}
              </h2>
              <p className="text-gray-400 mt-1">
                {activeTab === "triage" && "Triage and manage active incidents"}
                {activeTab === "timeline" &&
                  "View incident timeline and events"}
                {activeTab === "forensics" &&
                  "Conduct forensic analysis and evidence collection"}
                {activeTab === "intel" &&
                  "Access threat intelligence and indicators"}
                {activeTab === "alerts" && "Monitor and manage security alerts"}
                {activeTab === "tasks" &&
                  "Track response tasks and assignments"}
                {activeTab === "reports" &&
                  "Generate incident reports and analytics"}
                {activeTab === "settings" &&
                  "Configure incident response settings"}
              </p>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncidentResponseDashboard;
