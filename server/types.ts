import { Employee } from '../src/types';

export interface SecuredEmployee extends Employee {
  passwordHash: string;
}

export interface Settings {
  companyName: string;
  supportEmail: string;
  slaMinutes: number;
  botEnabled: boolean;
  defaultGreeting: string;
  aiPolicyInstructions?: string;
  isTrained?: boolean;
  businessIndustry?: string;
  supportTone?: string;
  brandKnowledge?: string;
  kbBusiness?: string;
  kbReturns?: string;
  kbShipping?: string;
  kbEscalation?: string;
  
  // Subscription fields
  isSubscribed?: boolean;
  subscriptionPlan?: 'monthly' | 'yearly';
  subscriptionTier?: 'PRO' | 'ENTERPRISE';
  subscriptionExpiresAt?: string;
  subscriptionDaysLeft?: number;
  subscriptionStartedAt?: string;
}

export interface ActiveSession {
  employeeId: string;
  expiresAt: number;
}

export interface Pending2FA {
  employeeId: string;
  code: string;
  expiresAt: number;
}

export interface PasswordResetToken {
  employeeId: string;
  token: string;
  expiresAt: number;
}

export interface AuthAttempt {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}
