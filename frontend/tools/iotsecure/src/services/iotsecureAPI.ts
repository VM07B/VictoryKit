import { API_BASE } from "../constants";
import {
  IoTDevice,
  DeviceScan,
  FirmwareAnalysis,
  ProtocolAlert,
} from "../types";

class IoTSecureAPI {
  private baseUrl = API_BASE;

  async getDevices(): Promise<IoTDevice[]> {
    const response = await fetch(`${this.baseUrl}/devices`);
    if (!response.ok) throw new Error("Failed to fetch devices");
    return response.json();
  }

  async getDevice(id: string): Promise<IoTDevice> {
    const response = await fetch(`${this.baseUrl}/devices/${id}`);
    if (!response.ok) throw new Error("Failed to fetch device");
    return response.json();
  }

  async startScan(networkRange: string): Promise<DeviceScan> {
    const response = await fetch(`${this.baseUrl}/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ networkRange }),
    });
    if (!response.ok) throw new Error("Failed to start scan");
    return response.json();
  }

  async getScans(): Promise<DeviceScan[]> {
    const response = await fetch(`${this.baseUrl}/scans`);
    if (!response.ok) throw new Error("Failed to fetch scans");
    return response.json();
  }

  async analyzeFirmware(deviceId: string): Promise<FirmwareAnalysis> {
    const response = await fetch(`${this.baseUrl}/firmware/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (!response.ok) throw new Error("Failed to analyze firmware");
    return response.json();
  }

  async getAlerts(): Promise<ProtocolAlert[]> {
    const response = await fetch(`${this.baseUrl}/alerts`);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  }

  async getDeviceMetrics(deviceId: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/devices/${deviceId}/metrics`);
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  }
}

export const iotsecureAPI = new IoTSecureAPI();
export default iotsecureAPI;
