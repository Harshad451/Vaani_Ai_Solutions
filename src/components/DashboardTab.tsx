import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Sparkles, ThumbsUp, TrendingUp, Zap, Award, Users, Bot, AlertTriangle, Smartphone, Activity, Languages, UserPlus, Edit2, Check, X, Clock, Plus, Trash2 } from 'lucide-react';
import { Ticket, Employee } from '../types';

interface DashboardTabProps {
  employee: Employee | null;
  loadAiBriefing: () => void;
  briefingLoading: boolean;
  aiBriefing: string;
  tickets: Ticket[];
  setStatusFilter: (filter: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  totalIncoming: number;
  activeAICount: number;
  breachedSlaCount: number;
  activeEscalatedCount: number;
  myClaimedCount: number;
  setSelectedTicketId: (id: string | null) => void;
}

export function DashboardTab({
  employee,
  loadAiBriefing,
  briefingLoading,
  aiBriefing,
  tickets,
  setStatusFilter,
  setActiveTab,
  setSearchTerm,
  totalIncoming,
  activeAICount,
  breachedSlaCount,
  activeEscalatedCount,
  myClaimedCount,
  setSelectedTicketId
}: DashboardTabProps) {
  // Local state for dashboard tabs
  const [dashSection, setDashSection] = React.useState<'analytics' | 'employees'>('analytics');

  // Employee list states
  const [employeesList, setEmployeesList] = React.useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);
  const [employeeError, setEmployeeError] = React.useState<string | null>(null);

  // New hire form state
  const [hireName, setHireName] = React.useState('');
  const [hireEmail, setHireEmail] = React.useState('');
  const [hireRole, setHireRole] = React.useState('Vernacular Specialist');
  const [hirePassword, setHirePassword] = React.useState('');
  const [hiring, setHiring] = React.useState(false);
  const [hireSuccess, setHireSuccess] = React.useState<string | null>(null);
  const [hireError, setHireError] = React.useState<string | null>(null);

  // Edit employee state
  const [editingEmployeeId, setEditingEmployeeId] = React.useState<string | null>(null);
  const [editingRole, setEditingRole] = React.useState('');

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setEmployeeError(null);
    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await window.fetch('/api/employees', { headers });
      if (res.ok) {
        const data = await res.json();
        setEmployeesList(data.employees || []);
      } else {
        const errData = await res.json();
        setEmployeeError(errData.error || 'Failed to fetch team roster.');
      }
    } catch (err: any) {
      setEmployeeError(err?.message || 'Server offline.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const handleHireEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireName.trim() || !hireEmail.trim() || !hirePassword.trim()) {
      setHireError('Please complete all fields to recruit this agent.');
      return;
    }

    setHiring(true);
    setHireError(null);
    setHireSuccess(null);

    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await window.fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: hireName,
          email: hireEmail,
          role: hireRole,
          password: hirePassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHireSuccess(`Successfully provisioned seat for ${hireName}!`);
        setHireName('');
        setHireEmail('');
        setHirePassword('');
        setHireRole('Vernacular Specialist');
        fetchEmployees();
      } else {
        setHireError(data.error || 'Failed to register. Please check complexity constraints.');
      }
    } catch (err: any) {
      setHireError(err?.message || 'Network failure registering details.');
    } finally {
      setHiring(false);
    }
  };

  const handleFireEmployee = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to terminate/remove agent ${name} from your business workspace? This will lock their session and delete their profile.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await window.fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchEmployees();
      } else {
        alert(data.error || 'Failed to terminate employee.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error occurred during request.');
    }
  };

  const handleUpdateRole = async (id: string) => {
    if (!editingRole.trim()) return;

    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await window.fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: editingRole })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingEmployeeId(null);
        setEditingRole('');
        fetchEmployees();
      } else {
        alert(data.error || 'Failed to update employee role.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error occurred during request.');
    }
  };

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 bg-[#06070a] text-[#f2ede4] relative"
    >
      {/* Tech Deco Background Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 shadow-inner" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Hero Greeting Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.05] pb-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              Live Telemetry Stream Active
            </span>
            <span className="text-xs text-gray-500 font-mono select-none">• Active Node 3000 Pipeline</span>
          </div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white">
            Welcome back, <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent">{employee?.name || 'Administrator'}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl font-sans">
            Real-time analytics engine processing vernacular dialogues, compliance safety thresholds, SLA countdown alerts, and AI-driven workflow deflection logic.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadAiBriefing}
            disabled={briefingLoading}
            className="px-4.5 py-2.5 font-semibold text-xs rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all text-[#f2ede4] flex items-center gap-2 shadow-lg hover:shadow-orange-500/10 active:scale-95 cursor-pointer disabled:opacity-50 select-none border border-white/10"
          >
            {briefingLoading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Assembling Operational Intel...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-amber-200 animate-pulse" />
                <span>Refresh AI Executive Briefing</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Interactive Section Toggles for Owner Dashboard */}
      <div className="relative z-10 flex border-b border-white/[0.04] p-1 gap-2 max-w-sm bg-[#0a0c10] rounded-xl border border-white/[0.03] mb-2">
        <button
          onClick={() => setDashSection('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer select-none ${
            dashSection === 'analytics'
              ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/5'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
          }`}
        >
          <TrendingUp size={14} className={dashSection === 'analytics' ? 'text-orange-400' : 'text-gray-400'} />
          <span>Business Analytics</span>
        </button>
        <button
          onClick={() => setDashSection('employees')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer select-none ${
            dashSection === 'employees'
              ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/5'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.01]'
          }`}
        >
          <Users size={14} className={dashSection === 'employees' ? 'text-orange-400' : 'text-gray-400'} />
          <span>Team & Recruitment</span>
          <span className="ml-auto font-mono text-[9px] bg-black/60 px-1.5 py-0.2 rounded border border-white/[0.05]">
            {employeesList.length}
          </span>
        </button>
      </div>

      {dashSection === 'analytics' ? (
        <>
          {/* KPI Cards Row (Animated and Clickable for State Drilldown) */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CSAT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -4, scale: 1.015, borderColor: "rgba(16, 185, 129, 0.2)", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.08)" }}
          onClick={() => {
            setStatusFilter('RESOLVED');
            setActiveTab('inbox');
          }}
          className="bg-gradient-to-b from-[#0e1017] to-[#0a0a0f] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 group-hover:text-emerald-400 transition-colors">Avg CSAT Score</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1 py-0.2 rounded border border-emerald-400/20 scale-90 opacity-0 group-hover:opacity-100 transition-all duration-300">DRILL</span>
              </div>
              <div className="text-3xl font-extrabold font-sans text-white mt-2 tracking-tight">
                {(() => {
                  const rated = tickets.filter(t => t.rating !== undefined && t.rating > 0);
                  return rated.length > 0
                    ? (rated.reduce((acc, curr) => acc + (curr.rating || 0), 0) / rated.length).toFixed(1)
                    : "4.8";
                })()} <span className="text-xs font-mono font-medium text-gray-500">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <ThumbsUp size={16} />
            </div>
          </div>
          
          <div className="mt-5 pt-3 border-t border-white/[0.03]">
            <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp size={11} className="mr-0.5" /> +4.2%
              </span>
              <span>Click to view rated tickets</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Dual Mode automation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.015, borderColor: "rgba(249, 115, 22, 0.2)", boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.08)" }}
          onClick={() => {
            setStatusFilter('AI_PENDING');
            setActiveTab('inbox');
          }}
          className="bg-gradient-to-b from-[#0e1017] to-[#0a0a0f] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 group-hover:text-orange-400 transition-colors">AI Deflection Rate</span>
                <span className="text-[9px] font-mono text-orange-400 bg-orange-400/10 px-1 py-0.2 rounded border border-orange-400/20 scale-90 opacity-0 group-hover:opacity-100 transition-all duration-300">DRILL</span>
              </div>
              <div className="text-3xl font-extrabold font-sans text-white mt-2 tracking-tight">
                {totalIncoming > 0 ? Math.round((activeAICount / totalIncoming) * 100) : 100}%
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/15 group-hover:bg-orange-500 group-hover:text-black transition-all">
              <Zap size={16} />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.03]">
            <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span className="text-amber-400 font-semibold">{activeAICount} active queries</span>
              <span>View bots active queue</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: SLA compliance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -4, scale: 1.015, borderColor: "rgba(99, 102, 241, 0.2)", boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.08)" }}
          onClick={() => {
            setStatusFilter('ALL');
            setSearchTerm('');
            setActiveTab('inbox');
          }}
          className="bg-gradient-to-b from-[#0e1017] to-[#0a0a0f] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 group-hover:text-indigo-400 transition-colors">SLA Compliance</span>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-400/10 px-1 py-0.2 rounded border border-indigo-400/20 scale-90 opacity-0 group-hover:opacity-100 transition-all duration-300">DRILL</span>
              </div>
              <div className="text-3xl font-extrabold font-sans text-white mt-2 tracking-tight">
                {totalIncoming > 0 ? Math.round(((totalIncoming - breachedSlaCount) / totalIncoming) * 100) : 100}%
              </div>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15 group-hover:bg-indigo-500 group-hover:text-black transition-all">
              <Award size={16} />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.03]">
            <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span className="text-indigo-400 font-semibold">{totalIncoming - breachedSlaCount} compliant</span>
              <span>View complete workspace</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Load */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.015, borderColor: "rgba(245, 158, 11, 0.2)", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.08)" }}
          onClick={() => {
            setStatusFilter('ESCALATED');
            setActiveTab('inbox');
          }}
          className="bg-gradient-to-b from-[#0e1017] to-[#0a0a0f] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all group relative overflow-hidden"
        >
          {activeEscalatedCount > 0 && (
            <span className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          )}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 group-hover:text-amber-400 transition-colors">Escalated Queue</span>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 scale-90 opacity-0 group-hover:opacity-100 transition-all duration-300">DRILL</span>
              </div>
              <div className="text-3xl font-extrabold font-sans text-amber-400 mt-2 tracking-tight">
                {activeEscalatedCount}
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/15 group-hover:bg-amber-500 group-hover:text-black transition-all">
              <Users size={16} />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.03]">
            <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
              <span className="text-amber-400 font-semibold">{myClaimedCount} claimed by you</span>
              <span>Open escalated inbox</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Middle Row: AI Briefing and Live SLA alerts */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* AI Operations Briefing bulletin (Card with real generation) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="lg:col-span-7 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md relative overflow-hidden group w-full"
        >
          {/* Tech mesh inside */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.03),transparent_40%)] pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 relative z-10">
            <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2 font-sans font-semibold">
              <span className="p-1 px-1.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 animate-pulse">
                <Bot size={15} />
              </span>
              <span>AI Executive Operations Intelligence Briefing</span>
            </h2>
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest px-2.5 py-0.5 bg-black/40 rounded border border-white/[0.04]">
              Gemini 3.5 Flash Model
            </span>
          </div>

          <div className="min-h-[220px] bg-black/30 border border-white/[0.03] rounded-xl p-4.5 font-sans text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-[350px] relative z-10 custom-scrollbar">
            {briefingLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3.5">
                <div className="relative">
                  <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-orange-500/30 opacity-70"></span>
                  <RefreshCw size={24} className="text-orange-500 animate-spin relative" />
                </div>
                <span className="font-mono text-[11px] text-gray-400 animate-pulse text-center tracking-wide">
                  CRITICAL SECURE AGENT DISPATCH:<br />
                  <span className="text-orange-400">Processing real-time vernacular telemetry & linguistic statistics...</span>
                </span>
              </div>
            ) : aiBriefing ? (
              <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3">
                {aiBriefing.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) {
                    return <h3 key={idx} className="text-sm font-bold text-orange-400 mt-4 mb-2 flex items-center gap-1.5">{line.replace('###', '').trim()}</h3>;
                  } else if (line.startsWith('**') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                    return <p key={idx} className="text-gray-100 font-semibold mt-3 text-[12px] tracking-wide border-l-2 border-orange-500/50 pl-2">{line}</p>;
                  } else if (line.startsWith('-') || line.startsWith('*')) {
                    return <li key={idx} className="ml-4 list-none text-gray-300 mt-1.5 flex items-start gap-1.5"><span className="text-orange-500 mt-1 select-none">▪</span> <span>{line.replace(/^[-*]\s*/, '')}</span></li>;
                  } else {
                    return <p key={idx} className="text-gray-450 mt-1 pl-4 font-sans">{line}</p>;
                  }
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 gap-3">
                <Bot size={32} className="text-gray-600 stroke-1" />
                <p className="max-w-md text-xs font-mono text-gray-500 leading-normal">
                  Operational context queue is standby. Click "Refresh AI Executive Briefing" above or trigger fresh analytics to generate immediate semantic insights of active user cases.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Immediate SLA warning list */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="lg:col-span-5 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden group w-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.02),transparent_40%)] pointer-events-none" />

          <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2 font-sans mb-3 border-b border-white/[0.04] pb-3 relative z-10">
            <span className="p-1 px-1.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
              <AlertTriangle size={15} className="text-rose-400 animate-pulse" />
            </span>
            <span>SLA Countdown & Alerts Room</span>
          </h2>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar relative z-10">
            {tickets.filter(t => t.status !== 'RESOLVED').length > 0 ? (
              tickets
                .filter(t => t.status !== 'RESOLVED')
                .sort((a, b) => {
                  const aTime = a.slaExpiresAt ? new Date(a.slaExpiresAt).getTime() : Infinity;
                  const bTime = b.slaExpiresAt ? new Date(b.slaExpiresAt).getTime() : Infinity;
                  return aTime - bTime;
                })
                .slice(0, 5)
                .map((t, index) => {
                  const isBreached = t.slaExpiresAt && new Date(t.slaExpiresAt).getTime() <= Date.now();
                  const timeRemaining = t.slaExpiresAt ? new Date(t.slaExpiresAt).getTime() - Date.now() : -1;
                  const minutesRemaining = Math.max(0, Math.floor(timeRemaining / 60000));

                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + 0.05 * index }}
                      whileHover={{ scale: 1.015, x: 4, backgroundColor: "rgba(255, 255, 255, 0.02)", borderColor: "rgba(255, 255, 255, 0.08)" }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setActiveTab('inbox');
                      }}
                      className="w-full text-left bg-[#10121a]/50 border border-white/[0.03] rounded-xl p-3.5 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors truncate max-w-[110px]">{t.customerName}</span>
                          <span className="text-[8px] font-mono text-gray-400 font-bold px-1.5 py-0.2 bg-white/[0.03] rounded border border-white/[0.04] uppercase tracking-wider">{t.channel || 'WEB'}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono truncate">
                          {t.messages.length > 0 ? t.messages[t.messages.length - 1].content : 'No message telemetry'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {isBreached ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse">BREACH ALERT</span>
                        ) : minutesRemaining <= 5 ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 animate-pulse">{minutesRemaining}m Left</span>
                        ) : (
                          <span className="text-[9px] font-mono font-medium px-2 py-1 bg-white/[0.02] text-gray-400 rounded-full border border-white/[0.03]">{minutesRemaining}m Left</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 font-sans border border-dashed border-white/[0.04] rounded-xl">
                No active tickets in queue. Active compliance stands 100%!
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Third Row: Beautiful Multi-Dimensional SVG Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-4">
        {/* Chart A: Channels Distribution SVG */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-4 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md relative overflow-hidden group w-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.02),transparent_40%)] pointer-events-none" />

          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
            <Smartphone size={13} className="text-indigo-400" />
            <span>Channels Distribution</span>
          </h3>

          <div className="flex items-center justify-center py-5 relative z-10">
            <div className="relative w-[150px] h-[150px] flex items-center justify-center">
              {/* Simple Beautiful SVG Arc/Donut Ring representing channel distribution with dash growth */}
              <svg width="150" height="150" viewBox="0 0 40 40" className="transform -rotate-90 w-full h-full">
                {/* Background grey ring */}
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="white" strokeWidth="2.5" strokeOpacity="0.02" />

                {(() => {
                  const total = totalIncoming || 1;
                  const wa = tickets.filter(t => t.channel === 'WHATSAPP').length;
                  const web = tickets.filter(t => t.channel === 'WEB' || !t.channel).length;
                  const email = tickets.filter(t => t.channel === 'EMAIL').length;
                  const sms = tickets.filter(t => t.channel === 'SMS').length;

                  const waPct = (wa / total) * 100;
                  const webPct = (web / total) * 100;
                  const emailPct = (email / total) * 100;
                  const smsPct = (sms / total) * 100;

                  const d1 = (waPct / 100) * 100.5;
                  const d2 = (webPct / 100) * 100.5;
                  const d3 = (emailPct / 100) * 100.5;
                  const d4 = (smsPct / 100) * 100.5;

                  return (
                    <>
                      {/* WhatsApp arc (Orange) */}
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100.5" }}
                        animate={{ strokeDasharray: `${d1} 100.5` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                        cx="20" cy="20" r="16" fill="transparent" stroke="#f97316" strokeWidth="3" strokeDashoffset="0" strokeLinecap="round" 
                      />
                      {/* Web arc (Amber) */}
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100.5" }}
                        animate={{ strokeDasharray: `${d2} 100.5` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        cx="20" cy="20" r="16" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDashoffset={-d1} strokeLinecap="round" 
                      />
                      {/* Email arc (Indigo) */}
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100.5" }}
                        animate={{ strokeDasharray: `${d3} 100.5` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                        cx="20" cy="20" r="16" fill="transparent" stroke="#6366f1" strokeWidth="3" strokeDashoffset={-(d1 + d2)} strokeLinecap="round" 
                      />
                      {/* SMS arc (Pink) */}
                      <motion.circle 
                        initial={{ strokeDasharray: "0 100.5" }}
                        animate={{ strokeDasharray: `${d4} 100.5` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                        cx="20" cy="20" r="16" fill="transparent" stroke="#ec4899" strokeWidth="3" strokeDashoffset={-(d1 + d2 + d3)} strokeLinecap="round" 
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Center Statistics Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-3xl font-extrabold font-sans text-white tracking-tight"
                >
                  {totalIncoming}
                </motion.span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500 font-bold mt-0.5">Telemetry</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/[0.04] pt-4 relative z-10 w-full">
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-black/10 hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-colors font-sans">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              <span className="text-gray-400">WhatsApp: <b className="text-white font-semibold">{tickets.filter(t => t.channel === 'WHATSAPP').length}</b></span>
            </div>
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-black/10 hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-colors font-sans">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span className="text-gray-400">Web Portal: <b className="text-white font-semibold">{tickets.filter(t => t.channel === 'WEB' || !t.channel).length}</b></span>
            </div>
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-black/10 hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-colors font-sans">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              <span className="text-gray-400">Email: <b className="text-white font-semibold">{tickets.filter(t => t.channel === 'EMAIL').length}</b></span>
            </div>
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-black/10 hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-colors font-sans font-sans">
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
              <span className="text-gray-400">SMS: <b className="text-white font-semibold">{tickets.filter(t => t.channel === 'SMS').length}</b></span>
            </div>
          </div>
        </motion.div>

        {/* Chart B: Sentiment Breakdown Bar Charts */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:col-span-4 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md relative overflow-hidden group w-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.02),transparent_40%)] pointer-events-none" />

          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 relative z-10 animate-fade-in">
            <Activity size={13} className="text-rose-400 animate-pulse" />
            <span>Consumer Sentiment Index</span>
          </h3>

          <div className="space-y-4 py-1.5 flex-1 flex flex-col justify-center relative z-10 w-full">
            {(() => {
              const total = totalIncoming || 1;
              const pos = tickets.filter(t => t.sentiment === 'Positive').length;
              const neu = tickets.filter(t => t.sentiment === 'Neutral').length;
              const neg = tickets.filter(t => t.sentiment === 'Negative').length;
              const ang = tickets.filter(t => t.sentiment === 'Angry').length;

              return (
                <>
                  {/* Positive */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><span className="text-xs">😊</span> Positive</span>
                      <span className="font-semibold text-gray-200">{pos} ({Math.round((pos/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(pos/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-[#10b981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* Neutral */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><span className="text-xs">😐</span> Neutral</span>
                      <span className="font-semibold text-gray-200">{neu} ({Math.round((neu/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(neu/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* Negative */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><span className="text-xs">😰</span> Negative</span>
                      <span className="font-semibold text-gray-200">{neg} ({Math.round((neg/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(neg/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* Angry */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><span className="text-xs">😡</span> Angry & Escalated</span>
                      <span className="font-semibold text-rose-400">{ang} ({Math.round((ang/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(ang/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </motion.div>

        {/* Chart C: Language workload metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="md:col-span-4 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md relative overflow-hidden group w-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.02),transparent_40%)] pointer-events-none" />

          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
            <Languages size={13} className="text-amber-400" />
            <span>Linguistic Distribution</span>
          </h3>

          <div className="space-y-4 py-1.5 flex-1 flex flex-col justify-center relative z-10 w-full">
            {(() => {
              const total = totalIncoming || 1;
              const hinglish = tickets.filter(t => t.detectedLanguage === 'Hinglish' || t.detectedLanguage === 'hi_en' || (t.detectedLanguage && t.detectedLanguage.toLowerCase().includes('hinglish'))).length;
              const hindi = tickets.filter(t => t.detectedLanguage === 'Hindi' || t.detectedLanguage === 'hi' || (t.detectedLanguage && t.detectedLanguage.toLowerCase() === 'hindi')).length;
              const english = tickets.filter(t => t.detectedLanguage === 'English' || t.detectedLanguage === 'en' || !t.detectedLanguage).length;
              const other = totalIncoming - (hinglish + hindi + english);

              return (
                <>
                  {/* Hinglish */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Hinglish (Code-Mixed)</span>
                      <span className="font-semibold text-gray-200">{hinglish} ({Math.round((hinglish/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(hinglish/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* Hindi */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Hindi (Devanagari)</span>
                      <span className="font-semibold text-gray-200">{hindi} ({Math.round((hindi/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(hindi/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* English */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>English (Standard)</span>
                      <span className="font-semibold text-gray-200">{english} ({Math.round((english/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(english/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-[#6366f1] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                      />
                    </div>
                  </div>

                  {/* Other Vernaculars */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Regional / Multilingual</span>
                      <span className="font-semibold text-gray-200">{other} ({Math.round((other/total)*100)}%)</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.01]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(other/total)*100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-[#6366f1] rounded-full opacity-60" 
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </motion.div>
      </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 flex flex-col gap-6"
        >
          {/* Error and Success Banners */}
          {employeeError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-sans select-none">
              <AlertTriangle size={15} className="animate-pulse text-rose-400 shrink-0" />
              <span>{employeeError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Hand: Roster */}
            <div className="lg:col-span-7 bg-[#0c0d12]/55 border border-white/[0.04] rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden self-stretch">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.02),transparent_40%)] pointer-events-none" />
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 font-sans">
                    <Users size={16} className="text-orange-400" />
                    <span>Active Operator Seats Directory</span>
                  </h2>
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                    Managing and auditing employees currently authorized to handle business vernacular routing.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full shadow-inner animate-pulse select-none self-start">
                  {employeesList.length} Active Seat{employeesList.length === 1 ? '' : 's'}
                </span>
              </div>

              {loadingEmployees ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="animate-spin text-orange-500" size={24} />
                  <span className="text-xs font-mono text-gray-400">Auditing roster data nodes...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar overflow-x-hidden">
                  {employeesList.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-404 border border-dashed border-white/[0.04] rounded-xl font-sans">
                      No hired employees active. Use the Recruitment Desk of this dashboard to enroll operators.
                    </div>
                  ) : (
                    employeesList.map((emp) => {
                      const isSelf = emp.id === employee?.id;
                      const isOwner = emp.role === 'Business Owner';
                      
                      const colors = [
                        'bg-orange-500/10 text-orange-400 border-orange-500/20',
                        'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                        'bg-pink-500/10 text-pink-400 border-pink-500/20',
                        'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      ];
                      const colorIndex = emp.name.charCodeAt(0) % colors.length;

                      return (
                        <div
                          key={emp.id}
                          className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#10121a]/50 hover:bg-[#121420]/70 border border-white/[0.03] hover:border-white/[0.06] rounded-xl p-4 transition-all"
                        >
                          <div className="flex items-center gap-3.5 max-w-[80%]">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border font-sans uppercase shrink-0 ${colors[colorIndex]}`}>
                              {emp.name.slice(0, 2)}
                            </div>
                            <div className="space-y-0.5 truncate min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">{emp.name}</span>
                                {isSelf && (
                                  <span className="text-[8px] font-mono font-bold bg-white/[0.04] text-gray-300 border border-white/[0.08] px-1.5 py-0.2 rounded uppercase">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 truncate">
                                <span>{emp.email}</span>
                                <span className="text-gray-500 select-none">•</span>
                                <span className="text-gray-400 truncate">ID: {emp.id}</span>
                              </div>
                              
                              <div className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                                <Clock size={10} className="text-gray-555 shrink-0" />
                                <span>Enrolled: {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Initial Setup'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center">
                            {editingEmployeeId === emp.id ? (
                              <div className="flex items-center gap-1.5 bg-[#151722] p-1.5 rounded-lg border border-white/[0.06] select-none">
                                <select
                                  value={editingRole}
                                  onChange={(e) => setEditingRole(e.target.value)}
                                  className="bg-transparent text-xs text-white border-0 focus:ring-0 cursor-pointer font-sans"
                                >
                                  <option value="Vernacular Specialist" className="bg-[#0f111a] text-white">Vernacular Specialist</option>
                                  <option value="Lead Operator" className="bg-[#0f111a] text-white">Lead Operator</option>
                                  <option value="Senior Escalations Officer" className="bg-[#0f111a] text-white">Senior Escalations Officer</option>
                                  <option value="CSAT Assurance Auditor" className="bg-[#0f111a] text-white">CSAT Assurance Auditor</option>
                                  <option value="Business Owner" className="bg-[#0f111a] text-white">Business Owner</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRole(emp.id)}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition cursor-pointer"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEmployeeId(null);
                                    setEditingRole('');
                                  }}
                                  className="p-1 text-rose-450 hover:bg-[#1a0c0c] rounded transition cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 select-none font-sans">
                                <span className="text-[10px] font-mono bg-white/[0.02] border border-white/[0.05] rounded px-2 py-1 text-gray-300">
                                  {emp.role}
                                </span>
                                
                                {!isOwner && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingEmployeeId(emp.id);
                                        setEditingRole(emp.role);
                                      }}
                                      title="Modify Role"
                                      className="p-1 px-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-gray-400 hover:text-white rounded transition active:scale-95 cursor-pointer flex items-center justify-center"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    
                                    {!isSelf && (
                                      <button
                                        type="button"
                                        onClick={() => handleFireEmployee(emp.id, emp.name)}
                                        title="Fire / Terminate Seat"
                                        className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-400 rounded transition active:scale-95 cursor-pointer flex items-center justify-center animate-fade-in"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Right Hand: Recruit Form */}
            <div className="lg:col-span-12 xl:col-span-5 bg-[#0c0d12]/55 border border-white/[0.04] rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden self-stretch font-sans">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.02),transparent_40%)] pointer-events-none" />
              <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 font-sans border-b border-white/[0.04] pb-4">
                <UserPlus size={16} className="text-orange-400 animate-pulse" />
                <span>Onboard Recruitment Desk</span>
              </h2>

              <p className="text-[11px] text-gray-400 leading-relaxed font-sans -mt-1.5">
                Register a new human agent seat for your company support workflow. They will immediately receive access to their console.
              </p>

              {hireSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in font-sans">
                  <Check size={14} className="animate-bounce shrink-0" />
                  <span>{hireSuccess}</span>
                </div>
              )}

              {hireError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/15 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-fade-in font-sans">
                  <AlertTriangle size={14} className="animate-pulse shrink-0" />
                  <span>{hireError}</span>
                </div>
              )}

              <form onSubmit={handleHireEmployee} className="space-y-4 text-xs font-sans">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">Agent Full Name</label>
                  <input
                    type="text"
                    required
                    value={hireName}
                    onChange={(e) => setHireName(e.target.value)}
                    placeholder="e.g. Anandita Iyer"
                    className="w-full bg-[#10121a]/60 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 hover:border-white/[0.1] transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">Agent Email Address</label>
                  <input
                    type="email"
                    required
                    value={hireEmail}
                    onChange={(e) => setHireEmail(e.target.value)}
                    placeholder="e.g. anandita@noshberry.com"
                    className="w-full bg-[#10121a]/60 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 hover:border-white/[0.1] transition-all"
                  />
                </div>

                {/* Role dropdown */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-300">Assigned Operational Role</label>
                  <select
                    value={hireRole}
                    onChange={(e) => setHireRole(e.target.value)}
                    className="w-full bg-[#10121a]/60 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 hover:border-white/[0.1] transition-all cursor-pointer font-sans"
                  >
                    <option value="Vernacular Specialist" className="bg-[#0f111a] text-white">Vernacular Specialist</option>
                    <option value="Lead Operator" className="bg-[#0f111a] text-white">Lead Operator</option>
                    <option value="Senior Escalations Officer" className="bg-[#0f111a] text-white">Senior Escalations Officer</option>
                    <option value="CSAT Assurance Auditor" className="bg-[#0f111a] text-white">CSAT Assurance Auditor</option>
                  </select>
                </div>

                {/* Access passcode */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center select-none font-sans">
                    <label className="font-semibold text-gray-300">Security Login Passcode</label>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                        let val = "";
                        for (let i = 0; i < 11; i++) {
                          val += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        val = "Va1!" + val;
                        setHirePassword(val);
                      }}
                      className="text-[10px] font-mono text-orange-400 hover:underline cursor-pointer"
                    >
                      Autogenerate Passcode
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={hirePassword}
                    onChange={(e) => setHirePassword(e.target.value)}
                    placeholder="e.g. Va1!pAsscode"
                    className="w-full bg-[#10121a]/60 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 hover:border-white/[0.1] transition-all font-mono"
                  />
                </div>

                <div className="pt-2 select-none font-sans">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    disabled={hiring}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-700 transition shadow-lg shadow-orange-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-white/5 disabled:opacity-50"
                  >
                    {hiring ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Enrolling Digital Identity...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Recruit and Enroll Agent Seat</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
