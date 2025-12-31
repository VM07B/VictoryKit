import { API_BASE } from "../constants";
import { ThreatHunt, Incident, DefenseMetrics } from "../types";

class BlueTeamAIAPI {
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
  async getMetrics(): Promise<DefenseMetrics> {
    return this.request<DefenseMetrics>("/metrics");
  }
  async getThreatHunts(): Promise<ThreatHunt[]> {
    return this.request<ThreatHunt[]>("/hunts");
  }
  async getIncidents(): Promise<Incident[]> {
    return this.request<Incident[]>("/incidents");
  }
  async createHunt(hunt: Partial<ThreatHunt>): Promise<ThreatHunt> {
    return this.request<ThreatHunt>("/hunts", {
      method: "POST",
      body: JSON.stringify(hunt),
    });
  }
  async updateIncident(
    id: string,
    updates: Partial<Incident>
  ): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }
}
export const blueTeamAIAPI = new BlueTeamAIAPI();
export default blueTeamAIAPI;
