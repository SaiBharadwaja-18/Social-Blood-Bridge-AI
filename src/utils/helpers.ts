import type { Priority, RequestStatus, BloodGroup, EligibilityStatus, DonorStatus, NotificationStatus } from '../types';

export function priorityColor(p: Priority) {
  return { critical: 'badge-error', high: 'badge-warning', medium: 'badge-info', low: 'badge-success' }[p];
}
export function statusColor(s: RequestStatus) {
  return { pending: 'badge-warning', processing: 'badge-info', fulfilled: 'badge-success', cancelled: 'badge-error' }[s];
}
export function eligibilityColor(s: EligibilityStatus) {
  return { eligible: 'badge-success', ineligible: 'badge-error', temporary_deferral: 'badge-warning' }[s];
}
export function donorStatusColor(s: DonorStatus) {
  return { active: 'badge-success', inactive: 'badge-error', deferred: 'badge-warning' }[s];
}
export function notifStatusColor(s: NotificationStatus) {
  return { sent: 'badge-info', delivered: 'badge-success', pending: 'badge-warning', failed: 'badge-error' }[s];
}
export function bloodGroupColor(g: BloodGroup) {
  const m: Record<BloodGroup, string> = {
    'A+': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'A-': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'B-': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'O+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'O-': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'AB+': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'AB-': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  };
  return m[g];
}
export function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
export function formatPercent(v: number) { return `${v.toFixed(1)}%`; }
