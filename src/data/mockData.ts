import type { Donor, BloodRequest, Notification, AIRanking, DashboardMetrics, AnalyticsData, TimelineEvent, InsightData, Achievement, MonthlyData, BloodGroupData, ParticipationData, GeoData, FulfillmentData, BloodGroup, Priority } from '../types';

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const locations = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
const hospitals = ['Agha Khan Hospital', 'Shaukat Khanum Hospital', 'Jinnah Hospital', 'Mayo Hospital', 'Lahore General Hospital', 'PIMS Hospital', 'Holy Family Hospital', 'Civil Hospital', 'Dow University Hospital', 'Indus Hospital', 'Ziauddin Hospital', 'Liaquat National Hospital'];
const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
const firstNames = ['Ahmed', 'Ali', 'Hassan', 'Hussain', 'Muhammad', 'Usman', 'Bilal', 'Omar', 'Khalid', 'Imran', 'Sara', 'Fatima', 'Ayesha', 'Zainab', 'Maryam', 'Hira', 'Nida', 'Sana', 'Amna', 'Kiran'];
const lastNames = ['Khan', 'Ahmed', 'Hassan', 'Ali', 'Malik', 'Raza', 'Siddiqui', 'Naqvi', 'Bukhari', 'Qureshi', 'Sheikh', 'Chaudhry', 'Butt', 'Dar', 'Mir', 'Shah', 'Wazir', 'Hussaini', 'Jafri', 'Rizvi'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function dateStr(daysAgo: number) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split('T')[0]; }

export const donors: Donor[] = Array.from({ length: 50 }, (_, i) => ({
  id: `DON-${String(i + 1).padStart(3, '0')}`, name: `${pick(firstNames)} ${pick(lastNames)}`, email: `donor${i + 1}@example.com`,
  phone: `+92-3${rand(0,9)}${rand(0,9)}-${rand(1000000,9999999)}`, bloodGroup: pick(bloodGroups), location: pick(locations),
  latitude: 24.5 + Math.random() * 8, longitude: 62.0 + Math.random() * 12, donations: rand(0, 25),
  reliabilityScore: +(50 + Math.random() * 50).toFixed(1), acceptanceRate: +(30 + Math.random() * 70).toFixed(1),
  eligibilityStatus: pick(['eligible','eligible','eligible','ineligible','temporary_deferral'] as const),
  status: pick(['active','active','active','inactive'] as const), lastDonationDate: dateStr(rand(7, 180)),
  nextEligibleDate: dateStr(rand(-30, 60)), totalParticipations: rand(2, 30), completedDonations: rand(1, 20),
  declinedRequests: rand(0, 8), createdAt: dateStr(rand(60, 365)),
}));

export const bloodRequests: BloodRequest[] = Array.from({ length: 20 }, (_, i) => ({
  id: `REQ-${String(i + 1).padStart(4, '0')}`, bloodGroup: pick(bloodGroups), unitsRequired: rand(1, 8), unitsSecured: rand(0, 6),
  hospital: pick(hospitals), location: pick(locations), latitude: 24.5 + Math.random() * 8, longitude: 62.0 + Math.random() * 12,
  requiredDate: dateStr(rand(-10, 30)), priority: pick(priorities),
  status: pick(['pending','processing','fulfilled','cancelled'] as const),
  notes: i % 3 === 0 ? 'Thalassemia patient - regular transfusion needed' : 'Emergency blood requirement',
  coordinatorId: 'COORD-001', createdAt: dateStr(rand(1, 30)), updatedAt: dateStr(rand(0, 5)),
}));

export const notifications: Notification[] = Array.from({ length: 100 }, (_, i) => ({
  id: `NOTIF-${String(i + 1).padStart(4, '0')}`, type: pick(['blood_request','reminder','confirmation','backup_activation','system'] as const),
  title: pick(['New Blood Request','Donation Reminder','Request Confirmed','Backup Donor Activated','System Update','Fulfillment Complete','Urgent: Critical Shortage','Donor Response Received']),
  message: pick(['A new blood request matching your profile has been created.','Your donation appointment is scheduled for tomorrow.','Your blood donation has been confirmed.','You have been activated as a backup donor.','System maintenance scheduled for tonight.','The blood request has been fully fulfilled.','Critical shortage of O- blood in your area.','A donor has responded to the blood request.']),
  recipient: `donor${rand(1,50)}@example.com`, recipientId: `DON-${String(rand(1,50)).padStart(3,'0')}`,
  time: dateStr(rand(0, 14)), status: pick(['sent','delivered','pending','failed'] as const), read: Math.random() > 0.4,
}));

export const dashboardMetrics: DashboardMetrics = {
  totalDonors: 1247, activeRequests: 38, fulfilledRequests: 292, pendingRequests: 56,
  unitsRequired: 284, unitsSecured: 198, acceptanceRate: 73.5, reliabilityScoreAvg: 78.2,
};

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const monthlyTrends: MonthlyData[] = months.map(m => ({ month: m, donations: rand(20,80), requests: rand(15,60), fulfilled: rand(10,55) }));
export const bloodGroupDistribution: BloodGroupData[] = bloodGroups.map(g => ({ group: g, count: rand(30,200), demand: rand(20,150) }));
export const donationParticipation: ParticipationData[] = months.map(m => ({ month: m, participated: rand(30,90), declined: rand(5,25) }));
export const geographicDistribution: GeoData[] = locations.map(l => ({ location: l, donors: rand(50,300), requests: rand(10,80) }));
export const fulfillmentPerformance: FulfillmentData[] = months.map(m => ({ month: m, rate: +(50+Math.random()*45).toFixed(1), avgTime: +(12+Math.random()*36).toFixed(1) }));

export const analyticsData: AnalyticsData = {
  totalRequests: 1567, completedRequests: 892, averageFulfillmentTime: 28.4, acceptanceRate: 73.5,
  reliabilityAverage: 78.2, unitsCollected: 3456, monthlyTrends, bloodGroupDistribution,
  donationParticipation, geographicDistribution, fulfillmentPerformance,
};

export const aiRankings: AIRanking[] = donors.slice(0, 15).map((d, i) => ({
  donorId: d.id, donorName: d.name, bloodGroup: d.bloodGroup,
  overallScore: +(95 - i * 3.5 + Math.random() * 2).toFixed(1),
  distanceScore: +(60 + Math.random() * 40).toFixed(1), reliabilityScore: d.reliabilityScore,
  participationScore: +(50 + Math.random() * 50).toFixed(1),
  acceptanceProbability: +(40 + Math.random() * 55).toFixed(1), rank: i + 1,
  recommendation: i < 3 ? 'Top recommended donor based on proximity, reliability, and acceptance history.'
    : i < 7 ? 'Strong candidate with good reliability scores and reasonable distance.'
    : 'Viable backup option. Consider if primary donors are unavailable.',
}));

export const timelineEvents: TimelineEvent[] = [
  { id: '1', title: 'Request Created', description: 'Blood request REQ-0001 created by coordinator.', timestamp: dateStr(5), type: 'created' },
  { id: '2', title: 'Donors Ranked', description: 'AI engine ranked 12 eligible donors for this request.', timestamp: dateStr(4), type: 'ranked' },
  { id: '3', title: 'Primary Contacted', description: 'Top 5 donors contacted via SMS and email.', timestamp: dateStr(3), type: 'contacted' },
  { id: '4', title: 'Backup Activated', description: '3 backup donors activated after primary decline.', timestamp: dateStr(2), type: 'activated' },
  { id: '5', title: 'Request Fulfilled', description: 'All required units secured. Request marked as fulfilled.', timestamp: dateStr(0), type: 'fulfilled' },
];

export const insightData: InsightData = {
  mostReliableDonors: donors.filter(d => d.reliabilityScore >= 85).slice(0, 5),
  mostActiveDonors: [...donors].sort((a, b) => b.donations - a.donations).slice(0, 5),
  shortageAreas: ['Quetta - O-', 'Peshawar - B-', 'Multan - AB+'],
  predictedDemand: bloodGroups.map(g => ({ bloodGroup: g, predicted: rand(10, 60), confidence: +(60 + Math.random() * 35).toFixed(1) })),
  upcomingDemand: Array.from({ length: 6 }, (_, i) => ({ month: months[(new Date().getMonth() + i) % 12], units: rand(20, 80), bloodGroup: pick(bloodGroups) })),
};

export const achievements: Achievement[] = [
  { id: '1', title: 'First Donation', description: 'Complete your first blood donation', icon: 'heart', earnedAt: dateStr(120), progress: 1, target: 1 },
  { id: '2', title: 'Regular Donor', description: 'Donate blood 5 times', icon: 'repeat', earnedAt: dateStr(60), progress: 5, target: 5 },
  { id: '3', title: 'Life Saver', description: 'Donate blood 10 times', icon: 'shield', progress: 7, target: 10 },
  { id: '4', title: 'Blood Warrior', description: 'Donate blood 25 times', icon: 'sword', progress: 7, target: 25 },
  { id: '5', title: 'Quick Responder', description: 'Accept 5 requests within 1 hour', icon: 'zap', earnedAt: dateStr(30), progress: 5, target: 5 },
  { id: '6', title: 'Reliable Star', description: 'Maintain 90%+ reliability for 3 months', icon: 'star', progress: 78, target: 90 },
];

export const currentUser = {
  id: 'COORD-001', name: 'Dr. Ayesha Khan', email: 'ayesha@bloodbridge.org', phone: '+92-300-1234567',
  role: 'coordinator' as const, organization: 'Social Blood Bridge AI',
};
