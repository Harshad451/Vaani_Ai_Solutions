import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle2, Lock, X, RefreshCw, Check, Zap, Sparkles, Sliders, Shield } from 'lucide-react';

interface SubscriptionTabProps {
  settings: any;
  fetchSettings: () => Promise<void>;
  customFetch: (url: RequestInfo | URL, options?: RequestInit) => Promise<Response>;
  uiLang: 'en' | 'hi';
  subscriptionTier: 'PRO' | 'ENTERPRISE';
  setSubscriptionTier: (tier: 'PRO' | 'ENTERPRISE') => void;
}

export function SubscriptionTab({
  settings,
  fetchSettings,
  customFetch,
  uiLang,
  subscriptionTier,
  setSubscriptionTier
}: SubscriptionTabProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<'PRO' | 'ENTERPRISE' | null>(null);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
  const [payingCardHolder, setPayingCardHolder] = useState<string>('');
  const [payingCardNumber, setPayingCardNumber] = useState<string>('');
  const [payingCardExpiry, setPayingCardExpiry] = useState<string>('');
  const [payingCardCvc, setPayingCardCvc] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isSubscribed = !!settings?.isSubscribed;
  const currentTier = settings?.subscriptionTier || subscriptionTier;
  const currentPlan = settings?.subscriptionPlan || 'monthly';
  const daysLeft = settings?.subscriptionDaysLeft !== undefined ? settings.subscriptionDaysLeft : 0;
  const expiryDateString = settings?.subscriptionExpiresAt 
    ? new Date(settings.subscriptionExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <motion.div
      key="subscription_tab"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#06070a] text-[#f2ede4] relative"
    >
      {/* Background Visual Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-45" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.05] pb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-200 tracking-tight flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} />
              <span>{uiLang === 'en' ? 'SaaS Subscription & billing hub' : 'SaaS सब्सक्रिप्शन और बिलिंग केंद्र'}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {uiLang === 'en' 
                ? 'Check system license states, dynamic expiry meters, and upgrade company capacity instantly.'
                : 'सिस्टम लाइसेंस का स्टेटस देखें, डायनेमिक एक्सपायरी मीटर ट्रैक करें, और कंपनी की सीमा तुरंत बढ़ाएं।'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono select-none px-2.5 py-1 rounded-full border font-bold uppercase ${
              isSubscribed 
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                : 'border-rose-500/20 bg-rose-500/5 text-rose-450'
            }`}>
              {uiLang === 'en' 
                ? `Current Status: ${isSubscribed ? 'ACTIVE' : 'INACTIVE (LOCKED)'}`
                : `वर्तमान स्टेटस: ${isSubscribed ? 'सक्रिय (ACTIVE)' : 'निष्क्रिय (LOCKED)'}`}
            </span>
          </div>
        </div>

        {/* Dynamic Summary Card */}
        <div className="bg-gradient-to-br from-white/[0.02] to-transparent p-6 rounded-2xl border border-white/[0.05] flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
          
          <div className="space-y-4 relative z-10 flex-1 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {uiLang === 'en' ? 'Tethered business license' : 'संबद्ध व्यापार लाइसेंस'}
              </span>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                {!isSubscribed 
                  ? (uiLang === 'en' ? 'No Active Plan' : 'कोई सक्रिय प्लान नहीं है')
                  : currentTier === 'ENTERPRISE' 
                    ? (uiLang === 'en' ? 'Vernacular Enterprise Scale' : 'वर्नैक्युलर एंटरप्राइज स्केल')
                    : (uiLang === 'en' ? 'Professional Growth Plan' : 'प्रोफेशनल ग्रोथ प्लान')
                }
                
                {isSubscribed && (
                  <span className="text-xs font-semibold text-orange-400 font-mono">
                    {currentTier === 'ENTERPRISE' 
                      ? (currentPlan === 'yearly' ? '$199/mo' : '$249/mo') 
                      : (currentPlan === 'yearly' ? '$71/mo' : '$89/mo')}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {isSubscribed 
                  ? (uiLang === 'en' 
                    ? `Registered to ${settings?.companyName || 'VaaniAI'} corporate workbench.` 
                    : `${settings?.companyName || 'VaaniAI'} कारपोरेट वर्कबेंच के साथ पंजीकृत है।`)
                  : (uiLang === 'en'
                    ? 'Purchase a license tier below to unlock full-stack translations and the live playground.'
                    : 'फुल-स्टैक अनुवाद और लाइव प्लेग्राउंड को इस्तेमाल करने के लिए नीचे से एक प्लान चुनें।')
                }
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-2 font-mono">
              <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg">
                <div className="text-[10px] text-gray-500">
                  {uiLang === 'en' ? 'DAYS REMAINING' : 'शेष दिन'}
                </div>
                <div className={`text-sm font-bold mt-1 ${isSubscribed ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {isSubscribed ? `${daysLeft} ${uiLang === 'en' ? 'Days Left' : 'दिन बाकी'}` : `0 ${uiLang === 'en' ? 'Days Left' : 'दिन बाकी'}`}
                </div>
              </div>
              
              <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg">
                <div className="text-[10px] text-gray-500">
                  {uiLang === 'en' ? 'EXPIRATION TIMELINE' : 'समाप्ति तारीख'}
                </div>
                <div className="text-xs text-gray-200 font-semibold mt-1">
                  {isSubscribed ? expiryDateString : 'N/A'}
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg">
                <div className="text-[10px] text-gray-500">
                  {uiLang === 'en' ? 'BILLING CONFIG' : 'बिलिंग व्यवस्था'}
                </div>
                <div className="text-xs text-orange-400 font-bold mt-1 uppercase">
                  {isSubscribed 
                    ? (currentPlan === 'yearly' ? (uiLang === 'en' ? 'Annually (Save 20%)' : 'वार्षिक (बचत २०%)') : (uiLang === 'en' ? 'Monthly' : 'मासिक')) 
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Limit Bars Card */}
          <div className="w-full md:w-80 bg-white/[0.01] border border-white/[0.04] p-5 rounded-xl space-y-4 flex flex-col justify-center">
            <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              {uiLang === 'en' ? 'Gated Resource Estimators' : 'संसाधन अनुमान मीटर'}
            </h3>
            
            <div className="space-y-3 font-mono text-[10px]">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{uiLang === 'en' ? 'API Grounding Tasks' : 'API ग्राउंडिंग क्षमता'}</span>
                  <span>{isSubscribed ? (currentTier === 'ENTERPRISE' ? '12,481 / 500,000' : '4,281 / 50,000') : '0 / Locked'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: isSubscribed ? (currentTier === 'ENTERPRISE' ? '2.5%' : '8.5%') : '0%' }} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{uiLang === 'en' ? 'Registered Agents' : 'पंजीकृत एजेंट सूची'}</span>
                  <span>{isSubscribed ? (currentTier === 'ENTERPRISE' ? '4 / 25 seats' : '2 / 5 seats') : '0 / Locked'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: isSubscribed ? (currentTier === 'ENTERPRISE' ? '16%' : '40%') : '0%' }} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>{uiLang === 'en' ? 'Grounding Bases' : 'ग्राउंडिंग ज्ञान आधार'}</span>
                  <span>{isSubscribed ? (currentTier === 'ENTERPRISE' ? '8 / 40 bases' : '4 / 10 bases') : '0 / Locked'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: isSubscribed ? (currentTier === 'ENTERPRISE' ? '20%' : '40%') : '0%' }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Interactive Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest pl-1">
            {uiLang === 'en' ? 'Select Workspace License Plan' : 'कार्यक्षेत्र लाइसेंस प्लान चुनें'}
          </h3>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl self-end">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold font-sans rounded-lg transition-all cursor-pointer ${
                billingInterval === 'monthly' 
                  ? 'bg-orange-500 text-white shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {uiLang === 'en' ? 'Billed Monthly' : 'मासिक बिलिंग'}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-3 py-1.5 text-xs font-semibold font-sans rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                billingInterval === 'yearly' 
                  ? 'bg-orange-500 text-white shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{uiLang === 'en' ? 'Billed Annually' : 'वार्षिक बिलिंग'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 shrink-0 font-sans">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PRO PLAN */}
          <div className={`relative bg-[#0c0d12] rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-6 overflow-hidden ${
            isSubscribed && currentTier === 'PRO' 
              ? 'border-orange-500 bg-orange-500/[0.01] shadow-[0_0_30px_rgba(249,115,22,0.05)]' 
              : 'border-white/[0.04] hover:border-white/[0.1]'
          }`}>
            {isSubscribed && currentTier === 'PRO' && (
              <span className="absolute top-3 right-3 text-[9px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-semibold">
                {uiLang === 'en' ? 'ACTIVE' : 'सक्रिय'}
              </span>
            )}
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  {uiLang === 'en' ? 'GROWTH DESK LIMITATION' : 'ग्रोथ डेस्क सीमा'}
                </span>
                <h4 className="text-lg font-bold text-gray-200 mt-1 font-sans">Professional Growth Plan</h4>
              </div>

              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="text-3xl font-bold text-white font-mono">
                  {billingInterval === 'yearly' ? '$71' : '$89'}
                </span>
                <span className="text-xs text-gray-500 block">
                  {billingInterval === 'yearly' ? '/ month (billed $850/yr)' : '/ per month billed monthly'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-gray-400 border-t border-white/[0.03] pt-4 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>Up to 50,000 monthly translation queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>5 registered active customer service desks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>10 structured knowledge grounding indexes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>Full WhatsApp webhook and Web SDK integration</span>
                </li>
              </ul>
            </div>

            {isSubscribed && currentTier === 'PRO' && currentPlan === billingInterval ? (
              <div className="text-center text-[10px] font-mono text-gray-500 bg-white/[0.02] border border-white/[0.04] py-2 px-3 rounded-xl select-none">
                {uiLang === 'en' ? 'Current active license plan configuration' : 'यह आपके सक्रिय लाइसेंस का प्लान है'}
              </div>
            ) : (
              <button
                onClick={() => {
                  setCheckoutPlan('PRO');
                  setPaymentDone(false);
                  setPaymentError(null);
                }}
                className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-orange-500 hover:text-white transition-all text-xs font-semibold text-gray-300 font-sans cursor-pointer shadow-md"
              >
                <Zap size={13} />
                <span>{uiLang === 'en' ? 'Select Pro Growth' : 'प्रो ग्रोथ चुनें'}</span>
              </button>
            )}
          </div>

          {/* ENTERPRISE PLAN */}
          <div className={`relative bg-[#0c0d12] rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-6 overflow-hidden ${
            isSubscribed && currentTier === 'ENTERPRISE' 
              ? 'border-orange-500 bg-orange-500/[0.01] shadow-[0_0_30px_rgba(249,115,22,0.05)]' 
              : 'border-white/[0.04] hover:border-white/[0.1]'
          }`}>
            {isSubscribed && currentTier === 'ENTERPRISE' && (
              <span className="absolute top-3 right-3 text-[9px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-semibold">
                {uiLang === 'en' ? 'ACTIVE' : 'सक्रिय'}
              </span>
            )}
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-orange-450 uppercase tracking-wider font-semibold">
                  {uiLang === 'en' ? 'HIGH TRANSACTION DEPLOYMENTS' : 'उच्च ट्रांजैक्शन क्षमता'}
                </span>
                <h4 className="text-lg font-bold text-gray-200 mt-1 font-sans">Vernacular Enterprise Scale</h4>
              </div>

              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="text-3xl font-bold text-white font-mono">
                  {billingInterval === 'yearly' ? '$199' : '$249'}
                </span>
                <span className="text-xs text-gray-500 block">
                  {billingInterval === 'yearly' ? '/ month (billed $2,388/yr)' : '/ per month billed monthly'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-gray-400 border-t border-white/[0.03] pt-4 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>Up to 500,000 monthly translation tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>25 registered active customer service seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>40 structured knowledge grounding indexes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                  <span>Bespoke 24/7 dedicated system uptime SLA support</span>
                </li>
              </ul>
            </div>

            {isSubscribed && currentTier === 'ENTERPRISE' && currentPlan === billingInterval ? (
              <div className="text-center text-[10px] font-mono text-gray-500 bg-white/[0.02] border border-white/[0.04] py-2 px-3 rounded-xl select-none">
                {uiLang === 'en' ? 'Current active license plan configuration' : 'यह आपके सक्रिय लाइसेंस का प्लान है'}
              </div>
            ) : (
              <button
                onClick={() => {
                  setCheckoutPlan('ENTERPRISE');
                  setPaymentDone(false);
                  setPaymentError(null);
                }}
                className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-650 transition text-xs font-semibold text-white font-sans cursor-pointer active:scale-98 shadow-lg shadow-orange-500/10"
              >
                <Sparkles size={13} />
                <span>{uiLang === 'en' ? 'Select Enterprise scale' : 'एंटरप्राइज स्केल चुनें'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal Payment Ingress */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessingPayment) setCheckoutPlan(null);
              }}
              className="fixed inset-0 bg-[#040508]/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-[#0f1016] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md relative z-10 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    <Lock size={14} className="text-orange-400" />
                    <span>{uiLang === 'en' ? 'SaaS Secure Checkout Payment' : 'SaaS सुरक्षित भुगतान गेटवे'}</span>
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-widest">
                    {uiLang === 'en' ? 'SSL SECURED GATEWAY INTEGRATION' : 'सुरक्षित भुगतान प्रणाली'}
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    if (!isProcessingPayment) setCheckoutPlan(null);
                  }}
                  disabled={isProcessingPayment}
                  className="p-1 rounded bg-white/[0.02] hover:bg-white/[0.08] text-gray-450 hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>

              {paymentError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/15 rounded-lg text-rose-450 text-xs text-left leading-relaxed font-sans">
                  {paymentError}
                </div>
              )}

              {!paymentDone ? (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsProcessingPayment(true);
                    setPaymentError(null);
                    try {
                      const res = await customFetch('/api/subscription/purchase', {
                        method: 'POST',
                        body: JSON.stringify({
                          tier: checkoutPlan,
                          plan: billingInterval,
                          cardHolder: payingCardHolder,
                          cardNumber: payingCardNumber
                        })
                      });
                      
                      if (res.ok) {
                        setSubscriptionTier(checkoutPlan!);
                        await fetchSettings();
                        setPaymentDone(true);
                      } else {
                        const errData = await res.json();
                        setPaymentError(errData.error || "Payment card authorization failed. Please try again.");
                      }
                    } catch (err: any) {
                      setPaymentError(err?.message || "Payment processor went offline. Please try again.");
                    } finally {
                      setIsProcessingPayment(false);
                    }
                  }}
                  className="space-y-4 font-sans"
                >
                  {/* Virtual Credit Card Graphics Component */}
                  <div className="relative bg-gradient-to-tr from-[#ea580c] to-[#d97706] p-5 rounded-xl text-white space-y-6 shadow-xl h-44 overflow-hidden border border-white/[0.1] flex flex-col justify-between">
                    <div className="absolute top-10 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-white/80">
                        {settings?.companyName || "VaaniAI"} WORKSPACE CARD
                      </span>
                      <CreditCard size={18} className="text-white opacity-90" />
                    </div>

                    <div className="space-y-1 relative z-10">
                      <div className="text-sm font-mono tracking-widest font-semibold text-white">
                        {payingCardNumber ? payingCardNumber : '••••  ••••  ••••  ••••'}
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-white/70">
                        <span>{payingCardHolder ? payingCardHolder.toUpperCase() : 'SURNAME NAME'}</span>
                        <span>{payingCardExpiry ? payingCardExpiry : 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-gray-500 uppercase tracking-wider block">
                        {uiLang === 'en' ? 'Cardholder Full Name' : 'कार्डधारक का नाम'}
                      </label>
                      <input 
                        type="text"
                        required
                        value={payingCardHolder}
                        onChange={(e) => setPayingCardHolder(e.target.value)}
                        placeholder="e.g. HARSHAD PHADTARE"
                        className="w-full h-9 px-3 text-xs rounded-lg border border-white/[0.04] bg-white/[0.02] text-[#f2ede4] placeholder-gray-650 focus:outline-none focus:border-orange-500 transition font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-gray-500 uppercase tracking-wider block">
                        {uiLang === 'en' ? 'Card Number' : 'कार्ड नंबर'}
                      </label>
                      <input 
                        type="text"
                        maxLength={19}
                        required
                        value={payingCardNumber}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\s?/g, '').replace(/\D/g, '');
                          let formatted = '';
                          for (let i = 0; i < raw.length; i++) {
                            if (i > 0 && i % 4 === 0) formatted += '  ';
                            formatted += raw[i];
                          }
                          setPayingCardNumber(formatted);
                        }}
                        placeholder="4821  ••••  ••••  ••••"
                        className="w-full h-9 px-3 text-xs rounded-lg border border-white/[0.04] bg-white/[0.02] text-[#f2ede4] placeholder-gray-650 focus:outline-none focus:border-orange-500 transition font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono text-gray-400 uppercase tracking-wider block">
                          {uiLang === 'en' ? 'Expiration' : 'अंतिम तिथि'}
                        </label>
                        <input 
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={payingCardExpiry}
                          onChange={(e) => {
                            let raw = e.target.value.replace(/\//g, '').replace(/\D/g, '');
                            if (raw.length > 2) {
                              setPayingCardExpiry(raw.slice(0, 2) + '/' + raw.slice(2, 4));
                            } else {
                              setPayingCardExpiry(raw);
                            }
                          }}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-white/[0.04] bg-white/[0.02] text-[#f2ede4] placeholder-gray-655 focus:outline-none focus:border-orange-500 transition font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono text-gray-400 uppercase tracking-wider block">CVC</label>
                        <input 
                          type="password"
                          required
                          maxLength={3}
                          placeholder="•••"
                          className="w-full h-9 px-3 text-xs rounded-lg border border-white/[0.04] bg-white/[0.02] text-[#f2ede4] placeholder-gray-655 focus:outline-none focus:border-orange-500 transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-lg active:scale-98 cursor-pointer select-none"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>3D Secure Ingress Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={13} />
                        <span>
                          {uiLang === 'en' 
                            ? `Authorize $${checkoutPlan === 'ENTERPRISE' ? (billingInterval === 'yearly' ? '199/mo' : '249/mo') : (billingInterval === 'yearly' ? '71/mo' : '89/mo')} Charge`
                            : `भुगतान प्रमाणित करें`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-5 font-sans">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto h-12 w-12 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-bounce"
                  >
                    <Check size={24} />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {uiLang === 'en' ? 'License Charge Settled' : 'सब्सक्रिप्शन भुगतान सफल'}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {uiLang === 'en' 
                        ? `Thank you, ${payingCardHolder || 'Partner'}! Your business is successfully upgraded to ${checkoutPlan} status. All workbench capabilities have been unlocked.` 
                        : `धन्यवाद, ${payingCardHolder || 'साझीदार'}! आपका व्यवसाय सफलतापूर्वक ${checkoutPlan} स्टेटस में अपग्रेड हो गया है। सभी सेवाएँ अनलॉक हो चुकी हैं।`}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutPlan(null);
                      setPaymentDone(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition text-xs font-semibold text-gray-200 border border-white/[0.05] cursor-pointer"
                  >
                    {uiLang === 'en' ? 'Exit Hub' : 'बाहर जाएं'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
