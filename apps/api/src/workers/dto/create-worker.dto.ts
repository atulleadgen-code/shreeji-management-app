import type { WorkerSkill, WorkerStatus } from '@repo/db';

export interface CreateWorkerDto {
  name: string;
  phone?: string | null;
  aadharNumber?: string | null;
  skill: WorkerSkill;
  status?: WorkerStatus;
  dailyWage?: number | string | null;
  documentUrl?: string | null;
  locationId?: string | null;
}