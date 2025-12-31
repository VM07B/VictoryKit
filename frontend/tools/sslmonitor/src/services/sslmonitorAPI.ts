import { API_BASE } from "../constants";
import { Certificate, CertStats } from "../types";

class SSLMonitorAPI {
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
  async getStats(): Promise<CertStats> {
    return this.request<CertStats>("/stats");
  }
  async getCertificates(
    filters?: Record<string, string>
  ): Promise<Certificate[]> {
    const params = new URLSearchParams(filters);
    return this.request<Certificate[]>(`/certificates?${params}`);
  }
  async scanDomain(domain: string): Promise<Certificate> {
    return this.request<Certificate>("/scan", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  }
  async refreshCertificate(id: string): Promise<Certificate> {
    return this.request<Certificate>(`/certificates/${id}/refresh`, {
      method: "POST",
    });
  }
  async deleteCertificate(id: string): Promise<void> {
    await this.request(`/certificates/${id}`, { method: "DELETE" });
  }
}
export const sslMonitorAPI = new SSLMonitorAPI();
export default sslMonitorAPI;
