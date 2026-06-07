import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sliders, Check, AlertTriangle, Activity, Clock, Bot, Smartphone, RefreshCw } from 'lucide-react';

interface SettingsData {
  companyName: string;
  supportEmail: string;
  slaMinutes: number;
  botEnabled: boolean;
  defaultGreeting: string;
  aiPolicyInstructions?: string;
  isTrained?: boolean;
  brandKnowledge?: string;
  businessIndustry?: string;
  supportTone?: string;
  kbBusiness?: string;
  kbReturns?: string;
  kbShipping?: string;
  kbEscalation?: string;
}

interface SettingsTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData>>;
  settingsSaving: boolean;
  setSettingsSaving: (saving: boolean) => void;
  settingsSaveStatus: 'IDLE' | 'SUCCESS' | 'ERROR';
  setSettingsSaveStatus: (status: 'IDLE' | 'SUCCESS' | 'ERROR') => void;
  fetchSettings: () => Promise<void>;
  uiLang: 'en' | 'hi';
}

export function SettingsTab({
  settings,
  setSettings,
  settingsSaving,
  setSettingsSaving,
  settingsSaveStatus,
  setSettingsSaveStatus,
  fetchSettings,
  uiLang
}: SettingsTabProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col p-6 overflow-y-auto"
    >
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-200 tracking-tight flex items-center gap-2">
            <Sliders className="text-orange-500" size={20} />
            <span>{uiLang === 'en' ? 'Enterprise Configuration Center' : 'एंटरप्राइज कॉन्फ़िगरेशन सेंटर'}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure your global business branding variables, SLA limits, WhatsApp channels, and automated AI assistance parameters persisted in Firestore.
          </p>
        </div>

        {/* Feedback Top Notification Banner */}
        {settingsSaveStatus !== 'IDLE' && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            settingsSaveStatus === 'SUCCESS' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {settingsSaveStatus === 'SUCCESS' ? (
              <>
                <Check size={14} />
                <span>All business parameters successfully preserved inside Cloud Firestore! Settings synced in real-time.</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Failed to save variables inside database. Please check connection logs.</span>
              </>
            )}
            <button 
              onClick={() => setSettingsSaveStatus('IDLE')}
              className="ml-auto underline font-mono text-[10px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Settings Main Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Configurations */}
          <div id="settings_company_profile" className="scroll-mt-24 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Activity size={15} />
              <span>Company Profile</span>
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">Company name</label>
                <input
                  type="text"
                  value={settings?.companyName || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                  placeholder="e.g. NoshBerry Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">Support Contact Email</label>
                <input
                  type="email"
                  value={settings?.supportEmail || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                  placeholder="e.g. support@noshberry.com"
                />
              </div>
            </div>
          </div>

          {/* Operational Limits */}
          <div id="settings_sla_rules" className="scroll-mt-24 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Clock size={15} />
              <span>SLA Threshold Rules</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">SLA Expiration timer (minutes)</label>
                <input
                  type="number"
                  value={settings?.slaMinutes || 10}
                  onChange={(e) => setSettings(prev => ({ ...prev, slaMinutes: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500"
                  placeholder="e.g. 10"
                  min={1}
                />
                <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                  Defines when warning or breach tags trigger on the CRM desk queues for operators.
                </p>
              </div>
            </div>
          </div>

          {/* Automated Bot Settings */}
          <div id="settings_ai_dispatcher" className="scroll-mt-24 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4 md:col-span-2">
            <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Bot size={15} />
              <span>AI Assistant Auto-Dispatcher</span>
            </h2>

            <div className="space-y-4 text-xs">
              {/* Bot Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-black/25 border border-white/[0.03] rounded-xl">
                <div>
                  <span className="block text-gray-200 font-semibold text-xs">Enable Automatic Bot Replying</span>
                  <span className="block text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                    If enabled, VaaniAI responds to all incoming customer chats automatically utilizing Gemini. If disabled, AI remains a helpful copilot advisor.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, botEnabled: !prev.botEnabled }))}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings?.botEnabled ? 'bg-orange-500' : 'bg-[#1a1c24]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#f2ede4] transition-transform ${settings?.botEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Customer Welcome Greeting Template */}
              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">Default Greeting (First inbound text response)</label>
                <textarea
                  rows={3}
                  value={settings?.defaultGreeting || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultGreeting: e.target.value }))}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500 leading-relaxed"
                  placeholder="Enter the template greeting response text..."
                />
              </div>
            </div>
          </div>

          {/* Meta WhatsApp Cloud API Channel details */}
          <div className="bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4 md:col-span-2 text-xs">
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Smartphone size={15} />
              <span>Meta WhatsApp Integration Channel</span>
            </h2>

            <div className="space-y-3 font-mono leading-relaxed text-gray-450 bg-black/25 p-4 rounded-xl border border-white/[0.03] text-[11px]">
              <p className="text-gray-300 font-sans font-bold">
                Launch your WhatsApp automation instantly by configuring your Meta Developer Endpoint callback:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <span className="text-orange-400 block text-[10px] uppercase font-bold">Webhook URI URL:</span>
                  <div className="bg-[#12141c] p-2.5 rounded border border-white/[0.04] text-gray-200 select-all font-mono break-all text-[10.5px]">
                    {typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://precise-current-3lsxp.run.app'}/api/webhook/whatsapp
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-orange-400 block text-[10px] uppercase font-bold">Meta Challenge Verify Token:</span>
                  <div className="bg-[#12141c] p-2.5 rounded border border-white/[0.04] text-gray-150 select-all font-mono">
                    VERNACULAR_COPILOT_SECURE_TOKEN_2026
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                * Meta Cloud webhook verification challenge events are answered seamlessly by our active live background server.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Control Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={async () => {
              setSettingsSaving(true);
              setSettingsSaveStatus('IDLE');
              try {
                const token = localStorage.getItem('vaani_logged_token');
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) {
                  headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch('/api/settings', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(settings)
                });
                if (res.ok) {
                  setSettingsSaveStatus('SUCCESS');
                  fetchSettings();
                } else {
                  setSettingsSaveStatus('ERROR');
                }
              } catch (err) {
                setSettingsSaveStatus('ERROR');
              } finally {
                setSettingsSaving(false);
              }
            }}
            disabled={settingsSaving}
            className="px-6 py-3 font-semibold text-xs rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition text-[#f2ede4] flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            {settingsSaving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving Parameters...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Preserve Parameters to Cloud DB</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
