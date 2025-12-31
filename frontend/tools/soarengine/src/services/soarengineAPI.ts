import { API_BASE } from "../constants";
import { Playbook, PlaybookRun, Integration, SOARStats } from "../types";

class SOAREngineAPI {
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
  async getStats(): Promise<SOARStats> {
    return this.request<SOARStats>("/stats");
  }
  async getPlaybooks(): Promise<Playbook[]> {
    return this.request<Playbook[]>("/playbooks");
  }
  async runPlaybook(
    id: string,
    params?: Record<string, unknown>
  ): Promise<PlaybookRun> {
    return this.request<PlaybookRun>(`/playbooks/${id}/run`, {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }
  async getPlaybookRuns(playbookId?: string): Promise<PlaybookRun[]> {
    const params = playbookId ? `?playbookId=${playbookId}` : "";
    return this.request<PlaybookRun[]>(`/runs${params}`);
  }
  async getIntegrations(): Promise<Integration[]> {
    return this.request<Integration[]>("/integrations");
  }
  async testIntegration(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/integrations/${id}/test`, {
      method: "POST",
    });
  }
}
export const soarEngineAPI = new SOAREngineAPI();
export default soarEngineAPI;
