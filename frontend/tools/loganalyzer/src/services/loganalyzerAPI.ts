import axios from "axios";
import { LogEntry, LogAnalysis, LogAlert } from "../types";

const API_BASE =
  __API_BASE__ || "https://loganalyzer.fyzo.xyz/api/v1/loganalyzer";

class LogAnalyzerAPI {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Log Entries
  async getLogs(params?: any) {
    const response = await this.api.get("/logs", { params });
    return response.data;
  }

  async getLog(id: string) {
    const response = await this.api.get(`/logs/${id}`);
    return response.data;
  }

  async createLog(logData: Partial<LogEntry>) {
    const response = await this.api.post("/logs", logData);
    return response.data;
  }

  async updateLog(id: string, updates: Partial<LogEntry>) {
    const response = await this.api.patch(`/logs/${id}`, updates);
    return response.data;
  }

  async deleteLog(id: string) {
    const response = await this.api.delete(`/logs/${id}`);
    return response.data;
  }

  async analyzeLog(id: string) {
    const response = await this.api.post(`/logs/${id}/analyze`);
    return response.data;
  }

  // Analysis
  async getAnalyses(params?: any) {
    const response = await this.api.get("/analysis", { params });
    return response.data;
  }

  async getAnalysis(id: string) {
    const response = await this.api.get(`/analysis/${id}`);
    return response.data;
  }

  async createAnalysis(analysisData: any) {
    const response = await this.api.post("/analysis", analysisData);
    return response.data;
  }

  async getAnalysisSummary(params?: any) {
    const response = await this.api.get("/analysis/summary", { params });
    return response.data;
  }

  // Alerts
  async getAlerts(params?: any) {
    const response = await this.api.get("/alerts", { params });
    return response.data;
  }

  async getAlert(id: string) {
    const response = await this.api.get(`/alerts/${id}`);
    return response.data;
  }

  async createAlert(alertData: Partial<LogAlert>) {
    const response = await this.api.post("/alerts", alertData);
    return response.data;
  }

  async updateAlert(id: string, updates: Partial<LogAlert>) {
    const response = await this.api.patch(`/alerts/${id}`, updates);
    return response.data;
  }

  async deleteAlert(id: string) {
    const response = await this.api.delete(`/alerts/${id}`);
    return response.data;
  }

  async testAlert(id: string) {
    const response = await this.api.post(`/alerts/${id}/test`);
    return response.data;
  }
}

export const loganalyzerAPI = new LogAnalyzerAPI();
