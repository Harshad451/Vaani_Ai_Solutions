/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PasswordStrengthResult {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

export const checkPasswordStrength = (pass: string): PasswordStrengthResult => {
  if (!pass) return { score: 0, feedback: [] as string[], color: 'bg-gray-800', label: 'Empty' };
  
  const feedback: string[] = [];
  let score = 0;
  
  if (pass.length >= 8) {
    score += 1;
  } else {
    feedback.push("At least 8 characters");
  }
  
  if (/[A-Z]/.test(pass)) {
    score += 1;
  } else {
    feedback.push("One uppercase letter");
  }
  
  if (/\d/.test(pass)) {
    score += 1;
  } else {
    feedback.push("One number");
  }
  
  if (/[@$!%*?&#]/.test(pass)) {
    score += 1;
  } else {
    feedback.push("One special character (@, $, %, !, *, ?, &)");
  }
  
  let color = 'bg-red-500/80';
  let label = 'Weak';
  if (score === 2) {
    color = 'bg-amber-500/80';
    label = 'Medium';
  } else if (score === 3) {
    color = 'bg-blue-500/85';
    label = 'Strong';
  } else if (score === 4) {
    color = 'bg-green-500/85';
    label = 'Very Strong';
  }
  
  return { score, feedback, color, label };
};
