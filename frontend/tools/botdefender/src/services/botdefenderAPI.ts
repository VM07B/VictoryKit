import { API_BASE } from "../constants";
import { BotSession, CaptchaChallenge, BotStats } from "../types";

class BotDefenderAPI {
  private baseUrl = API_BASE;
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
  async getStats(): Promise<BotStats> {
    return this.request<BotStats>("/dashboard");
  }
  async getSessions(filters?: Record<string, string>): Promise<BotSession[]> {
    const params = new URLSearchParams(filters);
    return this.request<BotSession[]>(`/sessions?${params}`);
  }
  async blockSession(id: string): Promise<void> {
    await this.request(`/sessions/${id}/block`, { method: "POST" });
  }
  async getChallenges(): Promise<CaptchaChallenge[]> {
    return this.request<CaptchaChallenge[]>("/challenges");
  }
  async analyzeSession(
    sessionId: string
  ): Promise<{ score: number; isBot: boolean; reasons: string[] }> {
    return this.request("/analyze", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }
}
export const botDefenderAPI = new BotDefenderAPI();
export default botDefenderAPI;
