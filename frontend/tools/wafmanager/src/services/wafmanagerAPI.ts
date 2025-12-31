import { API_BASE } from "../constants";
import { WAFRule, AttackLog, DashboardStats, TrafficStats } from "../types";

class WAFManagerAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Request failed");
    }

    const data = await response.json();
    return data.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/dashboard");
  }

  // Rules
  async getRules(filters?: Record<string, string>): Promise<WAFRule[]> {
    const params = new URLSearchParams(filters);
    return this.request<WAFRule[]>(`/rules?${params}`);
  }

  async createRule(rule: Partial<WAFRule>): Promise<WAFRule> {
    return this.request<WAFRule>("/rules", {
      method: "POST",
      body: JSON.stringify(rule),
    });
  }

  async updateRule(id: string, rule: Partial<WAFRule>): Promise<WAFRule> {
    return this.request<WAFRule>(`/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(rule),
    });
  }

  async deleteRule(id: string): Promise<void> {
    await this.request(`/rules/${id}`, { method: "DELETE" });
  }

  async toggleRule(id: string): Promise<WAFRule> {
    return this.request<WAFRule>(`/rules/${id}/toggle`, { method: "PATCH" });
  }

  // Attack Logs
  async getAttackLogs(
    filters?: Record<string, string>
  ): Promise<{
    logs: AttackLog[];
    total: number;
    page: number;
    pages: number;
  }> {
    const params = new URLSearchParams(filters);
    return this.request(`/logs?${params}`);
  }

  // Traffic Stats
  async getTrafficStats(
    period?: string,
    hours?: number
  ): Promise<TrafficStats[]> {
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    if (hours) params.set("hours", hours.toString());
    return this.request<TrafficStats[]>(`/stats?${params}`);
  }

  // Analysis
  async analyzeRequest(
    requestData: Record<string, unknown>
  ): Promise<{ blocked: boolean; matches: unknown[]; action: string }> {
    return this.request("/analyze", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  }

  // AI Rule Generation
  async generateAIRules(description: string): Promise<Partial<WAFRule>[]> {
    return this.request<Partial<WAFRule>[]>("/ai/generate-rules", {
      method: "POST",
      body: JSON.stringify({ description }),
    });
  }
}

export const wafManagerAPI = new WAFManagerAPI();
export default wafManagerAPI;
