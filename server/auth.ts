import crypto from 'crypto';
import { SecuredEmployee, AuthAttempt, ActiveSession, Pending2FA, PasswordResetToken } from './types';
import { employees } from './db';

// 1. Password Hashing & Verification
export const hashPassword = (password: string, salt: string): string => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

export const secureHash = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  if (!storedHash) return false;
  if (!storedHash.includes(':')) {
    return password === storedHash; // legacy plain-text support
  }
  const [salt, hash] = storedHash.split(':');
  return hashPassword(password, salt) === hash;
};

// 2. Password Strength Validation (Client + Server enforcement)
export const isPasswordStrong = (password: string): boolean => {
  // Password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number, and special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
};

// 3. Token-based Session Registry
export const activeSessions = new Map<string, ActiveSession>();
export const SESSION_LIFESPAN_MS = 2 * 60 * 60 * 1000; // 2 hours

export const pending2FASessions = new Map<string, Pending2FA>();
export const passwordResetTokens = new Map<string, PasswordResetToken>();

// 4. Brute Force & Rate Limiting protection specifically for Authentication Routes
export const loginAttempts = new Map<string, AuthAttempt>();

export const authRateLimiter = (req: any, res: any, next: any) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const limitWindowMs = 60 * 1000; // 1 minute
  const maxAttempts = 10; // max 10 requests per minute per IP for authorization routes
  
  const attempt = loginAttempts.get(ip);
  if (attempt) {
    if (attempt.blockedUntil && now < attempt.blockedUntil) {
      const secLeft = Math.ceil((attempt.blockedUntil - now) / 1000);
      return res.status(429).json({ 
        error: `Too many login attempts. Please wait ${secLeft} seconds before trying again for security.` 
      });
    }
    
    if (now - attempt.firstAttemptAt < limitWindowMs) {
      attempt.count += 1;
      if (attempt.count > maxAttempts) {
        attempt.blockedUntil = now + (30 * 1000); // 30s penalty lock
        return res.status(429).json({ 
          error: "Security alert: Too many login or registration attempts. Cooling down access for 30 seconds." 
        });
      }
    } else {
      attempt.count = 1;
      attempt.firstAttemptAt = now;
      attempt.blockedUntil = undefined;
    }
  } else {
    loginAttempts.set(ip, {
      count: 1,
      firstAttemptAt: now
    });
  }
  next();
};

// 5. Middlewares for Verified Session-Token enforcement on sensitive routes
export const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  
  // Extend session on user activity (sliding expiration window)
  session.expiresAt = Date.now() + SESSION_LIFESPAN_MS;
  
  const employee = employees.find(e => e.id === session.employeeId);
  if (!employee) {
    return res.status(401).json({ error: 'Employee account not found.' });
  }
  
  req.employee = employee;
  next();
};

export const getEmployeeFromRequest = (req: any): SecuredEmployee | undefined => {
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session) {
      return employees.find(e => e.id === session.employeeId);
    }
  }
  return undefined;
};
