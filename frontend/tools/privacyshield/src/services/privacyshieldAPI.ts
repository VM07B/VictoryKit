import { API_BASE } from "../constants";
import {
  DataAsset,
  DSAR,
  ConsentRecord,
  PrivacyImpactAssessment,
  DataBreach,
  ComplianceStatus,
} from "../types";

class PrivacyShieldAPI {
  private baseUrl = API_BASE;

  async getDataAssets(): Promise<DataAsset[]> {
    const response = await fetch(`${this.baseUrl}/assets`);
    if (!response.ok) throw new Error("Failed to fetch data assets");
    return response.json();
  }

  async scanForPII(source: string): Promise<DataAsset[]> {
    const response = await fetch(`${this.baseUrl}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
    if (!response.ok) throw new Error("Failed to scan for PII");
    return response.json();
  }

  async getDSARs(): Promise<DSAR[]> {
    const response = await fetch(`${this.baseUrl}/dsars`);
    if (!response.ok) throw new Error("Failed to fetch DSARs");
    return response.json();
  }

  async createDSAR(dsar: Partial<DSAR>): Promise<DSAR> {
    const response = await fetch(`${this.baseUrl}/dsars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dsar),
    });
    if (!response.ok) throw new Error("Failed to create DSAR");
    return response.json();
  }

  async getConsentRecords(): Promise<ConsentRecord[]> {
    const response = await fetch(`${this.baseUrl}/consent`);
    if (!response.ok) throw new Error("Failed to fetch consent records");
    return response.json();
  }

  async getPIAs(): Promise<PrivacyImpactAssessment[]> {
    const response = await fetch(`${this.baseUrl}/pias`);
    if (!response.ok) throw new Error("Failed to fetch PIAs");
    return response.json();
  }

  async getBreaches(): Promise<DataBreach[]> {
    const response = await fetch(`${this.baseUrl}/breaches`);
    if (!response.ok) throw new Error("Failed to fetch breaches");
    return response.json();
  }

  async getComplianceStatus(): Promise<ComplianceStatus[]> {
    const response = await fetch(`${this.baseUrl}/compliance`);
    if (!response.ok) throw new Error("Failed to fetch compliance status");
    return response.json();
  }
}

export const privacyshieldAPI = new PrivacyShieldAPI();
export default privacyshieldAPI;
