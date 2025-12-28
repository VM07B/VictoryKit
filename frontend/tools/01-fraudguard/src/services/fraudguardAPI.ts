import { API_ENDPOINTS } from '../constants';
import { Transaction, FraudScore, Alert, AnalyticsData } from '../types';

const API_BASE = API_ENDPOINTS.FRAUDGUARD_API;

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
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
  async check(): Promise<{
    status: string;
    services: {
      api: string;
      ml_engine: string;
      ai_assistant: string;
      database: string;
    };
  }> {
    return apiCall('/health');
  },
};

// Export combined API object
export const fraudguardAPI = {
  transactions: transactionAPI,
  fraudScores: fraudScoreAPI,
  alerts: alertsAPI,
  analytics: analyticsAPI,
  mlEngine: mlEngineAPI,
  reports: reportAPI,
  health: healthAPI,
};

export default fraudguardAPI;
