/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { checkPasswordStrength } from '../utils/password';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;
  
  const strength = checkPasswordStrength(password);
  
  return (
    <div className="mt-2 space-y-1.5 p-3.5 bg-[#0e1017] border border-white/[0.04] rounded-xl font-mono text-[10px] text-left">
      <div className="flex items-center justify-between text-[9.5px]">
        <span className="text-gray-400">Security Strength:</span>
        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold text-white uppercase tracking-wider ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      
      {/* Visual meter bar with 4 segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full mt-1.5 rounded bg-white/[0.04] overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-full transition-all duration-300 ${
              index < strength.score ? strength.color : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      
      {strength.feedback.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-gray-500 text-[8.5px] block font-bold uppercase tracking-wider mb-1">Requirements Missing:</span>
          {strength.feedback.map((txt, index) => (
            <div key={index} className="flex items-center gap-1.5 text-[9px] text-rose-400/85">
              <span className="h-1 w-1 rounded-full bg-rose-450" />
              <span>{txt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
