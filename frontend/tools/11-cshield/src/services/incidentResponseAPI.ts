/**
 * IncidentResponse API Service
 * Handles all API calls to the IncidentResponse backend
 */

import { API_BASE } from "../constants";
import {
  Incident,
  Responder,
  Indicator,
  TimelineEvent,
  PlaybookRun,
} from "../types";

class IncidentResponseAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE;
  }

  // Incident management
  async getIncidents(): Promise<Incident[]> {
    const response = await fetch(`${this.baseURL}/incidents`);
    if (!response.ok) throw new Error("Failed to fetch incidents");
    return response.json();
  }

  async getIncident(id: string): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents/${id}`);
    if (!response.ok) throw new Error("Failed to fetch incident");
    return response.json();
  }

  async createIncident(incident: Partial<Incident>): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    if (!response.ok) throw new Error("Failed to create incident");
    return response.json();
  }

  async updateIncident(
    id: string,
    updates: Partial<Incident>
  ): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update incident");
    return response.json();
  }

  // Triage operations
  async triageIncident(params: {
    incident_id: string;
    title: string;
    category?: string;
    severity?: string;
    affected_systems?: string[];
    indicators?: any[];
  }): Promise<{
    severity: string;
    priority: string;
    recommended_actions: string[];
    classification: string;
  }> {
    const response = await fetch(`${this.baseURL}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to triage incident");
    return response.json();
  }

  // Indicator analysis
  async analyzeIndicator(params: {
    indicator_type: string;
    value: string;
    context?: string;
  }): Promise<{
    risk_level: string;
    description: string;
    intelligence: any;
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseURL}/indicators/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to analyze indicator");
    return response.json();
  }

  async getIndicators(incidentId?: string): Promise<Indicator[]> {
    const url = incidentId
      ? `${this.baseURL}/incidents/${incidentId}/indicators`
      : `${this.baseURL}/indicators`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch indicators");
    return response.json();
  }

  // Timeline management
  async getTimeline(incidentId: string): Promise<TimelineEvent[]> {
    const response = await fetch(
      `${this.baseURL}/incidents/${incidentId}/timeline`
    );
    if (!response.ok) throw new Error("Failed to fetch timeline");
    return response.json();
  }

  async createTimelineEvent(params: {
    incident_id: string;
    event_type: string;
    description: string;
    timestamp?: string;
    artifacts?: string[];
  }): Promise<TimelineEvent> {
    const response = await fetch(`${this.baseURL}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to create timeline event");
    return response.json();
  }

  // Responder management
  async getResponders(): Promise<Responder[]> {
    const response = await fetch(`${this.baseURL}/responders`);
    if (!response.ok) throw new Error("Failed to fetch responders");
    return response.json();
  }

  async assignResponder(params: {
    incident_id: string;
    responder_id: string;
    role?: string;
  }): Promise<{ success: boolean; assignment: any }> {
    const response = await fetch(`${this.baseURL}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to assign responder");
    return response.json();
  }

  // Playbook operations
  async getPlaybooks(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/playbooks`);
    if (!response.ok) throw new Error("Failed to fetch playbooks");
    return response.json();
  }

  async runPlaybook(params: {
    incident_id: string;
    playbook_type: string;
    parameters?: any;
  }): Promise<PlaybookRun> {
    const response = await fetch(`${this.baseURL}/playbooks/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to run playbook");
    return response.json();
  }

  // Forensics operations
  async getForensicData(incidentId: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/incidents/${incidentId}/forensics`
    );
    if (!response.ok) throw new Error("Failed to fetch forensic data");
    return response.json();
  }

  async uploadEvidence(incidentId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseURL}/incidents/${incidentId}/evidence`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Failed to upload evidence");
    return response.json();
  }

  // Reporting
  async generateReport(params: {
    incident_id: string;
    report_type?: string;
    include_timeline?: boolean;
    include_indicators?: boolean;
  }): Promise<{ report_url: string; report_id: string }> {
    const response = await fetch(`${this.baseURL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error("Failed to generate report");
    return response.json();
  }

  // Threat intelligence
  async getThreatIntel(query: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/threat-intel?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to fetch threat intelligence");
    return response.json();
  }

  // Alerts and notifications
  async getAlerts(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/alerts`);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  }

  async acknowledgeAlert(alertId: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/alerts/${alertId}/acknowledge`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to acknowledge alert");
    return response.json();
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(`${API_BASE.replace(/^http/, "ws")}/ws`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  }
}

export const incidentResponseAPI = new IncidentResponseAPI();
