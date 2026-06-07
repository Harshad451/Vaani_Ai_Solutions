import React from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Ticket } from '../types';

interface HealthTabProps {
  tickets: Ticket[];
}

export function HealthTab({ tickets }: HealthTabProps) {
  return (
    <motion.div
      key="health"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#06070a] text-[#f2ede4] relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.05] pb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-200 tracking-tight flex items-center gap-2">
              <Activity className="text-[#ff7c2a]" size={20} />
              <span>Live Workspace Health Metrics</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Review active SLA compliance metrics, agent takeover response delay speeds, and live automated webhook latency counters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase font-mono px-3 py-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Diagnostics Live Ticking</span>
          </div>
        </div>

        {/* High level operational telemetry gauges row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gauge 1 */}
          <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">SLA COMPLIANCE SCORE</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#f2ede4]">98.6%</span>
              <span className="text-[10.5px] font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-1.5 py-0.5 rounded">High Std</span>
            </div>
            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[98.6%]" />
            </div>
          </div>

          {/* Gauge 2 */}
          <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">AVG TAKE-OVER SPEED</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#f2ede4]">42 Sec</span>
              <span className="text-[10.5px] font-mono text-[#ff7c2a] font-semibold bg-[#ff7c2a]/5 px-1.5 py-0.5 rounded">-12% MoM</span>
            </div>
            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full bg-[#ff7c2a] w-[75%]" />
            </div>
          </div>

          {/* Gauge 3 */}
          <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">AUTONOMOUS RESOLUTION RATING</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#f2ede4]">84%</span>
              <span className="text-[10.5px] font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-1.5 py-0.5 rounded">84/100</span>
            </div>
            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[84%]" />
            </div>
          </div>

          {/* Gauge 4 */}
          <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-lg">
            <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">SATISFACTION RATE</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#f2ede4]">
                {(() => {
                  const rated = tickets.filter(t => t.rating !== undefined && t.rating > 0);
                  return rated.length > 0
                    ? (rated.reduce((acc, curr) => acc + (curr.rating || 0), 0) / rated.length).toFixed(1)
                    : '4.8';
                })()}/5.0
              </span>
              <span className="text-[10.5px] font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-1.5 py-0.5 rounded">CSAT</span>
            </div>
            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[95%]" />
            </div>
          </div>
        </div>

        {/* Multi-Channel Health Distribution Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Active Channel Ingress meters */}
          <div className="bg-white/[0.01] rounded-xl p-5 border border-white/[0.03] space-y-4 lg:col-span-2">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest border-b border-white/[0.03] pb-2 font-semibold">CHANNEL RESPONSE STATUS</h3>
            
            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-300 font-medium">WhatsApp Vernacular Ingress</span>
                </div>
                <div className="font-mono text-gray-400 flex items-center gap-3">
                  <span>SLA Breach: 0%</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/5 font-semibold py-0.5 px-2 rounded-full uppercase">1.2ms Lag</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-300 font-medium">Web Customer Widget Channel</span>
                </div>
                <div className="font-mono text-gray-400 flex items-center gap-3">
                  <span>SLA Breach: 1.4%</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/5 font-semibold py-0.5 px-2 rounded-full uppercase">42ms Latency</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-gray-300 font-medium">Customer Email Resolution Hub</span>
                </div>
                <div className="font-mono text-gray-400 flex items-center gap-3">
                  <span>SLA Breach: 2.8%</span>
                  <span className="text-[10px] text-orange-400 bg-orange-500/5 font-semibold py-0.5 px-2 rounded-full uppercase">8.1m response cycle</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-300 font-medium">Native Android Companion Sync</span>
                </div>
                <div className="font-mono text-gray-400 flex items-center gap-3">
                  <span>SLA Breach: 0%</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/5 font-semibold py-0.5 px-2 rounded-full uppercase">Secure SSL Ingress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Operational Notices & Warnings */}
          <div className="bg-white/[0.01] rounded-xl p-5 border border-white/[0.03] space-y-4">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest border-b border-white/[0.03] pb-2 font-semibold font-sans">DIAGNOSTICS ADVISORY</h3>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02]">
                <h4 className="font-bold text-emerald-450 text-[12px] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>System Load: NOMINAL</span>
                </h4>
                <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
                  No active SLA bottleneck detected. Average vernacular matching precision remains at 99.43%. Global agent takeover routes operational.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-orange-500/10 bg-orange-500/[0.02]">
                <h4 className="font-bold text-orange-450 text-[12px] flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-orange-500" />
                  <span>Vernacular Sync Warning</span>
                </h4>
                <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
                  A slight uptick in transliterated mixes language mixes (Hinglish/Tamil) in Apparel checkouts may require manual overview releases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
