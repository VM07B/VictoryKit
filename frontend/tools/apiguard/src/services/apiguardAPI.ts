import { API_BASE } from "../constants";
import {
  APIEndpoint,
  RateLimitRule,
  AuthEvent,
  APISecurityStats,
} from "../types";

class APIGuardAPI {
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
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    return data.data;
  }

  async getStats(): Promise<APISecurityStats> {
    return this.request<APISecurityStats>("/dashboard");
  }

  async getEndpoints(): Promise<APIEndpoint[]> {
    return this.request<APIEndpoint[]>("/endpoints");
  }

  async createEndpoint(endpoint: Partial<APIEndpoint>): Promise<APIEndpoint> {
    return this.request<APIEndpoint>("/endpoints", {
      method: "POST",
      body: JSON.stringify(endpoint),
    });
  }

  async updateEndpoint(
    id: string,
    endpoint: Partial<APIEndpoint>
  ): Promise<APIEndpoint> {
    return this.request<APIEndpoint>(`/endpoints/${id}`, {
      method: "PUT",
      body: JSON.stringify(endpoint),
    });
  }

  async deleteEndpoint(id: string): Promise<void> {
    await this.request(`/endpoints/${id}`, { method: "DELETE" });
  }

  async getRateLimitRules(): Promise<RateLimitRule[]> {
    return this.request<RateLimitRule[]>("/rate-limits");
  }

  async createRateLimitRule(
    rule: Partial<RateLimitRule>
  ): Promise<RateLimitRule> {
    return this.request<RateLimitRule>("/rate-limits", {
      method: "POST",
      body: JSON.stringify(rule),
    });
  }

  async getAuthEvents(
    filters?: Record<string, string>
  ): Promise<{ events: AuthEvent[]; total: number }> {
    const params = new URLSearchParams(filters);
    return this.request(`/auth-events?${params}`);
  }

  async scanEndpoint(
    url: string
  ): Promise<{ vulnerabilities: unknown[]; score: number }> {
    return this.request("/scan", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }
}

export const apiGuardAPI = new APIGuardAPI();
export default apiGuardAPI;
