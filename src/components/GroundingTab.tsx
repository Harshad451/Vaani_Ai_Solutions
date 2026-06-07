import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, AlertTriangle, Sliders, RefreshCw } from 'lucide-react';

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

interface GroundingTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData>>;
  settingsSaving: boolean;
  setSettingsSaving: (saving: boolean) => void;
  settingsSaveStatus: 'IDLE' | 'SUCCESS' | 'ERROR';
  setSettingsSaveStatus: (status: 'IDLE' | 'SUCCESS' | 'ERROR') => void;
  fetchSettings: () => Promise<void>;
}

export function GroundingTab({
  settings,
  setSettings,
  settingsSaving,
  setSettingsSaving,
  settingsSaveStatus,
  setSettingsSaveStatus,
  fetchSettings
}: GroundingTabProps) {
  return (
    <motion.div
      key="grounding"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col p-6 overflow-y-auto w-full max-w-5xl mx-auto"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles size={20} className="text-orange-400 animate-pulse" />
              <span>SaaS Brand Grounding Hub</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Train and customize your business facts, return policies, and tone preferences.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono px-3 py-1.5 rounded-full font-bold uppercase">
              Trained status: Active
            </span>
          </div>
        </div>

        {/* Notification Toast for Settings status */}
        {settingsSaveStatus !== 'IDLE' && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            settingsSaveStatus === 'SUCCESS' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {settingsSaveStatus === 'SUCCESS' ? <Check size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-rose-400" />}
              <span>
                {settingsSaveStatus === 'SUCCESS' 
                  ? 'All brand dimensions successfully trained and compiled inside Cloud Firestore!'
                  : 'Failed to record brand parameters inside Firestore. Check database permissions.'}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setSettingsSaveStatus('IDLE')}
              className="underline font-mono text-[10px] cursor-pointer text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Config form */}
        <div className="bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-6.5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div>
              <h2 className="text-sm font-bold text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Sliders size={15} />
                <span>Configure Brand Policy Parameters</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Change details anytime. Back-end prompt pipelines merge them automatically.
              </p>
            </div>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setSettingsSaving(true);
              setSettingsSaveStatus('IDLE');
              
              // Formulate the compound brandKnowledge string for backend prompt construction
              const compiledKB = [
                `Business Category: ${settings?.businessIndustry || 'General Retail & Delivery'}`,
                `[Core Products & Profile]\n${settings?.kbBusiness || ''}`,
                `[Refund, Return & Cancellation Rules]\n${settings?.kbReturns || ''}`,
                `[Shipping SLAs & Delivery Commitments]\n${settings?.kbShipping || ''}`,
                `[Human hand-off escalation criteria]\n${settings?.kbEscalation || ''}`
              ].join('\n\n');

              try {
                const token = localStorage.getItem('vaani_logged_token');
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) {
                  headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch('/api/settings', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ 
                    ...settings, 
                    brandKnowledge: compiledKB, 
                    isTrained: true 
                  })
                });
                if (res.ok) {
                  setSettingsSaveStatus('SUCCESS');
                  await fetchSettings();
                } else {
                  setSettingsSaveStatus('ERROR');
                }
              } catch (err) {
                setSettingsSaveStatus('ERROR');
              } finally {
                setSettingsSaving(false);
              }
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-xs">
              {/* Column 1: Metadata setup */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold">Company / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={settings?.companyName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                      placeholder="e.g. Noshberry Store"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold">Business Domain / Category</label>
                    <select
                      value={settings?.businessIndustry || 'General Retail & Delivery'}
                      onChange={(e) => setSettings(prev => ({ ...prev, businessIndustry: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-4 py-3 text-xs text-[#f2ede4] outline-none font-mono"
                    >
                      <option value="General Retail & Delivery">General Retail & Delivery</option>
                      <option value="Apparel & Fashion Boutique">Apparel & Fashion Boutique</option>
                      <option value="Food, Grocery & Catering">Food, Grocery & Catering</option>
                      <option value="Consumer Electronics & Gadgets">Consumer Electronics & Gadgets</option>
                      <option value="Cosmetics & Personal Wellness">Cosmetics & Personal Wellness</option>
                      <option value="SAAS Platform & Tech Support">SAAS Platform & Tech Support</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold">AI Support Tone Accent</label>
                    <select
                      value={settings?.supportTone || 'Empathetic, Polite, Professional'}
                      onChange={(e) => setSettings(prev => ({ ...prev, supportTone: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-4 py-3 text-xs text-[#f2ede4] outline-none font-mono"
                    >
                      <option value="Empathetic, Polite, Professional">Empathetic, Polite & Professional</option>
                      <option value="Extremely Humble & Welcoming">Extremely Humble & Welcoming</option>
                      <option value="Enthusiastic, Bright & Energetic">Enthusiastic, Bright & Energetic</option>
                      <option value="Direct, Objective, Solution-focused">Direct, Objective & Solution-focused</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold">Default Welcome Greeting</label>
                    <input
                      type="text"
                      required
                      value={settings?.defaultGreeting || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultGreeting: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-sans focus:outline-none focus:border-orange-500"
                      placeholder="e.g. Welcome! How can we assist today?"
                    />
                  </div>
                </div>

                {/* Custom policies */}
                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold">Custom AI Response Policies</label>
                  <textarea
                    rows={4}
                    value={settings?.aiPolicyInstructions || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, aiPolicyInstructions: e.target.value }))}
                    className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-gray-200 font-mono focus:outline-none focus:border-orange-500 leading-relaxed text-[11px]"
                    placeholder="e.g. 1. Respect user language selection. 2. Keep responses brief under 3 sentences."
                  />
                </div>

                {/* Training presets */}
                <div className="space-y-2">
                  <span className="block text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">
                    Quick Training Presets:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        title: "👗 Boutique Rules",
                        details: "1. Apparel products can only be exchanged within a strict 7-day period.\n2. Do NOT offer refunds unless damaged apparel arrives."
                      },
                      {
                        title: "🛒 Delivery SLAs",
                        details: "1. For standard shipping delays, explain that the items take 3-5 days for quality checkpoint.\n2. Offer coupon code 'FORWARD10' for delivery delays."
                      },
                      {
                        title: "🌸 Dialogue Tone",
                        details: "1. Match dialect and sound extremely polite in transliterated Hinglish text.\n2. Never code-dump."
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const currentVal = settings?.aiPolicyInstructions || '';
                          const newVal = currentVal.trim() 
                            ? `${currentVal}\n\n${preset.details}`
                            : preset.details;
                          setSettings(prev => ({ ...prev, aiPolicyInstructions: newVal }));
                        }}
                        className="bg-[#12141c]/45 hover:bg-[#12141c] border border-white/[0.03] hover:border-orange-500/20 rounded-xl p-2 text-center transition-all active:scale-95 cursor-pointer"
                      >
                        <span className="font-semibold text-gray-300 block text-[9.5px] leading-tight text-center w-full">{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: Structured Brand Grounding Knowledge */}
              <div className="space-y-4 bg-black/15 p-5 rounded-2xl border border-white/[0.03]">
                <div className="border-b border-white/[0.04] pb-2">
                  <span className="text-xs font-bold text-orange-400 font-mono uppercase tracking-wider block">
                    📄 Grounding Knowledge Base Grid
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                    Facts and values compiled dynamically as part of the AI prompt grounding framework.
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                      1. Core Products & Business Target Profile (Required)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={settings?.kbBusiness || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, kbBusiness: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                      placeholder="Specify your core items & services..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                      2. Refund, Return & Order Cancellation Rules (Required)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={settings?.kbReturns || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, kbReturns: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                      placeholder="Specify refund boundaries / period..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                      3. Logistics Speed, Deliveries & SLAs (Required)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={settings?.kbShipping || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, kbShipping: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                      placeholder="e.g. Standard deliveries take 3-5 working days..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">
                      4. Human Operator Escalation Thresholds (Required)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={settings?.kbEscalation || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, kbEscalation: e.target.value }))}
                      className="w-full bg-[#12141c] border border-white/[0.05] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                      placeholder="e.g. angry remarks, broken products..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save submit bar */}
            <div className="flex justify-between items-center border-t border-white/[0.04] pt-4">
              <span className="text-[10px] text-gray-500 font-mono">
                * Training results are persistently cached into Firestore dynamically.
              </span>
              <button
                type="submit"
                disabled={settingsSaving}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-[#f2ede4] font-bold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
              >
                {settingsSaving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Grounding Backend System...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save & Retrain Global Brand</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
