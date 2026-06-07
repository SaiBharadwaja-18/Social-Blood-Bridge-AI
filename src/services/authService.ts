import { api } from './api';

export interface User {
  user_id:     string;
  name:        string;
  email:       string;
  role:        'donor' | 'patient' | 'coordinator';
  blood_group?: string;
  city?:        string;
  state?:       string;
  latitude?:    number;
  longitude?:   number;
  hospital_name?:     string;
  hospital_location?: string;
  eligibility_status?: string;
  donations_till_date?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token:   string;
  user:    User;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  return response;
}

// ── Register Donor ────────────────────────────────────────────────────────────
export async function registerDonor(data: Record<string, unknown>): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/register/donor', data);
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  return response;
}

// ── Register Patient ──────────────────────────────────────────────────────────
export async function registerPatient(data: Record<string, unknown>): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/register/patient', data);
  if (response.token) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  return response;
}

// ── Get Current User ──────────────────────────────────────────────────────────
export async function getMe(): Promise<User> {
  const response = await api.get<{ success: boolean; user: User }>('/auth/me');
  return response.user;
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logoutUser(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ── Get stored user ───────────────────────────────────────────────────────────
export function getStoredUser(): User | null {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
}

// ── Check if logged in ────────────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}