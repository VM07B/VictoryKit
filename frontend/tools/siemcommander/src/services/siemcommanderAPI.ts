import { API_BASE } from "../constants";
import { SecurityEvent, Alert, SIEMStats } from "../types";

class SIEMCommanderAPI {
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
  async getStats(): Promise<SIEMStats> {
    return this.request<SIEMStats>("/stats");
  }
  async searchEvents(
    query: string,
    timeRange?: string
  ): Promise<SecurityEvent[]> {
    return this.request<SecurityEvent[]>("/events/search", {
      method: "POST",
      body: JSON.stringify({ query, timeRange }),
    });
  }
  async getAlerts(status?: string): Promise<Alert[]> {
    const params = status ? `?status=${status}` : "";
    return this.request<Alert[]>(`/alerts${params}`);
  }
  async acknowledgeAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/acknowledge`, { method: "POST" });
  }
  async resolveAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}/resolve`, { method: "POST" });
  }
}
export const siemCommanderAPI = new SIEMCommanderAPI();
export default siemCommanderAPI;
