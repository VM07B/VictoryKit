import { API_BASE } from "../constants";
import { DDoSAttack, TrafficStats, MitigationRule } from "../types";

class DDoSShieldAPI {
  private readonly baseUrl = API_BASE;
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!response.ok) throw new Error("Request failed");
    return (await response.json()).data;
  }
  async getTrafficStats(): Promise<TrafficStats> {
    return this.request<TrafficStats>("/traffic/stats");
  }
  async getActiveAttacks(): Promise<DDoSAttack[]> {
    return this.request<DDoSAttack[]>("/attacks?status=active");
  }
  async getAttackHistory(): Promise<DDoSAttack[]> {
    return this.request<DDoSAttack[]>("/attacks");
  }
  async getMitigationRules(): Promise<MitigationRule[]> {
    return this.request<MitigationRule[]>("/rules");
  }
  async toggleRule(id: string, enabled: boolean): Promise<void> {
    await this.request(`/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  }
  async blockSource(ip: string): Promise<void> {
    await this.request("/block", {
      method: "POST",
      body: JSON.stringify({ ip }),
    });
  }
}
export const ddosShieldAPI = new DDoSShieldAPI();
export default ddosShieldAPI;
