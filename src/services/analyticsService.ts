import { api } from './api';
import type { AnalyticsData, DashboardMetrics } from '../types';

export const analyticsService = {
  getDashboardMetrics: (): Promise<DashboardMetrics> => api.get('/analytics/dashboard'),
  getAnalytics: (): Promise<AnalyticsData> => api.get('/analytics'),
  getMonthlyTrends: (): Promise<unknown[]> => api.get('/analytics/monthly-trends'),
  getBloodGroupDistribution: (): Promise<unknown[]> => api.get('/analytics/blood-group-distribution'),
  getGeographicDistribution: (): Promise<unknown[]> => api.get('/analytics/geographic-distribution'),
  getFulfillmentPerformance: (): Promise<unknown[]> => api.get('/analytics/fulfillment-performance'),
};
