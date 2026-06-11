import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Check, AlertTriangle, Activity, Clock, Bot, Smartphone, RefreshCw, Code, Copy, Sparkles, MessageSquare, X } from 'lucide-react';

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

  // Real-time Database and REST API Integration Settings
  dbIntegrationType?: 'POSTGRESQL' | 'MYSQL' | 'REST_API' | 'SUPABASE' | 'NONE';
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;
  dbSsl?: boolean;
  dbQueryTemplate?: string;
  apiUrl?: string;
  apiAuthHeader?: string;
  apiAuthValue?: string;
  apiOrderPath?: string;
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
  showPlaygroundBubble: boolean;
  setShowPlaygroundBubble: (show: boolean) => void;
}

export function SettingsTab({
  settings,
  setSettings,
  settingsSaving,
  setSettingsSaving,
  settingsSaveStatus,
  setSettingsSaveStatus,
  fetchSettings,
  uiLang,
  showPlaygroundBubble,
  setShowPlaygroundBubble
}: SettingsTabProps) {
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; payloadSample?: string } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers,
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Failed to invoke server probe request: ${err.message || err}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const businessId = settings?.companyName ? settings.companyName.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'XYZ_Corp';
  
  const host = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://precise-current-3lsxp.run.app';
  const embedCode = `<!-- VaaniAI AI Chat Widget Integration Script -->
<script 
  src="${host}/widget.js" 
  data-business-id="${businessId}" 
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  placeholder="e.g. XYZ Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">Support Contact Email</label>
                <input
                  type="email"
                  value={settings?.supportEmail || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                  placeholder="e.g. support@xyz.com"
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

          {/* Live Order Database & API Integrations */}
          <div className="bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4 md:col-span-2 text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="text-orange-500 animate-pulse" size={16} />
              <h2 className="text-sm font-bold text-orange-450 font-mono uppercase tracking-wider">
                Live Order Integration Database & REST API (Secure)
              </h2>
            </div>
            
            <p className="text-gray-400 text-xs leading-relaxed">
              Link your product order database or custom store endpoints directly to the automated customer agent. 
              When customers share their order numbers, the AI will securely fetch real-time logistics, shipping carrier info, and delivery status from your live systems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-gray-400 font-mono text-[10px] uppercase">Integration Engine Type</label>
                <select
                  value={settings?.dbIntegrationType || 'NONE'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSettings(prev => {
                      const updated = { ...prev, dbIntegrationType: val };
                      if (val === 'SUPABASE') {
                        if (!updated.apiOrderPath || updated.apiOrderPath === '/orders/{{orderId}}') {
                          updated.apiOrderPath = '/orders?order_id=eq.{{orderId}}';
                        }
                        if (!updated.apiAuthHeader) {
                          updated.apiAuthHeader = 'apikey';
                        }
                      }
                      return updated;
                    });
                  }}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                >
                  <option value="NONE">No Live Integration (Mock Simulation)</option>
                  <option value="POSTGRESQL">PostgreSQL Database Connection</option>
                  <option value="MYSQL">MySQL Database Connection</option>
                  <option value="REST_API">Secure REST API Endpoint Proxy</option>
                  <option value="SUPABASE">Supabase (PostgREST API Engine)</option>
                </select>
              </div>

              {(settings?.dbIntegrationType === 'POSTGRESQL' || settings?.dbIntegrationType === 'MYSQL') && (
                <>
                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Service Hostname</label>
                    <input
                      type="text"
                      value={settings?.dbHost || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbHost: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. db.yourdomain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Port Number</label>
                    <input
                      type="number"
                      value={settings?.dbPort || (settings?.dbIntegrationType === 'POSTGRESQL' ? 5432 : 3306)}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbPort: parseInt(e.target.value) || undefined }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Database Username</label>
                    <input
                      type="text"
                      value={settings?.dbUser || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbUser: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. sql_agent_read"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Database Password (Secured)</label>
                    <input
                      type="password"
                      value={settings?.dbPassword || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbPassword: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Database Name</label>
                    <input
                      type="text"
                      value={settings?.dbName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbName: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. commerce_records"
                    />
                  </div>

                  <div className="space-y-2 flex flex-col justify-center">
                    <span className="block text-gray-400 font-mono text-[10px] uppercase mb-1">SSL Connection Support</span>
                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-gray-300">
                      <input
                        type="checkbox"
                        checked={!!settings?.dbSsl}
                        onChange={(e) => setSettings(prev => ({ ...prev, dbSsl: e.target.checked }))}
                        className="rounded border-white/[0.05] bg-[#12141c] text-orange-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>Require Secure TLS/SSL Connection</span>
                    </label>
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">SQL Query Template ($1 is dynamically replaced with the customer parsed Order ID)</label>
                    <textarea
                      rows={2}
                      value={settings?.dbQueryTemplate || "SELECT * FROM orders WHERE order_id = $1 LIMIT 1;"}
                      onChange={(e) => setSettings(prev => ({ ...prev, dbQueryTemplate: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs leading-relaxed"
                      placeholder="SELECT * FROM orders WHERE order_id = $1 LIMIT 1;"
                    />
                  </div>
                </>
              )}

              {settings?.dbIntegrationType === 'REST_API' && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Base API URL Endpoint address</label>
                    <input
                      type="text"
                      value={settings?.apiUrl || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. https://api.yourstore.com/v1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Resource Path Prefix</label>
                    <input
                      type="text"
                      value={settings?.apiOrderPath || '/orders/{{orderId}}'}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiOrderPath: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="/orders/{{orderId}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Authorization Header Name</label>
                    <input
                      type="text"
                      value={settings?.apiAuthHeader || 'Authorization'}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiAuthHeader: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="Authorization"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Authorization Value (Bearer Token / Secret API Key)</label>
                    <input
                      type="password"
                      value={settings?.apiAuthValue || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiAuthValue: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="••••••••••••••••••••••••••••••••"
                    />
                  </div>
                </>
              )}

              {settings?.dbIntegrationType === 'SUPABASE' && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Supabase REST API URL address</label>
                    <input
                      type="text"
                      value={settings?.apiUrl || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. https://yourprojectdb.supabase.co/rest/v1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Supabase Resource Query Path</label>
                    <input
                      type="text"
                      value={settings?.apiOrderPath || '/orders?order_id=eq.{{orderId}}'}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiOrderPath: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="/orders?order_id=eq.{{orderId}}"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Supabase API Auth Key Header</label>
                    <input
                      type="text"
                      value={settings?.apiAuthHeader || 'apikey'}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiAuthHeader: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="apikey"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase">Supabase Anon Key / Service Role Key (Secured)</label>
                    <input
                      type="password"
                      value={settings?.apiAuthValue || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiAuthValue: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 text-xs"
                      placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Live connection testing widget */}
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={13} className="text-orange-500 animate-pulse" />
                    <span>Integration Diagnostics & Live Probe</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed max-w-lg">
                    Verify connectivity, SSL handshake, and remote credential verification for your connected database / REST API parameters safely in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 font-bold uppercase font-mono tracking-wider text-[11px] rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="animate-spin text-orange-400" size={12} />
                      <span>Verifying Engine...</span>
                    </>
                  ) : (
                    <>
                      <Activity size={12} className="text-orange-400" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`mt-3.5 p-3.5 rounded-xl border text-[11px] leading-relaxed font-mono ${
                  testResult.success 
                    ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                    : 'bg-rose-500/5 border-rose-500/15 text-rose-400'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {testResult.success ? (
                      <Check size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <p className="font-sans font-bold text-xs uppercase tracking-wide">
                        {testResult.success ? '✓ INTEGRATION ONLINE & CONNECTED' : '✗ CONNECTION VERIFICATION FAILED'}
                      </p>
                      <p className="opacity-90 leading-normal">{testResult.message}</p>
                      {testResult.payloadSample && (
                        <div className="mt-2 bg-black/40 p-2 rounded border border-white/[0.04] text-[10px] text-gray-300 overflow-x-auto select-all">
                          Payload Sample: {testResult.payloadSample}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Widget Integration Script */}
          <div className="bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 space-y-4 md:col-span-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Code size={15} />
                <span>AI Chat HTML Widget Integration Script</span>
              </h2>
              
              <span className="text-[9px] font-mono select-none px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/5 text-orange-400 font-bold uppercase">
                Active License Embed Allowed
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Connect your customer face-to-face with your personalized AI agent dynamically. Add the following lightweight asynchronous load script to any HTML page before the closing <code className="text-orange-350 font-mono text-[11px]">&lt;/body&gt;</code> tag of your store or corporate website:
            </p>

            <div className="space-y-3 font-mono leading-relaxed text-gray-450 bg-[#06070a] p-4.5 rounded-xl border border-white/[0.04] text-[11px] relative">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] text-gray-450 hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="Copy Script Integration Code"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span className="text-[10px] font-sans font-medium px-0.5">{copied ? "Copied!" : "Copy"}</span>
              </button>

              <pre className="text-gray-200 overflow-x-auto whitespace-pre font-mono text-[10px] leading-relaxed pr-16 select-all">
                {embedCode}
              </pre>
            </div>

            <p className="text-[10px] text-gray-500 font-sans leading-normal">
              * The script injects a high-performance floating action bubble configured with your dynamic Grounding Hub guidelines, custom default greetings, and brand parameters.
            </p>
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
