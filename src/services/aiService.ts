import { api } from './api';

export async function getAIInsights() {
  return api.get<any>('/ai/insights');
}

export async function scoreDonor(donorId: string, requestId: string) {
  return api.post<any>('/ai/score-donor', { donor_id: donorId, request_id: requestId });
}

export async function manualMatch(data: Record<string, unknown>) {
  return api.post<any>('/ai/match', data);
}

export async function getFulfillmentPrediction(requestId: string) {
  return api.get<any>(`/ai/fulfillment-prediction/${requestId}`);
}

export async function getDonorMessage(donorId: string, requestId: string) {
  return api.get<any>(`/ai/donor-message/${donorId}/${requestId}`);
}

export async function getBloodCompatibility(bloodGroup: string) {
  const encoded = encodeURIComponent(bloodGroup);
  return api.get<any>(`/ai/blood-compatibility/${encoded}`);
}