export type Role = 'coordinator' | 'donor' | 'patient';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'processing' | 'fulfilled' | 'cancelled';
export type DonorStatus = 'active' | 'inactive' | 'deferred';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'temporary_deferral';
export type NotificationStatus = 'sent' | 'delivered' | 'pending' | 'failed';
export type NotificationType = 'blood_request' | 'reminder' | 'confirmation' | 'backup_activation' | 'system';
export type DonorResponseStatus = 'accepted' | 'declined' | 'pending' | 'maybe_later';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  organization?: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  location: string;
  latitude: number;
  longitude: number;
  donations: number;
  reliabilityScore: number;
  acceptanceRate: number;
  eligibilityStatus: EligibilityStatus;
  status: DonorStatus;
  lastDonationDate: string;
  nextEligibleDate: string;
  totalParticipations: number;
  completedDonations: number;
  declinedRequests: number;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsSecured: number;
  hospital: string;
  location: string;
  latitude: number;
  longitude: number;
  requiredDate: string;
  priority: Priority;
  status: RequestStatus;
  notes: string;
  coordinatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRanking {
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  overallScore: number;
  distanceScore: number;
  reliabilityScore: number;
  participationScore: number;
  acceptanceProbability: number;
  rank: number;
  recommendation: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  recipientId: string;
  time: string;
  status: NotificationStatus;
  read: boolean;
}

export interface DashboardMetrics {
  totalDonors: number;
  activeRequests: number;
  fulfilledRequests: number;
  pendingRequests: number;
  unitsRequired: number;
  unitsSecured: number;
  acceptanceRate: number;
  reliabilityScoreAvg: number;
}

export interface MonthlyData { month: string; donations: number; requests: number; fulfilled: number; }
export interface BloodGroupData { group: BloodGroup; count: number; demand: number; }
export interface ParticipationData { month: string; participated: number; declined: number; }
export interface GeoData { location: string; donors: number; requests: number; }
export interface FulfillmentData { month: string; rate: number; avgTime: number; }

export interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  averageFulfillmentTime: number;
  acceptanceRate: number;
  reliabilityAverage: number;
  unitsCollected: number;
  monthlyTrends: MonthlyData[];
  bloodGroupDistribution: BloodGroupData[];
  donationParticipation: ParticipationData[];
  geographicDistribution: GeoData[];
  fulfillmentPerformance: FulfillmentData[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'created' | 'ranked' | 'contacted' | 'activated' | 'fulfilled';
}

export interface InsightData {
  mostReliableDonors: Donor[];
  mostActiveDonors: Donor[];
  shortageAreas: string[];
  predictedDemand: { bloodGroup: BloodGroup; predicted: number; confidence: number; }[];
  upcomingDemand: { month: string; units: number; bloodGroup: BloodGroup; }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress: number;
  target: number;
}
