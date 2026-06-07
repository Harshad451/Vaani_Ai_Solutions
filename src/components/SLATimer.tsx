/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';

interface SLATimerProps {
  ticket: Ticket;
}

export function SLATimer({ ticket }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (ticket.status === 'RESOLVED') {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      if (!ticket.slaExpiresAt) return 0;
      const expiry = new Date(ticket.slaExpiresAt).getTime();
      return Math.max(0, expiry - Date.now());
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket.slaExpiresAt, ticket.status]);

  if (ticket.status === 'RESOLVED') {
    return (
      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 font-mono rounded border border-emerald-500/20 flex items-center gap-1 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        SLA Met
      </span>
    );
  }

  if (!ticket.slaExpiresAt) {
    return null;
  }

  if (timeLeft <= 0) {
    return (
      <span className="text-[10px] px-2 py-0.5 bg-rose-500/15 text-rose-400 font-mono rounded border border-rose-500/20 flex items-center gap-1 shrink-0 animate-pulse font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        SLA Breached
      </span>
    );
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeLeft <= 300000; // <= 5 minutes

  return (
    <span className={`text-[10px] px-2 py-0.5 font-mono rounded border flex items-center gap-1.5 shrink-0 transition-all duration-300 ${
      isUrgent 
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 font-bold shadow-sm shadow-amber-500/[0.02]' 
        : 'bg-white/[0.02] text-gray-400 border-white/[0.05]'
    }`}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isUrgent && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isUrgent ? 'bg-amber-400' : 'bg-green-400'}`} />
      </span>
      <span>{isUrgent ? `Urgent: ${formatted}` : `SLA: ${formatted}`}</span>
    </span>
  );
}
