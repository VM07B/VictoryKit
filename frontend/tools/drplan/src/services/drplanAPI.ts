import { API_BASE } from "../constants";
import {
  DRPlan,
  CriticalSystem,
  DRDrill,
  Runbook,
  RiskAssessment,
} from "../types";

class DRPlanAPI {
  private baseUrl = API_BASE;

  async getPlans(): Promise<DRPlan[]> {
    const response = await fetch(`${this.baseUrl}/plans`);
    if (!response.ok) throw new Error("Failed to fetch plans");
    return response.json();
  }

  async getPlan(id: string): Promise<DRPlan> {
    const response = await fetch(`${this.baseUrl}/plans/${id}`);
    if (!response.ok) throw new Error("Failed to fetch plan");
    return response.json();
  }

  async createPlan(plan: Partial<DRPlan>): Promise<DRPlan> {
    const response = await fetch(`${this.baseUrl}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    if (!response.ok) throw new Error("Failed to create plan");
    return response.json();
  }

  async getCriticalSystems(): Promise<CriticalSystem[]> {
    const response = await fetch(`${this.baseUrl}/systems`);
    if (!response.ok) throw new Error("Failed to fetch systems");
    return response.json();
  }

  async getDrills(): Promise<DRDrill[]> {
    const response = await fetch(`${this.baseUrl}/drills`);
    if (!response.ok) throw new Error("Failed to fetch drills");
    return response.json();
  }

  async scheduleDrill(drill: Partial<DRDrill>): Promise<DRDrill> {
    const response = await fetch(`${this.baseUrl}/drills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drill),
    });
    if (!response.ok) throw new Error("Failed to schedule drill");
    return response.json();
  }

  async getRunbooks(): Promise<Runbook[]> {
    const response = await fetch(`${this.baseUrl}/runbooks`);
    if (!response.ok) throw new Error("Failed to fetch runbooks");
    return response.json();
  }

  async getRiskAssessments(): Promise<RiskAssessment[]> {
    const response = await fetch(`${this.baseUrl}/risks`);
    if (!response.ok) throw new Error("Failed to fetch risks");
    return response.json();
  }
}

export const drplanAPI = new DRPlanAPI();
export default drplanAPI;
