import { API_ENDPOINTS, THREAT_INTEL_ENDPOINTS } from '../constants';
import { 
  Transaction, 
  FraudScore, 
  Alert, 
  AnalyticsData, 
  ThreatIntelligence,
  IPReputation,
  EmailReputation,
  DeviceReputation,
  Investigation,
  FraudReport,
  SystemHealth,
  StreamingTransaction
} from '../types';

const API_BASE = API_ENDPOINTS.FRAUDGUARD_API;
const ML_BASE = API_ENDPOINTS.ML_API;
const WS_BASE = API_ENDPOINTS.WS_API;

// Enhanced API call with retry logic and auth
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  const token = localStorage.getItem('fraudguard_token') || sessionStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
    'X-Client-Version': '2.0.0',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired, trigger refresh
        localStorage.removeItem('fraudguard_token');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Transaction API
export const transactionAPI = {
  // Analyze a transaction for fraud
  async analyze(transaction: Transaction): Promise<FraudScore> {
    return apiCall<FraudScore>('/transactions/analyze', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  // Get all transactions
  async getAll(params?: {
    limit?: number;
    offset?: number;
    risk_level?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiCall(`/transactions${queryString}`);
  },

  // Get a single transaction by ID
  async getById(transactionId: string): Promise<Transaction & { fraud_score: FraudScore }> {
    return apiCall(`/transactions/${transactionId}`);
  },

  // Batch analyze multiple transactions
  async batchAnalyze(transactions: Transaction[]): Promise<FraudScore[]> {
    return apiCall<FraudScore[]>('/transactions/batch-analyze', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  // Update transaction status
  async updateStatus(
    transactionId: string,
    status: 'approved' | 'declined' | 'review'
  ): Promise<Transaction> {
    return apiCall(`/transactions/${transactionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Fraud Score API
export const fraudScoreAPI = {
  // Get fraud score for a transaction
  async getScore(transactionId: string): Promise<FraudScore> {
    return apiCall(`/fraud-scores/${transactionId}`);
  },

  // Get fraud score history
  async getHistory(transactionId: string): Promise<FraudScore[]> {
    return apiCall(`/fraud-scores/${transactionId}/history`);
  },

  // Get average scores by time period
  async getAverages(period: 'hour' | 'day' | 'week' | 'month'): Promise<{
    period: string;
    average_score: number;
    total_transactions: number;
  }[]> {
    return apiCall(`/fraud-scores/averages?period=${period}`);
  },
};

// Alerts API
export const alertsAPI = {
  // Get all alerts
  async getAll(): Promise<Alert[]> {
    return apiCall('/alerts');
  },

  // Create a new alert
  async create(alert: Omit<Alert, 'id' | 'created_at' | 'triggered_count'>): Promise<Alert> {
    return apiCall<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  // Update an alert
  async update(id: string, updates: Partial<Alert>): Promise<Alert> {
    return apiCall(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete an alert
  async delete(id: string): Promise<void> {
    await apiCall(`/alerts/${id}`, { method: 'DELETE' });
  },

  // Toggle alert active status
  async toggle(id: string, active: boolean): Promise<Alert> {
    return apiCall(`/alerts/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ active }),
    });
  },

  // Get triggered alerts
  async getTriggered(params?: {
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    alert: Alert;
    transaction: Transaction;
    triggered_at: string;
  }[]> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiCall(`/alerts/triggered${queryString}`);
  },
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  async getDashboard(): Promise<AnalyticsData> {
    return apiCall('/analytics/dashboard');
  },

  // Get risk breakdown
  async getRiskBreakdown(period?: 'day' | 'week' | 'month'): Promise<{
    risk_level: string;
    count: number;
    percentage: number;
  }[]> {
    const query = period ? `?period=${period}` : '';
    return apiCall(`/analytics/risk-breakdown${query}`);
  },

  // Get transaction timeline
  async getTimeline(period: 'hour' | 'day' | 'week' | 'month'): Promise<{
    timestamp: string;
    total_transactions: number;
    high_risk_count: number;
    average_score: number;
  }[]> {
    return apiCall(`/analytics/timeline?period=${period}`);
  },

  // Get geographic distribution
  async getGeoDistribution(): Promise<{
    country: string;
    count: number;
    average_risk_score: number;
  }[]> {
    return apiCall('/analytics/geo-distribution');
  },

  // Get fraud patterns
  async getFraudPatterns(): Promise<{
    pattern_type: string;
    occurrence_count: number;
    average_score: number;
    description: string;
  }[]> {
    return apiCall('/analytics/fraud-patterns');
  },
};

// ML Engine API (calls the Python ML service)
export const mlEngineAPI = {
  // Get model info
  async getModelInfo(): Promise<{
    model_version: string;
    last_trained: string;
    accuracy: number;
    features: string[];
  }> {
    return apiCall('/ml/model-info');
  },

  // Explain prediction
  async explainPrediction(transactionId: string): Promise<{
    feature_importance: Record<string, number>;
    decision_path: string[];
    similar_cases: Transaction[];
  }> {
    return apiCall(`/ml/explain/${transactionId}`);
  },

  // Get anomaly detection results
  async detectAnomalies(transactions: Transaction[]): Promise<{
    transaction_id: string;
    is_anomaly: boolean;
    anomaly_score: number;
    anomaly_type: string;
  }[]> {
    return apiCall('/ml/detect-anomalies', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  // Retrain model (admin only)
  async retrainModel(): Promise<{
    status: string;
    message: string;
    job_id: string;
  }> {
    return apiCall('/ml/retrain', { method: 'POST' });
  },
};

// Report Export API
export const reportAPI = {
  // Export PDF report
  async exportPDF(options: {
    start_date: string;
    end_date: string;
    risk_levels: string[];
    include_details: boolean;
    title?: string;
  }): Promise<Blob> {
    const response = await fetch(`${API_BASE}/reports/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF report');
    }

    return response.blob();
  },

  // Export CSV report
  async exportCSV(options: {
    start_date: string;
    end_date: string;
    risk_levels: string[];
    include_details: boolean;
  }): Promise<Blob> {
    const response = await fetch(`${API_BASE}/reports/export/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to generate CSV report');
    }

    return response.blob();
  },

  // Download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<SystemHealth> {
    return apiCall('/health');
  },

  async getMetrics(): Promise<{
    cpu_usage: number;
    memory_usage: number;
    requests_per_minute: number;
    error_rate: number;
    p99_latency: number;
  }> {
    return apiCall('/health/metrics');
  },
};

// Threat Intelligence API
export const threatIntelAPI = {
  // Get full threat intelligence for a transaction
  async analyze(transaction: Transaction): Promise<ThreatIntelligence> {
    return apiCall('/threat-intel/analyze', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  // Check IP reputation
  async checkIP(ip: string): Promise<IPReputation> {
    return apiCall(`/threat-intel/ip/${encodeURIComponent(ip)}`);
  },

  // Check email reputation
  async checkEmail(email: string): Promise<EmailReputation> {
    return apiCall(`/threat-intel/email/${encodeURIComponent(email)}`);
  },

  // Check device fingerprint
  async checkDevice(fingerprint: string): Promise<DeviceReputation> {
    return apiCall(`/threat-intel/device/${encodeURIComponent(fingerprint)}`);
  },

  // Bulk IP check
  async bulkCheckIPs(ips: string[]): Promise<IPReputation[]> {
    return apiCall('/threat-intel/ip/bulk', {
      method: 'POST',
      body: JSON.stringify({ ips }),
    });
  },

  // Add to blacklist
  async addToBlacklist(type: 'ip' | 'email' | 'device' | 'card', value: string, reason: string): Promise<void> {
    await apiCall('/threat-intel/blacklist', {
      method: 'POST',
      body: JSON.stringify({ type, value, reason }),
    });
  },

  // Remove from blacklist
  async removeFromBlacklist(type: 'ip' | 'email' | 'device' | 'card', value: string): Promise<void> {
    await apiCall(`/threat-intel/blacklist/${type}/${encodeURIComponent(value)}`, {
      method: 'DELETE',
    });
  },

  // Get blacklist
  async getBlacklist(type?: 'ip' | 'email' | 'device' | 'card'): Promise<{
    type: string;
    value: string;
    reason: string;
    added_at: string;
    added_by: string;
  }[]> {
    const query = type ? `?type=${type}` : '';
    return apiCall(`/threat-intel/blacklist${query}`);
  },
};

// Investigation API
export const investigationAPI = {
  // Create new investigation
  async create(investigation: Omit<Investigation, 'id' | 'created_at' | 'updated_at'>): Promise<Investigation> {
    return apiCall('/investigations', {
      method: 'POST',
      body: JSON.stringify(investigation),
    });
  },

  // Get all investigations
  async getAll(params?: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    limit?: number;
  }): Promise<Investigation[]> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiCall(`/investigations${queryString}`);
  },

  // Get single investigation
  async getById(id: string): Promise<Investigation> {
    return apiCall(`/investigations/${id}`);
  },

  // Update investigation
  async update(id: string, updates: Partial<Investigation>): Promise<Investigation> {
    return apiCall(`/investigations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Add note to investigation
  async addNote(id: string, content: string): Promise<Investigation> {
    return apiCall(`/investigations/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Add transaction to investigation
  async addTransaction(id: string, transactionId: string): Promise<Investigation> {
    return apiCall(`/investigations/${id}/transactions`, {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId }),
    });
  },

  // Close investigation
  async close(id: string, resolution: string): Promise<Investigation> {
    return apiCall(`/investigations/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  },
};

// Rules Engine API
export const rulesAPI = {
  // Get all rules
  async getAll(): Promise<{
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    enabled: boolean;
    hit_count: number;
  }[]> {
    return apiCall('/rules');
  },

  // Create rule
  async create(rule: {
    name: string;
    condition: string;
    action: 'block' | 'flag' | 'allow' | 'challenge';
    priority: number;
  }): Promise<any> {
    return apiCall('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  // Update rule
  async update(id: string, updates: any): Promise<any> {
    return apiCall(`/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete rule
  async delete(id: string): Promise<void> {
    await apiCall(`/rules/${id}`, { method: 'DELETE' });
  },

  // Test rule
  async test(ruleId: string, transaction: Transaction): Promise<{
    would_trigger: boolean;
    action: string;
    matched_conditions: string[];
  }> {
    return apiCall(`/rules/${ruleId}/test`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },
};

// Compliance API
export const complianceAPI = {
  // Get compliance status
  async getStatus(): Promise<{
    pci_dss: { compliant: boolean; score: number; issues: string[] };
    gdpr: { compliant: boolean; score: number; issues: string[] };
    psd2: { compliant: boolean; score: number; issues: string[] };
    sox: { compliant: boolean; score: number; issues: string[] };
  }> {
    return apiCall('/compliance/status');
  },

  // Get audit log
  async getAuditLog(params?: {
    start_date?: string;
    end_date?: string;
    action_type?: string;
    user?: string;
  }): Promise<{
    timestamp: string;
    action: string;
    user: string;
    resource: string;
    details: any;
  }[]> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiCall(`/compliance/audit-log${queryString}`);
  },

  // Generate compliance report
  async generateReport(framework: 'pci_dss' | 'gdpr' | 'psd2' | 'sox'): Promise<Blob> {
    const response = await fetch(`${API_BASE}/compliance/report/${framework}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.blob();
  },
};

// WebSocket connection for real-time streaming
export class FraudStreamingClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, ((data: any) => void)[]> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('fraudguard_token');
        this.ws = new WebSocket(`${WS_BASE}?token=${token}`);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const handlers = this.handlers.get(data.type) || [];
          handlers.forEach(handler => handler(data.payload));
        };

        this.ws.onclose = () => {
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  on(event: 'transaction' | 'alert' | 'score_update' | 'system_health', handler: (data: any) => void): void {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.handlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  subscribe(channels: string[]): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', channels }));
    }
  }

  unsubscribe(channels: string[]): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', channels }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export combined API object
export const fraudguardAPI = {
  transactions: transactionAPI,
  fraudScores: fraudScoreAPI,
  alerts: alertsAPI,
  analytics: analyticsAPI,
  mlEngine: mlEngineAPI,
  reports: reportAPI,
  health: healthAPI,
  threatIntel: threatIntelAPI,
  investigations: investigationAPI,
  rules: rulesAPI,
  compliance: complianceAPI,
  streaming: new FraudStreamingClient(),
};

export default fraudguardAPI;
