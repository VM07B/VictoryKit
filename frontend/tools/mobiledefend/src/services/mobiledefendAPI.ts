import { API_BASE } from "../constants";
import { MobileApp, DeviceInfo, AppAnalysis } from "../types";

class MobileDefendAPI {
  private baseUrl = API_BASE;

  async getApps(): Promise<MobileApp[]> {
    const response = await fetch(`${this.baseUrl}/apps`);
    if (!response.ok) throw new Error("Failed to fetch apps");
    return response.json();
  }

  async getApp(id: string): Promise<MobileApp> {
    const response = await fetch(`${this.baseUrl}/apps/${id}`);
    if (!response.ok) throw new Error("Failed to fetch app");
    return response.json();
  }

  async analyzeApp(appId: string): Promise<AppAnalysis> {
    const response = await fetch(`${this.baseUrl}/apps/${appId}/analyze`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to analyze app");
    return response.json();
  }

  async uploadApp(file: File): Promise<MobileApp> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${this.baseUrl}/apps/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload app");
    return response.json();
  }

  async getDevices(): Promise<DeviceInfo[]> {
    const response = await fetch(`${this.baseUrl}/devices`);
    if (!response.ok) throw new Error("Failed to fetch devices");
    return response.json();
  }

  async checkDevice(deviceId: string): Promise<DeviceInfo> {
    const response = await fetch(`${this.baseUrl}/devices/${deviceId}/check`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to check device");
    return response.json();
  }

  async getAnalysisHistory(): Promise<AppAnalysis[]> {
    const response = await fetch(`${this.baseUrl}/analysis`);
    if (!response.ok) throw new Error("Failed to fetch analysis history");
    return response.json();
  }
}

export const mobiledefendAPI = new MobileDefendAPI();
export default mobiledefendAPI;
