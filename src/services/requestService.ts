import { api } from './api';

export async function createBloodRequest(data: Record<string, unknown>) {
  return api.post<any>('/requests', data);
}

export async function getAllRequests(status?: string) {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const res = await api.get<any>('/requests', params);
  return res.requests || [];
}

export async function getRequestById(requestId: string) {
  const res = await api.get<any>(`/requests/${requestId}`);
  return res;
}

export async function updateRequestStatus(requestId: string, status: string) {
  return api.put<any>(`/requests/${requestId}/status`, { status });
}

export async function runAIMatching(requestId: string) {
  return api.post<any>(`/requests/${requestId}/match`);
}

export async function fulfillRequest(requestId: string, data: Record<string, unknown>) {
  return api.post<any>(`/requests/${requestId}/fulfill`, data);
}

export async function autoTriggerCycles() {
  return api.post<any>('/requests/auto-trigger');
}