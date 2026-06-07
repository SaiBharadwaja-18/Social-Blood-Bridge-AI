import { api } from './api';

export async function getAllDonors(bloodGroup?: string, eligibleOnly?: boolean) {
  const params: Record<string, string> = {};
  if (bloodGroup)   params.blood_group   = bloodGroup;
  if (eligibleOnly) params.eligible_only = 'true';
  const res = await api.get<any>('/donors', params);
  return res.donors || [];
}

export async function getDonorById(donorId: string) {
  const res = await api.get<any>(`/donors/${donorId}`);
  return res.donor;
}

export async function updateDonor(donorId: string, data: Record<string, unknown>) {
  return api.put<any>(`/donors/${donorId}`, data);
}

export async function getDonorHistory(donorId: string) {
  const res = await api.get<any>(`/donors/${donorId}/history`);
  return res.history || [];
}

export async function getDonorStats() {
  const res = await api.get<any>('/donors/stats/summary');
  return res;
}

export async function getDonorNotifications(donorId: string) {
  const res = await api.get<any>(`/donors/${donorId}/notifications`);
  return res.notifications || [];
}