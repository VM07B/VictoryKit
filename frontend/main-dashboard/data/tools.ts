// Tool data with rich details for scroll sections
export interface Tool {
  id: number;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  category: string;
  subdomain: string;
  color: string;
  gradient: string;
  icon: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

export const toolCategories = [
  { id: 'threat', name: 'Threat Detection', color: 'red' },
  { id: 'compliance', name: 'Compliance', color: 'teal' },
  { id: 'network', name: 'Network Security', color: 'blue' },
  { id: 'ai', name: 'AI-Powered', color: 'purple' },
  { id: 'identity', name: 'Identity & Access', color: 'pink' },
  { id: 'data', name: 'Data Protection', color: 'green' },
  { id: 'cloud', name: 'Cloud Security', color: 'sky' },
  { id: 'response', name: 'Incident Response', color: 'orange' },
];

export const tools: Tool[] = [
  {
    id: 1,
    name: "FraudGuard",
    tagline: "Stop fraud before it starts",
    description: "AI-powered fraud detection that analyzes patterns in real-time, identifying suspicious activities with 99.9% accuracy. Protect your business from financial crimes with machine learning that evolves with threats.",
    features: [
      "Real-time transaction monitoring",
      "ML-powered pattern recognition",
      "Behavioral analytics engine",
      "Custom rule configuration"
    ],
    category: "Fraud Detection",
    subdomain: "fguard.maula.ai",
    color: "from-red-500 to-pink-500",
    gradient: "linear-gradient(135deg, #ef4444, #ec4899)",
    icon: "shield-alert",
    stats: [
      { label: "Accuracy", value: "99.9%" },
      { label: "Response", value: "<50ms" },
      { label: "Threats Blocked", value: "10M+" }
    ]
  },
  {
    id: 2,
    name: "IntelliScout",
    tagline: "Intelligence that sees everything",
    description: "Advanced threat intelligence platform that monitors dark web markets, forums, and encrypted channels. Get early warnings about emerging threats targeting your organization.",
    features: [
      "Dark web monitoring",
      "Threat actor tracking",
      "IOC detection & sharing",
      "Automated intelligence feeds"
    ],
    category: "Intelligence",
    subdomain: "iscout.maula.ai",
    color: "from-blue-500 to-cyan-500",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    icon: "radar",
    stats: [
      { label: "Sources", value: "50K+" },
      { label: "Coverage", value: "Global" },
      { label: "Updates", value: "Real-time" }
    ]
  },
  {
    id: 3,
    name: "ThreatRadar",
    tagline: "360° threat visibility",
    description: "Comprehensive threat detection system that correlates signals across your entire infrastructure. Unified visibility into network, endpoint, and cloud threats with AI-driven prioritization.",
    features: [
      "Multi-vector threat detection",
      "AI threat prioritization",
      "Attack chain visualization",
      "Automated threat hunting"
    ],
    category: "Threat Detection",
    subdomain: "tradar.maula.ai",
    color: "from-orange-500 to-red-500",
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
    icon: "target",
    stats: [
      { label: "Detection Rate", value: "99.7%" },
      { label: "MTTD", value: "<1min" },
      { label: "False Positives", value: "<0.1%" }
    ]
  },
  {
    id: 4,
    name: "MalwareHunter",
    tagline: "Hunt malware with precision",
    description: "Advanced malware analysis platform using sandboxing, static analysis, and behavioral detection. Identify zero-day threats and APT malware with deep inspection capabilities.",
    features: [
      "Dynamic sandbox analysis",
      "Static code inspection",
      "Behavioral fingerprinting",
      "YARA rule matching"
    ],
    category: "Malware",
    subdomain: "mhunter.maula.ai",
    color: "from-purple-500 to-pink-500",
    gradient: "linear-gradient(135deg, #a855f7, #ec4899)",
    icon: "bug",
    stats: [
      { label: "Samples/Day", value: "1M+" },
      { label: "Zero-Days", value: "500+" },
      { label: "Analysis Time", value: "<30s" }
    ]
  },
  {
    id: 5,
    name: "PhishGuard",
    tagline: "Catch every phish in the net",
    description: "Multi-layered phishing detection that analyzes URLs, emails, and web content. Protect your users from credential theft, business email compromise, and social engineering attacks.",
    features: [
      "URL reputation scanning",
      "Email header analysis",
      "Visual similarity detection",
      "Real-time blocklist updates"
    ],
    category: "Phishing",
    subdomain: "pguard.maula.ai",
    color: "from-green-500 to-emerald-500",
    gradient: "linear-gradient(135deg, #22c55e, #10b981)",
    icon: "fish-off",
    stats: [
      { label: "Phishing Blocked", value: "5M+" },
      { label: "Detection Rate", value: "99.8%" },
      { label: "URL Scans/Day", value: "100M+" }
    ]
  },
  {
    id: 6,
    name: "VulnScan",
    tagline: "Find weaknesses before attackers do",
    description: "Continuous vulnerability scanning for your entire attack surface. Identify CVEs, misconfigurations, and security gaps with prioritized remediation guidance.",
    features: [
      "Authenticated scanning",
      "CVE database integration",
      "Risk-based prioritization",
      "Remediation workflows"
    ],
    category: "Vulnerability",
    subdomain: "vscan.maula.ai",
    color: "from-yellow-500 to-orange-500",
    gradient: "linear-gradient(135deg, #eab308, #f97316)",
    icon: "scan",
    stats: [
      { label: "CVEs Tracked", value: "200K+" },
      { label: "Scan Speed", value: "10K hosts/hr" },
      { label: "Accuracy", value: "99.5%" }
    ]
  },
  {
    id: 7,
    name: "PenTestAI",
    tagline: "AI-driven penetration testing",
    description: "Automated penetration testing powered by AI that thinks like a hacker. Continuous security validation that identifies exploitable vulnerabilities in real-time.",
    features: [
      "Automated exploit testing",
      "Attack path mapping",
      "Privilege escalation detection",
      "Continuous red teaming"
    ],
    category: "Penetration Testing",
    subdomain: "pentest.maula.ai",
    color: "from-red-500 to-rose-500",
    gradient: "linear-gradient(135deg, #ef4444, #f43f5e)",
    icon: "crosshair",
    stats: [
      { label: "Attack Vectors", value: "1000+" },
      { label: "Exploits Tested", value: "50K+" },
      { label: "Coverage", value: "Full Stack" }
    ]
  },
  {
    id: 8,
    name: "SecureCode",
    tagline: "Code security from the start",
    description: "Static and dynamic application security testing integrated into your CI/CD pipeline. Find vulnerabilities in your code before they reach production.",
    features: [
      "SAST & DAST scanning",
      "CI/CD integration",
      "Secrets detection",
      "Dependency analysis"
    ],
    category: "Code Security",
    subdomain: "scode.maula.ai",
    color: "from-indigo-500 to-purple-500",
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    icon: "code",
    stats: [
      { label: "Languages", value: "30+" },
      { label: "Rules", value: "5000+" },
      { label: "False Positive Rate", value: "<5%" }
    ]
  },
  {
    id: 9,
    name: "ComplianceCheck",
    tagline: "Compliance made simple",
    description: "Automated compliance monitoring and reporting for SOC2, ISO 27001, NIST, and more. Continuous control validation with audit-ready evidence collection.",
    features: [
      "Multi-framework support",
      "Automated evidence collection",
      "Gap analysis & remediation",
      "Audit-ready reporting"
    ],
    category: "Compliance",
    subdomain: "compliance.maula.ai",
    color: "from-teal-500 to-cyan-500",
    gradient: "linear-gradient(135deg, #14b8a6, #06b6d4)",
    icon: "clipboard-check",
    stats: [
      { label: "Frameworks", value: "20+" },
      { label: "Controls", value: "1000+" },
      { label: "Automation", value: "90%" }
    ]
  },
  {
    id: 10,
    name: "DataGuardian",
    tagline: "Protect what matters most",
    description: "Enterprise data loss prevention with intelligent content inspection. Discover, classify, and protect sensitive data across your organization.",
    features: [
      "Data discovery & classification",
      "DLP policy enforcement",
      "Encryption automation",
      "Access monitoring"
    ],
    category: "Data Protection",
    subdomain: "dguardian.maula.ai",
    color: "from-blue-500 to-indigo-500",
    gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
    icon: "database",
    stats: [
      { label: "Data Types", value: "100+" },
      { label: "Sensitivity Levels", value: "Custom" },
      { label: "Encryption", value: "AES-256" }
    ]
  },
  {
    id: 11,
    name: "CryptoShield",
    tagline: "Cryptography you can trust",
    description: "Enterprise-grade cryptographic services including key management, certificate lifecycle, and HSM integration. Secure your secrets with military-grade encryption.",
    features: [
      "Key lifecycle management",
      "Certificate automation",
      "HSM integration",
      "Crypto agility"
    ],
    category: "Cryptography",
    subdomain: "cshield.maula.ai",
    color: "from-violet-500 to-purple-500",
    gradient: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    icon: "key",
    stats: [
      { label: "Algorithms", value: "50+" },
      { label: "Key Types", value: "All Major" },
      { label: "Uptime", value: "99.99%" }
    ]
  },
  {
    id: 12,
    name: "IAMControl",
    tagline: "Identity is the new perimeter",
    description: "Unified identity and access management with zero-trust principles. Manage users, roles, and permissions across your entire infrastructure from one platform.",
    features: [
      "SSO & MFA integration",
      "Role-based access control",
      "Just-in-time access",
      "Identity governance"
    ],
    category: "IAM",
    subdomain: "iamctrl.maula.ai",
    color: "from-pink-500 to-rose-500",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    icon: "user-check",
    stats: [
      { label: "Integrations", value: "200+" },
      { label: "Auth Methods", value: "15+" },
      { label: "Users", value: "Unlimited" }
    ]
  },
  {
    id: 13,
    name: "LogIntel",
    tagline: "Intelligence from every log",
    description: "Centralized log management with AI-powered analysis. Collect, parse, and correlate logs from any source to detect anomalies and investigate incidents.",
    features: [
      "Universal log collection",
      "Real-time correlation",
      "AI anomaly detection",
      "Forensic search"
    ],
    category: "Logging",
    subdomain: "logintel.maula.ai",
    color: "from-amber-500 to-orange-500",
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
    icon: "file-text",
    stats: [
      { label: "Events/Second", value: "1M+" },
      { label: "Retention", value: "Custom" },
      { label: "Parsers", value: "500+" }
    ]
  },
  {
    id: 14,
    name: "NetDefender",
    tagline: "Network security reimagined",
    description: "Advanced network security with deep packet inspection, IDS/IPS, and network segmentation. Protect your infrastructure from network-based attacks.",
    features: [
      "Deep packet inspection",
      "IDS/IPS engine",
      "Micro-segmentation",
      "Traffic analysis"
    ],
    category: "Network",
    subdomain: "ndefender.maula.ai",
    color: "from-cyan-500 to-blue-500",
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    icon: "network",
    stats: [
      { label: "Throughput", value: "100Gbps" },
      { label: "Signatures", value: "50K+" },
      { label: "Latency", value: "<1ms" }
    ]
  },
  {
    id: 15,
    name: "EndpointShield",
    tagline: "Protect every endpoint",
    description: "Next-generation endpoint protection with EDR capabilities. Detect, prevent, and respond to threats on laptops, desktops, and servers.",
    features: [
      "Real-time protection",
      "EDR capabilities",
      "Behavioral analysis",
      "Automated response"
    ],
    category: "Endpoint",
    subdomain: "eshield.maula.ai",
    color: "from-lime-500 to-green-500",
    gradient: "linear-gradient(135deg, #84cc16, #22c55e)",
    icon: "laptop",
    stats: [
      { label: "Platforms", value: "Win/Mac/Linux" },
      { label: "Detection Rate", value: "99.9%" },
      { label: "Response Time", value: "<10s" }
    ]
  },
  {
    id: 16,
    name: "CloudSecure",
    tagline: "Secure your cloud journey",
    description: "Cloud security posture management for AWS, Azure, and GCP. Continuous monitoring, misconfiguration detection, and compliance enforcement.",
    features: [
      "Multi-cloud support",
      "CSPM capabilities",
      "Infrastructure as Code scanning",
      "Cloud compliance"
    ],
    category: "Cloud",
    subdomain: "csecure.maula.ai",
    color: "from-sky-500 to-blue-500",
    gradient: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
    icon: "cloud",
    stats: [
      { label: "Cloud Providers", value: "AWS/Azure/GCP" },
      { label: "Checks", value: "1000+" },
      { label: "Remediation", value: "Auto" }
    ]
  },
  {
    id: 17,
    name: "APIGuardian",
    tagline: "Secure every API call",
    description: "API security testing and runtime protection. Discover shadow APIs, test for vulnerabilities, and protect against API-specific attacks.",
    features: [
      "API discovery",
      "OWASP API Top 10",
      "Runtime protection",
      "Rate limiting"
    ],
    category: "API",
    subdomain: "aguardian.maula.ai",
    color: "from-fuchsia-500 to-pink-500",
    gradient: "linear-gradient(135deg, #d946ef, #ec4899)",
    icon: "plug",
    stats: [
      { label: "APIs Protected", value: "Unlimited" },
      { label: "Attack Types", value: "50+" },
      { label: "Latency Added", value: "<5ms" }
    ]
  },
  {
    id: 18,
    name: "ContainerWatch",
    tagline: "Container security done right",
    description: "Container and Kubernetes security from build to runtime. Image scanning, runtime protection, and compliance for containerized workloads.",
    features: [
      "Image vulnerability scanning",
      "Runtime protection",
      "K8s security policies",
      "Container forensics"
    ],
    category: "Container",
    subdomain: "cwatch.maula.ai",
    color: "from-emerald-500 to-teal-500",
    gradient: "linear-gradient(135deg, #10b981, #14b8a6)",
    icon: "box",
    stats: [
      { label: "Registries", value: "All Major" },
      { label: "CVE Database", value: "200K+" },
      { label: "Scan Time", value: "<30s" }
    ]
  },
  {
    id: 19,
    name: "DevSecOps",
    tagline: "Security at the speed of DevOps",
    description: "Integrate security into every stage of your development lifecycle. Shift left with automated security testing in your CI/CD pipelines.",
    features: [
      "Pipeline security",
      "IaC scanning",
      "Secret detection",
      "Security gates"
    ],
    category: "DevSecOps",
    subdomain: "devsecops.maula.ai",
    color: "from-rose-500 to-red-500",
    gradient: "linear-gradient(135deg, #f43f5e, #ef4444)",
    icon: "git-branch",
    stats: [
      { label: "CI/CD Tools", value: "20+" },
      { label: "Scan Time", value: "<5min" },
      { label: "Coverage", value: "Full Pipeline" }
    ]
  },
  {
    id: 20,
    name: "IncidentCommand",
    tagline: "Respond faster, recover stronger",
    description: "Incident response platform with automated playbooks, evidence collection, and team collaboration. Reduce MTTR with structured incident management.",
    features: [
      "Incident playbooks",
      "Evidence preservation",
      "Team collaboration",
      "Post-incident reporting"
    ],
    category: "Incident Response",
    subdomain: "incident.maula.ai",
    color: "from-red-600 to-orange-600",
    gradient: "linear-gradient(135deg, #dc2626, #ea580c)",
    icon: "alert-triangle",
    stats: [
      { label: "MTTR Reduction", value: "60%" },
      { label: "Playbooks", value: "100+" },
      { label: "Integrations", value: "50+" }
    ]
  },
  {
    id: 21,
    name: "ForensicsLab",
    tagline: "Digital forensics at scale",
    description: "Enterprise digital forensics platform for investigations. Collect, preserve, and analyze digital evidence with chain of custody tracking.",
    features: [
      "Evidence acquisition",
      "Timeline analysis",
      "Memory forensics",
      "Chain of custody"
    ],
    category: "Forensics",
    subdomain: "forensics.maula.ai",
    color: "from-slate-500 to-gray-500",
    gradient: "linear-gradient(135deg, #64748b, #6b7280)",
    icon: "microscope",
    stats: [
      { label: "Data Sources", value: "50+" },
      { label: "Analysis Types", value: "20+" },
      { label: "Export Formats", value: "All Major" }
    ]
  },
  {
    id: 22,
    name: "ThreatIntel",
    tagline: "Know your enemy",
    description: "Threat intelligence platform with IOC feeds, threat actor profiles, and campaign tracking. Stay ahead of adversaries with actionable intelligence.",
    features: [
      "IOC management",
      "Threat actor tracking",
      "Campaign analysis",
      "STIX/TAXII support"
    ],
    category: "Intelligence",
    subdomain: "tintel.maula.ai",
    color: "from-red-500 to-pink-600",
    gradient: "linear-gradient(135deg, #ef4444, #db2777)",
    icon: "eye",
    stats: [
      { label: "Intel Sources", value: "100+" },
      { label: "IOCs", value: "10M+" },
      { label: "Updates", value: "Real-time" }
    ]
  },
  {
    id: 23,
    name: "BehaviorWatch",
    tagline: "Behavior tells the story",
    description: "User and entity behavior analytics powered by machine learning. Detect insider threats, compromised accounts, and anomalous activities.",
    features: [
      "UEBA capabilities",
      "Baseline profiling",
      "Anomaly detection",
      "Risk scoring"
    ],
    category: "Behavior",
    subdomain: "bwatch.maula.ai",
    color: "from-purple-600 to-indigo-600",
    gradient: "linear-gradient(135deg, #9333ea, #4f46e5)",
    icon: "activity",
    stats: [
      { label: "Entities Tracked", value: "Unlimited" },
      { label: "ML Models", value: "20+" },
      { label: "Detection Time", value: "<1hr" }
    ]
  },
  {
    id: 24,
    name: "AnomalyDetect",
    tagline: "Find the needle in the haystack",
    description: "AI-powered anomaly detection across your entire infrastructure. Identify unusual patterns that signal potential security incidents.",
    features: [
      "Multi-dimensional analysis",
      "Unsupervised learning",
      "Real-time alerting",
      "Pattern visualization"
    ],
    category: "Anomaly",
    subdomain: "anomaly.maula.ai",
    color: "from-orange-600 to-red-600",
    gradient: "linear-gradient(135deg, #ea580c, #dc2626)",
    icon: "bar-chart",
    stats: [
      { label: "Data Points/Sec", value: "10M+" },
      { label: "Accuracy", value: "98%" },
      { label: "False Positives", value: "<1%" }
    ]
  },
  {
    id: 25,
    name: "RedTeamAI",
    tagline: "Think like an attacker",
    description: "AI-powered red team automation for continuous adversary simulation. Test your defenses against real-world attack techniques.",
    features: [
      "MITRE ATT&CK mapping",
      "Automated attack chains",
      "Evasion techniques",
      "Defense validation"
    ],
    category: "Red Team",
    subdomain: "redteam.maula.ai",
    color: "from-red-700 to-rose-700",
    gradient: "linear-gradient(135deg, #b91c1c, #be123c)",
    icon: "skull",
    stats: [
      { label: "Attack Techniques", value: "200+" },
      { label: "Evasion Methods", value: "50+" },
      { label: "Reporting", value: "Detailed" }
    ]
  },
  {
    id: 26,
    name: "BlueTeamAI",
    tagline: "Defend with intelligence",
    description: "AI-powered blue team operations center. Automate defense operations, threat hunting, and incident triage with machine learning.",
    features: [
      "Automated triage",
      "Threat hunting",
      "Playbook automation",
      "Defense metrics"
    ],
    category: "Blue Team",
    subdomain: "blueteam.maula.ai",
    color: "from-blue-700 to-cyan-700",
    gradient: "linear-gradient(135deg, #1d4ed8, #0e7490)",
    icon: "shield",
    stats: [
      { label: "Triage Speed", value: "10x Faster" },
      { label: "Automation", value: "80%" },
      { label: "Coverage", value: "24/7" }
    ]
  },
  {
    id: 27,
    name: "SIEMCommander",
    tagline: "Command your security data",
    description: "Next-generation SIEM with unlimited data ingestion and AI-powered analytics. Correlate events across your entire infrastructure.",
    features: [
      "Unlimited data ingestion",
      "Real-time correlation",
      "Custom detection rules",
      "Investigation workbench"
    ],
    category: "SIEM",
    subdomain: "siem.maula.ai",
    color: "from-indigo-600 to-purple-600",
    gradient: "linear-gradient(135deg, #4f46e5, #9333ea)",
    icon: "monitor",
    stats: [
      { label: "EPS", value: "1M+" },
      { label: "Retention", value: "Custom" },
      { label: "Correlation Rules", value: "500+" }
    ]
  },
  {
    id: 28,
    name: "SOAREngine",
    tagline: "Orchestrate your response",
    description: "Security orchestration, automation, and response platform. Connect your security tools and automate incident response workflows.",
    features: [
      "500+ integrations",
      "Visual playbook builder",
      "Case management",
      "Metrics & reporting"
    ],
    category: "SOAR",
    subdomain: "soar.maula.ai",
    color: "from-violet-600 to-purple-700",
    gradient: "linear-gradient(135deg, #7c3aed, #7e22ce)",
    icon: "workflow",
    stats: [
      { label: "Integrations", value: "500+" },
      { label: "MTTR Reduction", value: "90%" },
      { label: "Automation Rate", value: "95%" }
    ]
  },
  {
    id: 29,
    name: "RiskScoreAI",
    tagline: "Quantify your risk",
    description: "AI-powered risk assessment and scoring. Continuously evaluate your security posture and prioritize remediation based on risk impact.",
    features: [
      "Risk quantification",
      "Attack simulation",
      "Business impact analysis",
      "Board reporting"
    ],
    category: "Risk",
    subdomain: "riskscore.maula.ai",
    color: "from-yellow-600 to-amber-600",
    gradient: "linear-gradient(135deg, #ca8a04, #d97706)",
    icon: "gauge",
    stats: [
      { label: "Risk Factors", value: "200+" },
      { label: "Accuracy", value: "95%" },
      { label: "Updates", value: "Real-time" }
    ]
  },
  {
    id: 30,
    name: "PolicyEngine",
    tagline: "Policy as code",
    description: "Centralized security policy management with automated enforcement. Define policies once, enforce everywhere across your infrastructure.",
    features: [
      "Policy as code",
      "Multi-cloud enforcement",
      "Drift detection",
      "Compliance mapping"
    ],
    category: "Policy",
    subdomain: "policy.maula.ai",
    color: "from-teal-600 to-cyan-600",
    gradient: "linear-gradient(135deg, #0d9488, #0891b2)",
    icon: "file-cog",
    stats: [
      { label: "Policy Templates", value: "500+" },
      { label: "Platforms", value: "All Major" },
      { label: "Enforcement", value: "Real-time" }
    ]
  },
  {
    id: 31,
    name: "AuditTracker",
    tagline: "Audit with confidence",
    description: "Comprehensive audit management with automated evidence collection and reporting. Simplify compliance audits with continuous monitoring.",
    features: [
      "Audit automation",
      "Evidence collection",
      "Stakeholder reporting",
      "Remediation tracking"
    ],
    category: "Audit",
    subdomain: "audit.maula.ai",
    color: "from-blue-600 to-indigo-700",
    gradient: "linear-gradient(135deg, #2563eb, #4338ca)",
    icon: "clipboard-list",
    stats: [
      { label: "Audit Types", value: "All Major" },
      { label: "Automation", value: "85%" },
      { label: "Time Saved", value: "70%" }
    ]
  },
  {
    id: 32,
    name: "ZeroTrustAI",
    tagline: "Trust nothing, verify everything",
    description: "Zero trust architecture implementation with continuous verification. Never trust, always verify every user, device, and connection.",
    features: [
      "Continuous verification",
      "Micro-segmentation",
      "Device trust scoring",
      "Adaptive access"
    ],
    category: "Zero Trust",
    subdomain: "zerotrust.maula.ai",
    color: "from-gray-600 to-slate-700",
    gradient: "linear-gradient(135deg, #4b5563, #334155)",
    icon: "lock",
    stats: [
      { label: "Verification Points", value: "Continuous" },
      { label: "Access Decisions", value: "Real-time" },
      { label: "Risk Reduction", value: "80%" }
    ]
  },
  {
    id: 33,
    name: "PasswordVault",
    tagline: "Secrets management done right",
    description: "Enterprise password and secrets management. Store, rotate, and audit access to credentials across your organization.",
    features: [
      "Secure credential storage",
      "Automated rotation",
      "Just-in-time access",
      "Audit logging"
    ],
    category: "Password",
    subdomain: "pvault.maula.ai",
    color: "from-green-600 to-emerald-700",
    gradient: "linear-gradient(135deg, #16a34a, #047857)",
    icon: "vault",
    stats: [
      { label: "Encryption", value: "AES-256" },
      { label: "Rotation", value: "Automated" },
      { label: "Audit Trail", value: "Complete" }
    ]
  },
  {
    id: 34,
    name: "BiometricAI",
    tagline: "Your identity is the key",
    description: "AI-powered biometric authentication. Secure access with face, voice, and behavioral biometrics with liveness detection.",
    features: [
      "Multi-modal biometrics",
      "Liveness detection",
      "Behavioral analysis",
      "Anti-spoofing"
    ],
    category: "Biometric",
    subdomain: "biometric.maula.ai",
    color: "from-pink-600 to-rose-700",
    gradient: "linear-gradient(135deg, #db2777, #be123c)",
    icon: "fingerprint",
    stats: [
      { label: "Accuracy", value: "99.99%" },
      { label: "Modalities", value: "Face/Voice/Behavior" },
      { label: "Speed", value: "<1s" }
    ]
  },
  {
    id: 35,
    name: "EmailGuard",
    tagline: "Secure every inbox",
    description: "Advanced email security with threat detection, DLP, and encryption. Protect against phishing, malware, and data exfiltration via email.",
    features: [
      "Threat scanning",
      "DLP enforcement",
      "Email encryption",
      "Quarantine management"
    ],
    category: "Email",
    subdomain: "emailguard.maula.ai",
    color: "from-sky-600 to-blue-700",
    gradient: "linear-gradient(135deg, #0284c7, #1d4ed8)",
    icon: "mail",
    stats: [
      { label: "Emails Scanned/Day", value: "100M+" },
      { label: "Threat Detection", value: "99.9%" },
      { label: "Latency", value: "<100ms" }
    ]
  },
  {
    id: 36,
    name: "WebFilter",
    tagline: "Safe browsing guaranteed",
    description: "Advanced web filtering with category-based policies and threat protection. Control web access and protect users from malicious sites.",
    features: [
      "URL categorization",
      "Threat blocking",
      "SSL inspection",
      "Usage reporting"
    ],
    category: "Web",
    subdomain: "webfilter.maula.ai",
    color: "from-lime-600 to-green-700",
    gradient: "linear-gradient(135deg, #65a30d, #15803d)",
    icon: "globe",
    stats: [
      { label: "Categories", value: "100+" },
      { label: "URLs Classified", value: "1B+" },
      { label: "Updates", value: "Real-time" }
    ]
  },
  {
    id: 37,
    name: "DNSShield",
    tagline: "DNS security layer",
    description: "DNS-layer security that blocks threats before they reach your network. Prevent malware, phishing, and C2 communications at the DNS level.",
    features: [
      "DNS filtering",
      "Threat intelligence",
      "DoH/DoT support",
      "Query analytics"
    ],
    category: "DNS",
    subdomain: "dnsshield.maula.ai",
    color: "from-cyan-600 to-teal-700",
    gradient: "linear-gradient(135deg, #0891b2, #0f766e)",
    icon: "server",
    stats: [
      { label: "Queries/Day", value: "1B+" },
      { label: "Threat Domains", value: "10M+" },
      { label: "Latency", value: "<10ms" }
    ]
  },
  {
    id: 38,
    name: "FirewallAI",
    tagline: "Intelligent perimeter defense",
    description: "AI-powered next-generation firewall with advanced threat prevention. Intelligent traffic analysis with automated policy optimization.",
    features: [
      "Application awareness",
      "IPS integration",
      "Threat prevention",
      "Policy automation"
    ],
    category: "Firewall",
    subdomain: "firewall.maula.ai",
    color: "from-orange-700 to-red-800",
    gradient: "linear-gradient(135deg, #c2410c, #991b1b)",
    icon: "flame",
    stats: [
      { label: "Throughput", value: "100Gbps" },
      { label: "Rules", value: "Unlimited" },
      { label: "Threat Prevention", value: "99.9%" }
    ]
  },
  {
    id: 39,
    name: "VPNGuardian",
    tagline: "Secure remote access",
    description: "Enterprise VPN with zero-trust network access. Secure remote connections with granular access controls and continuous verification.",
    features: [
      "ZTNA integration",
      "Split tunneling",
      "Device posture check",
      "Session recording"
    ],
    category: "VPN",
    subdomain: "vpnguard.maula.ai",
    color: "from-indigo-700 to-purple-800",
    gradient: "linear-gradient(135deg, #4338ca, #6b21a8)",
    icon: "shield-check",
    stats: [
      { label: "Concurrent Users", value: "Unlimited" },
      { label: "Encryption", value: "AES-256" },
      { label: "Protocols", value: "All Major" }
    ]
  },
  {
    id: 40,
    name: "WirelessWatch",
    tagline: "Secure your airwaves",
    description: "Wireless intrusion detection and prevention. Monitor your wireless networks for rogue access points, evil twins, and wireless attacks.",
    features: [
      "Rogue AP detection",
      "Wireless IDS/IPS",
      "Spectrum analysis",
      "Location tracking"
    ],
    category: "Wireless",
    subdomain: "wireless.maula.ai",
    color: "from-violet-700 to-fuchsia-800",
    gradient: "linear-gradient(135deg, #6d28d9, #a21caf)",
    icon: "wifi",
    stats: [
      { label: "Protocols", value: "802.11a/b/g/n/ac/ax" },
      { label: "Detection", value: "Real-time" },
      { label: "Coverage", value: "Enterprise" }
    ]
  },
  {
    id: 41,
    name: "IoTSecure",
    tagline: "Secure the connected world",
    description: "IoT security platform for device discovery, monitoring, and protection. Secure your IoT ecosystem from vulnerabilities and attacks.",
    features: [
      "Device discovery",
      "Behavior monitoring",
      "Firmware analysis",
      "Network segmentation"
    ],
    category: "IoT",
    subdomain: "iotsecure.maula.ai",
    color: "from-emerald-700 to-teal-800",
    gradient: "linear-gradient(135deg, #047857, #115e59)",
    icon: "cpu",
    stats: [
      { label: "Devices Supported", value: "10K+" },
      { label: "Protocols", value: "50+" },
      { label: "Visibility", value: "Complete" }
    ]
  },
  {
    id: 42,
    name: "MobileDefend",
    tagline: "Mobile security everywhere",
    description: "Mobile threat defense for iOS and Android. Protect mobile devices from malware, phishing, and network attacks.",
    features: [
      "Mobile threat detection",
      "App security",
      "Network protection",
      "Device compliance"
    ],
    category: "Mobile",
    subdomain: "mdefend.maula.ai",
    color: "from-blue-700 to-sky-800",
    gradient: "linear-gradient(135deg, #1d4ed8, #0369a1)",
    icon: "smartphone",
    stats: [
      { label: "Platforms", value: "iOS/Android" },
      { label: "Threat Detection", value: "99.9%" },
      { label: "Battery Impact", value: "<1%" }
    ]
  },
  {
    id: 43,
    name: "BackupGuard",
    tagline: "Backup with confidence",
    description: "Secure backup and recovery with ransomware protection. Immutable backups with air-gapped storage and instant recovery.",
    features: [
      "Immutable backups",
      "Ransomware protection",
      "Instant recovery",
      "Compliance retention"
    ],
    category: "Backup",
    subdomain: "backup.maula.ai",
    color: "from-amber-700 to-orange-800",
    gradient: "linear-gradient(135deg, #b45309, #9a3412)",
    icon: "hard-drive",
    stats: [
      { label: "Recovery Time", value: "<1min" },
      { label: "Retention", value: "Custom" },
      { label: "Encryption", value: "AES-256" }
    ]
  },
  {
    id: 44,
    name: "DRPlan",
    tagline: "Disaster recovery made simple",
    description: "Comprehensive disaster recovery planning and orchestration. Automate failover, testing, and recovery procedures.",
    features: [
      "DR automation",
      "Failover orchestration",
      "Testing & validation",
      "RTO/RPO management"
    ],
    category: "DR",
    subdomain: "drplan.maula.ai",
    color: "from-red-800 to-rose-900",
    gradient: "linear-gradient(135deg, #991b1b, #881337)",
    icon: "refresh-cw",
    stats: [
      { label: "RTO", value: "<15min" },
      { label: "RPO", value: "<5min" },
      { label: "Test Frequency", value: "Automated" }
    ]
  },
  {
    id: 45,
    name: "PrivacyShield",
    tagline: "Privacy by design",
    description: "Privacy management platform for data subject requests, consent management, and privacy impact assessments.",
    features: [
      "DSR automation",
      "Consent management",
      "Privacy assessments",
      "Data mapping"
    ],
    category: "Privacy",
    subdomain: "privacy.maula.ai",
    color: "from-slate-700 to-gray-800",
    gradient: "linear-gradient(135deg, #334155, #1f2937)",
    icon: "eye-off",
    stats: [
      { label: "DSR Response", value: "<24hrs" },
      { label: "Regulations", value: "GDPR/CCPA/+" },
      { label: "Automation", value: "90%" }
    ]
  },
  {
    id: 46,
    name: "GDPRCompliance",
    tagline: "GDPR made manageable",
    description: "Complete GDPR compliance management. Data mapping, DPIA automation, and breach notification with full audit trails.",
    features: [
      "Data inventory",
      "DPIA automation",
      "Breach management",
      "Vendor assessment"
    ],
    category: "GDPR",
    subdomain: "gdpr.maula.ai",
    color: "from-teal-700 to-cyan-800",
    gradient: "linear-gradient(135deg, #0f766e, #0e7490)",
    icon: "eu",
    stats: [
      { label: "Articles Covered", value: "All 99" },
      { label: "Templates", value: "100+" },
      { label: "Audit Ready", value: "Always" }
    ]
  },
  {
    id: 47,
    name: "HIPAAGuard",
    tagline: "Healthcare compliance simplified",
    description: "HIPAA compliance management for healthcare organizations. PHI protection, access controls, and audit logging.",
    features: [
      "PHI discovery",
      "Access monitoring",
      "Breach assessment",
      "Training management"
    ],
    category: "HIPAA",
    subdomain: "hipaa.maula.ai",
    color: "from-green-700 to-lime-800",
    gradient: "linear-gradient(135deg, #15803d, #4d7c0f)",
    icon: "heart-pulse",
    stats: [
      { label: "Controls", value: "All HIPAA" },
      { label: "BAA Support", value: "Yes" },
      { label: "Audit Ready", value: "Always" }
    ]
  },
  {
    id: 48,
    name: "PCI-DSS",
    tagline: "Payment security assured",
    description: "PCI-DSS compliance for payment card security. Cardholder data protection, network security, and continuous monitoring.",
    features: [
      "CDE discovery",
      "Requirement mapping",
      "ASV scanning",
      "Compliance reporting"
    ],
    category: "PCI-DSS",
    subdomain: "pcidss.maula.ai",
    color: "from-purple-700 to-violet-800",
    gradient: "linear-gradient(135deg, #7e22ce, #5b21b6)",
    icon: "credit-card",
    stats: [
      { label: "Requirements", value: "All 12" },
      { label: "SAQ Types", value: "All" },
      { label: "Scan Frequency", value: "Continuous" }
    ]
  },
  {
    id: 49,
    name: "BugBountyAI",
    tagline: "Crowdsource your security",
    description: "AI-powered bug bounty platform. Manage vulnerability submissions, automate triage, and reward researchers fairly.",
    features: [
      "Submission management",
      "AI-powered triage",
      "Researcher rewards",
      "Vulnerability tracking"
    ],
    category: "Bug Bounty",
    subdomain: "bugbounty.maula.ai",
    color: "from-yellow-700 to-amber-800",
    gradient: "linear-gradient(135deg, #a16207, #92400e)",
    icon: "bug",
    stats: [
      { label: "Researchers", value: "50K+" },
      { label: "Triage Time", value: "<1hr" },
      { label: "Payout Speed", value: "<24hrs" }
    ]
  },
  {
    id: 50,
    name: "CyberEduAI",
    tagline: "Security awareness that works",
    description: "AI-powered security awareness training. Personalized learning paths, phishing simulations, and compliance training.",
    features: [
      "Adaptive learning",
      "Phishing simulations",
      "Compliance courses",
      "Progress tracking"
    ],
    category: "Education",
    subdomain: "cyberedu.maula.ai",
    color: "from-pink-700 to-rose-800",
    gradient: "linear-gradient(135deg, #be185d, #9f1239)",
    icon: "graduation-cap",
    stats: [
      { label: "Courses", value: "200+" },
      { label: "Languages", value: "30+" },
      { label: "Engagement", value: "95%" }
    ]
  }
];

export default tools;
