import { API_BASE } from "../constants";
import {
  BackupJob,
  BackupTarget,
  IntegrityCheck,
  RestoreTest,
  SecurityAlert,
} from "../types";

class BackupGuardAPI {
  private baseUrl = API_BASE;

  async getBackupJobs(): Promise<BackupJob[]> {
    const response = await fetch(`${this.baseUrl}/jobs`);
    if (!response.ok) throw new Error("Failed to fetch backup jobs");
    return response.json();
  }

  async getBackupJob(id: string): Promise<BackupJob> {
    const response = await fetch(`${this.baseUrl}/jobs/${id}`);
    if (!response.ok) throw new Error("Failed to fetch backup job");
    return response.json();
  }

  async createBackupJob(job: Partial<BackupJob>): Promise<BackupJob> {
    const response = await fetch(`${this.baseUrl}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    if (!response.ok) throw new Error("Failed to create backup job");
    return response.json();
  }

  async runBackup(jobId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/run`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to run backup");
    return response.json();
  }

  async getTargets(): Promise<BackupTarget[]> {
    const response = await fetch(`${this.baseUrl}/targets`);
    if (!response.ok) throw new Error("Failed to fetch targets");
    return response.json();
  }

  async verifyIntegrity(backupId: string): Promise<IntegrityCheck> {
    const response = await fetch(`${this.baseUrl}/verify/${backupId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to verify integrity");
    return response.json();
  }

  async runRestoreTest(backupId: string): Promise<RestoreTest> {
    const response = await fetch(`${this.baseUrl}/restore-test/${backupId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to run restore test");
    return response.json();
  }

  async getAlerts(): Promise<SecurityAlert[]> {
    const response = await fetch(`${this.baseUrl}/alerts`);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  }
}

export const backupguardAPI = new BackupGuardAPI();
export default backupguardAPI;
