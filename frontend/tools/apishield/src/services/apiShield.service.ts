import axios, { AxiosResponse } from 'axios';

// Types for API Shield
export interface APIShieldEndpoint {
  id: string;
  method: string;
  path: string;
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: any[];
  requestBody?: any;
  responses?: any[];
  security?: any[];
  deprecated?: boolean;
  requiresAuth?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilityCount?: number;
}

export interface APIShieldVulnerability {
  id: string;
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  endpoint: string;
  cweId: string;
  owaspCategory: string;
  evidence: {
    request?: any;
    response?: any;
    payload?: string;
  };
  recommendation?: string;
  status: 'open' | 'fixed' | 'false-positive';
  discoveredAt: string;
  fixedAt?: string;
}

export interface APIShieldScan {
  id: string;
  name: string;
  targetUrl: string;
  scanType: 'full' | 'quick' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  results?: {
    endpoints: APIShieldEndpoint[];
    vulnerabilities: APIShieldVulnerability[];
    statistics: any;
    securityScore: number;
  };
  settings: {
    testCategories: string[];
    authentication?: any;
    maxDuration?: number;
  };
}

export interface APIShieldSpec {
  id: string;
  name: string;
  type: 'openapi' | 'swagger' | 'graphql' | 'grpc';
  version: string;
  content: string;
  endpoints: APIShieldEndpoint[];
  parsedAt: string;
  validationErrors?: string[];
}

export interface APIShieldFuzzResult {
  id: string;
  endpoint: string;
  payload: string;
  category: string;
  severity: string;
  response: {
    statusCode: number;
    body: string;
    responseTime: number;
  };
  isVulnerable: boolean;
  timestamp: string;
}

export interface APIShieldDashboardData {
  totalScans: number;
  activeScans: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  securityScore: number;
  recentScans: APIShieldScan[];
  vulnerabilityTrends: any[];
  endpointRiskDistribution: any[];
  topVulnerabilities: any[];
}

class APIShieldService {
  private baseURL: string;
  private api: any;

  constructor() {
    this.baseURL = process.env.REACT_APP_APISHIELD_API_URL || 'http://localhost:4032/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('apishield_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('apishield_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: { username: string; password: string }) {
    const response = await this.api.post('/auth/login', credentials);
    const { token } = response.data;
    localStorage.setItem('apishield_token', token);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('apishield_token');
  }

  // Dashboard
  async getDashboardData(): Promise<APIShieldDashboardData> {
    const response = await this.api.get('/dashboard');
    return response.data;
  }

  // Scans
  async getScans(params?: { page?: number; limit?: number; status?: string }): Promise<{
    scans: APIShieldScan[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await this.api.get('/scans', { params });
    return response.data;
  }

  async getScan(scanId: string): Promise<APIShieldScan> {
    const response = await this.api.get(`/scans/${scanId}`);
    return response.data;
  }

  async createScan(scanData: {
    name: string;
    targetUrl: string;
    scanType: string;
    settings: any;
    authentication?: any;
  }): Promise<APIShieldScan> {
    const response = await this.api.post('/scans', scanData);
    return response.data;
  }

  async updateScan(scanId: string, updates: Partial<APIShieldScan>): Promise<APIShieldScan> {
    const response = await this.api.put(`/scans/${scanId}`, updates);
    return response.data;
  }

  async deleteScan(scanId: string): Promise<void> {
    await this.api.delete(`/scans/${scanId}`);
  }

  async startScan(scanId: string): Promise<void> {
    await this.api.post(`/scans/${scanId}/start`);
  }

  async stopScan(scanId: string): Promise<void> {
    await this.api.post(`/scans/${scanId}/stop`);
  }

  // Vulnerabilities
  async getVulnerabilities(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    scanId?: string;
  }): Promise<{
    vulnerabilities: APIShieldVulnerability[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await this.api.get('/vulnerabilities', { params });
    return response.data;
  }

  async getVulnerability(vulnId: string): Promise<APIShieldVulnerability> {
    const response = await this.api.get(`/vulnerabilities/${vulnId}`);
    return response.data;
  }

  async updateVulnerability(vulnId: string, updates: Partial<APIShieldVulnerability>): Promise<APIShieldVulnerability> {
    const response = await this.api.put(`/vulnerabilities/${vulnId}`, updates);
    return response.data;
  }

  async bulkUpdateVulnerabilities(vulnIds: string[], updates: Partial<APIShieldVulnerability>): Promise<void> {
    await this.api.put('/vulnerabilities/bulk', { vulnIds, updates });
  }

  // Endpoints
  async getEndpoints(params?: {
    page?: number;
    limit?: number;
    riskLevel?: string;
    hasVulnerabilities?: boolean;
    scanId?: string;
  }): Promise<{
    endpoints: APIShieldEndpoint[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await this.api.get('/endpoints', { params });
    return response.data;
  }

  async getEndpoint(endpointId: string): Promise<APIShieldEndpoint> {
    const response = await this.api.get(`/endpoints/${endpointId}`);
    return response.data;
  }

  // API Specifications
  async getSpecs(): Promise<APIShieldSpec[]> {
    const response = await this.api.get('/specs');
    return response.data;
  }

  async getSpec(specId: string): Promise<APIShieldSpec> {
    const response = await this.api.get(`/specs/${specId}`);
    return response.data;
  }

  async uploadSpec(specData: {
    name: string;
    type: string;
    content: string;
  }): Promise<APIShieldSpec> {
    const response = await this.api.post('/specs', specData);
    return response.data;
  }

  async validateSpec(specContent: string, specType: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const response = await this.api.post('/specs/validate', { content: specContent, type: specType });
    return response.data;
  }

  async deleteSpec(specId: string): Promise<void> {
    await this.api.delete(`/specs/${specId}`);
  }

  // Fuzzing
  async getFuzzResults(params?: {
    page?: number;
    limit?: number;
    endpoint?: string;
    category?: string;
    scanId?: string;
  }): Promise<{
    results: APIShieldFuzzResult[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await this.api.get('/fuzzer/results', { params });
    return response.data;
  }

  async runFuzzTest(fuzzData: {
    targetUrl: string;
    endpoint: APIShieldEndpoint;
    categories: string[];
    maxPayloads?: number;
    authentication?: any;
  }): Promise<APIShieldFuzzResult[]> {
    const response = await this.api.post('/fuzzer/test', fuzzData);
    return response.data;
  }

  async getFuzzPayloads(category?: string): Promise<string[]> {
    const response = await this.api.get('/fuzzer/payloads', { params: { category } });
    return response.data;
  }

  // Reports
  async generateReport(scanId: string, format: 'executive' | 'technical' | 'compliance' | 'json'): Promise<any> {
    const response = await this.api.post(`/scans/${scanId}/report`, { format });
    return response.data;
  }

  async downloadReport(scanId: string, format: string): Promise<Blob> {
    const response = await this.api.get(`/scans/${scanId}/report/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getServerStatus(): Promise<{
    status: string;
    version: string;
    uptime: number;
  }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // WebSocket connection for real-time updates
  connectWebSocket(scanId?: string): WebSocket {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws${scanId ? `?scanId=${scanId}` : ''}`;

    return new WebSocket(wsUrl);
  }
}

export const apiShieldService = new APIShieldService();
export default apiShieldService;
