import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  ThumbsUp, 
  Star, 
  X, 
  Smile, 
  ChevronRight,
  Bot,
  ChevronDown,
  Plus
} from 'lucide-react';
import { countryPrefixes, getCountryFromPhone } from '../utils/phoneUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Message } from '../types';

interface CustomerPortalProps {
  onBack: () => void;
  tickets?: Ticket[];
  onTicketsChange?: React.Dispatch<React.SetStateAction<Ticket[]>>;
  settings: any;
  isWidget?: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onBack,
  tickets: ticketsProp = [],
  onTicketsChange: onTicketsChangeProp,
  settings,
  isWidget = false
}) => {
  const tickets = Array.isArray(ticketsProp) ? ticketsProp : [];
  const onTicketsChange = onTicketsChangeProp || (() => {});
  const [step, setStep] = useState<'config' | 'chat'>('config');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');

  const getFullPhone = () => {
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+') || cleaned.startsWith('00')) return cleaned;
    return selectedCountryCode + cleaned;
  };
  
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  
  // Chat messaging
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Customer Rating & Comments
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const companyName = (settings?.companyName && settings.companyName !== "XYZ Corp") ? settings.companyName : "Support Desk";

  // Find active ticket if any matching activeTicketId
  const activeTicket = tickets.find(t => t.id === activeTicketId);

  // Check if AI requested document or invoice (working identical to the workbench platform)
  const aiAskedForDocuments = React.useMemo(() => {
    if (!activeTicket || !activeTicket.messages) return false;
    const aiMessages = activeTicket.messages.filter(m => m.sender === 'AI');
    if (aiMessages.length === 0) return false;
    const lastAiMsg = aiMessages[aiMessages.length - 1].content.toLowerCase();
    const keywords = [
      'invoice', 'photo', 'document', 'receipt', 'bill', 'proof', 'copy', 'pic', 'screenshot', 'attachment', 'upload', 'image', 'media',
      'इन्वॉइस', 'बिल', 'रसीद', 'फोटो', 'प्रूफ', 'स्क्रीनशॉट', 'दस्तावेज़', 'अपलोड', 'कॉपी', 'पिक्चर'
    ];
    return keywords.some(k => lastAiMsg.includes(k));
  }, [activeTicket]);

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Poll for ticket updates to fetch live replies from agents/operators
  useEffect(() => {
    if (step !== 'chat' || !activeTicketId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const ticketsList: Ticket[] = await res.json();
          onTicketsChange(ticketsList);
          
          // If the ticket was resolved on the server side, automatically prompt the rating survey
          const currentTick = ticketsList.find(t => t.id === activeTicketId);
          if (currentTick && currentTick.status === 'RESOLVED' && !showRating && !ratingSuccess) {
            setShowRating(true);
          }
        }
      } catch (err) {
        console.error("Failed to update ticket messages:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, activeTicketId, onTicketsChange, showRating, ratingSuccess]);

  // Auto scroll to bottom trigger has been removed to respect user request and keep manual scroll control.

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[CustomerPortal] handleStartChat triggered. CustomerName:", customerName, "PhoneNumber:", phoneNumber);
    if (!customerName.trim() || !phoneNumber.trim()) {
      setErrorMsg("Please fill in both name and phone number to begin.");
      return;
    }

    const fullPhone = getFullPhone();
    console.log("[CustomerPortal] Full, formatted phone number:", fullPhone);
    if (fullPhone.replace(/[^0-9]/g, '').length < 8) {
      setErrorMsg("Please enter a valid phone number (minimum 8 characters).");
      return;
    }

    setErrorMsg(null);
    setIsSending(true);

    try {
      // Find if there is an existing unresolved ticket for this customer
      console.log("[CustomerPortal] Checking local tickets for matches. Count:", tickets.length);
      const existingTicket = tickets.find(
        t => t.phoneNumber === fullPhone && t.status !== 'RESOLVED'
      );

      if (existingTicket) {
        console.log("[CustomerPortal] Existing active ticket spotted. Resuming thread ID:", existingTicket.id);
        setActiveTicketId(existingTicket.id);
        setStep('chat');
        setIsSending(false);
        return;
      }

      console.log("[CustomerPortal] No active ticket found locally. Making POST request to /api/tickets for company:", companyName);
      // Create a new support session with a friendly initial greetings request
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName,
          phoneNumber: fullPhone,
          message: "Hello! I would like to chat with support.",
          channel: 'WEB',
          companyName: companyName
        })
      });

      console.log("[CustomerPortal] Received POST response. status:", response.status, "ok:", response.ok);
      if (response.ok) {
        const data: Ticket = await response.json();
        console.log("[CustomerPortal] Successful ticket creation. ID:", data.id, data);
        setActiveTicketId(data.id);
        // Sync into global state
        onTicketsChange(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          if (safePrev.some(t => t.id === data.id)) {
            return safePrev.map(t => t.id === data.id ? data : t);
          }
          return [data, ...safePrev];
        });
        setStep('chat');
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.error("[CustomerPortal] POST ticket request failed on server:", errJson);
        setErrorMsg(errJson.error || `Failed to establish support connection (Server returned code ${response.status}).`);
      }
    } catch (err: any) {
      console.error("[CustomerPortal] Error creating ticket:", err);
      setErrorMsg(`Connection failure. Make sure development server is online. Detail: ${err?.message || String(err)}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText !== undefined ? customText : messageText;
    if (!textToSend.trim() || !activeTicketId) return;

    if (customText === undefined) {
      setMessageText('');
    }
    setIsSending(true);

    try {
      const response = await fetch(`/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: activeTicket?.customerName || customerName,
          phoneNumber: activeTicket?.phoneNumber || getFullPhone(),
          message: textToSend,
          channel: 'WEB'
        })
      });

      if (response.ok) {
        const data: Ticket = await response.json();
        onTicketsChange(prev => prev.map(t => t.id === activeTicketId ? data : t));
        
        // If ticket got resolved, trigger rating flow
        if (data.status === 'RESOLVED' && !showRating && !ratingSuccess) {
          setShowRating(true);
        }
      } else {
        console.error("Message dispatch rejected.");
      }
    } catch (err) {
      console.error("Failed to post message to backend:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Submit feedback survey rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    if (!activeTicketId) return;

    setSubmittingRating(true);
    try {
      const response = await fetch(`/api/tickets/${activeTicketId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          ratingFeedback: feedbackText
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ticket) {
          onTicketsChange(prev => prev.map(t => t.id === activeTicketId ? data.ticket : t));
        }
        setRatingSuccess(true);
        setTimeout(() => {
          setShowRating(false);
        }, 2200);
      }
    } catch (err) {
      console.error("Error submitting satisfaction survey:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div id="customer-portal-root" className="flex-1 flex flex-col h-full text-gray-200 overflow-hidden relative">
      
      {/* Background Ambience Grid */}
      {!isWidget && (
        <div className="absolute inset-0 bg-[#07080c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/15 via-[#08090d] to-[#050608] pointer-events-none" />
      )}
      
      {/* Glowing atmospheric elements (disabled for widgets to speed up and keep layout neat) */}
      {!isWidget && (
        <>
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-20 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        </>
      )}

      {/* Header Panel */}
      <header id="customer-portal-header" className={`relative backdrop-blur-md bg-white/[0.01] border-b border-white/[0.04] flex items-center justify-between z-10 shrink-0 ${isWidget ? 'px-4.5 py-2.5' : 'px-6 py-4'}`}>
        <div className="flex items-center gap-2.5">
          {!isWidget && onBack && (
            <button
              id="portal-back-btn"
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.05] rounded-xl text-gray-400 hover:text-white transition cursor-pointer select-none"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase font-bold block">
              Customer Support Center
            </span>
            <h2 className="text-xs font-extrabold tracking-tight font-mono text-gray-100 flex items-center gap-1.5 mt-0.5">
              <span>{companyName}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            </h2>
          </div>
        </div>

        {step === 'chat' && activeTicket && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 rounded-lg text-gray-400 flex items-center gap-1">
              <span>ID: {activeTicket.id.replace('ticket_', '')}</span>
            </span>
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md uppercase ${
              activeTicket.status === 'RESOLVED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
              activeTicket.status === 'ESCALATED' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
              'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}>
              {activeTicket.status.replace('_PENDING', '')}
            </span>
          </div>
        )}
      </header>

      {/* Main Core View Area */}
      <main id="customer-portal-main" className="flex-1 overflow-hidden relative flex flex-col items-center justify-center py-6 px-4 z-10">
        
        <AnimatePresence mode="wait">
          {step === 'config' ? (
            <motion.div
              key="portal-setup-pane"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md bg-[#0a0c10]/90 border border-white/[0.04] shadow-2xl rounded-2xl p-7 flex flex-col gap-6 backdrop-blur-xl relative"
            >
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-3.5">
                  <Bot size={22} className="animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-gray-100 font-mono tracking-wide">
                  Connect to {companyName} Support
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans px-3">
                  Connect instantly with our automated chatbot. Type in Hindi, Hinglish, or English. We will answer your tracking and return queries immediately.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleStartChat} className="space-y-4">
                <div>
                  <label htmlFor="cust-name-input" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 font-bold">
                    Full Name
                  </label>
                  <input
                    id="cust-name-input"
                    type="text"
                    required
                    disabled={isSending}
                    placeholder="Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs placeholder:text-gray-600 bg-white/[0.02] border border-white/[0.05] focus:border-orange-500/30 font-sans outline-none px-4 py-3 rounded-xl focus:bg-white/[0.03] transition duration-155"
                  />
                </div>

                <div>
                  <label htmlFor="cust-phone-input" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 font-bold">
                    WhatsApp or Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative shrink-0 select-none">
                      <select
                        id="cust-country-select"
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="appearance-none bg-white/[0.02] border border-white/[0.05] focus:border-orange-500/30 font-sans outline-none pl-3.5 pr-8 py-3 rounded-xl text-xs text-gray-300 focus:bg-white/[0.03] transition duration-155 cursor-pointer max-w-[120px]"
                      >
                        {countryPrefixes.map((c) => (
                          <option key={c.iso} value={c.code} className="bg-[#0a0c10] text-gray-200 text-xs">
                            {c.flag} {c.code} ({c.iso})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
                        <ChevronDown size={11} />
                      </div>
                    </div>
                    
                    <input
                      id="cust-phone-input"
                      type="tel"
                      required
                      disabled={isSending}
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 text-xs placeholder:text-gray-600 bg-white/[0.02] border border-white/[0.05] focus:border-orange-500/30 font-mono outline-none px-4 py-3 rounded-xl focus:bg-white/[0.03] transition duration-155"
                    />
                  </div>

                  {/* Dynamic country detection verification feedback helper */}
                  {(() => {
                    const country = getCountryFromPhone(phoneNumber.startsWith('+') || phoneNumber.startsWith('00') ? phoneNumber : selectedCountryCode + phoneNumber);
                    if (!country) return null;
                    return (
                      <p className="text-[10px] text-orange-400 font-mono mt-1.5 flex items-center gap-1 px-1">
                        <span>Current Region:</span>
                        <span>{country.flag}</span>
                        <span className="font-bold underline decoration-orange-500/35">{country.name}</span>
                        <span className="text-gray-500 text-[9px]">({country.code})</span>
                      </p>
                    );
                  })()}
                </div>

                <button
                  id="portal-start-chat-btn"
                  type="submit"
                  disabled={isSending}
                  className="w-full select-none cursor-pointer text-xs font-bold uppercase font-mono py-3 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white shadow-lg transition duration-155"
                >
                  {isSending ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>Enter Chat Workspace</span>
                      <ChevronRight size={13} />
                    </>
                  )}
                </button>
              </form>

            </motion.div>
          ) : (
            <motion.div
              key="portal-chat-pane"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-4xl h-full flex flex-col bg-[#090b0e]/95 border border-white/[0.04] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl relative"
            >
              {/* Chat Session Status Indicator Bar */}
              <div className="bg-white/[0.01] px-5 py-3 border-b border-white/[0.03] flex items-center justify-between text-xs font-mono select-none shrink-0 text-gray-400 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-gray-300">Live Agent Desk Synchronized</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span>Client Session: <strong className="text-gray-200">{customerName}</strong></span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-300">{activeTicket?.phoneNumber || getFullPhone()}</span>
                  {(() => {
                    const country = getCountryFromPhone(activeTicket?.phoneNumber || getFullPhone());
                    if (!country) return null;
                    return (
                      <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/15 rounded px-2 py-0.5 text-[10px] text-orange-400 font-sans" title={country.name}>
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Messages viewport */}
              <div id="portal-chat-messages" className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 flex flex-col bg-[#050608]/40">
                {activeTicket && activeTicket.messages && activeTicket.messages.length > 0 ? (
                  activeTicket.messages
                    .filter(m => m.sender !== 'SYSTEM') // hide system auto-closure lines to keep UI pure
                    .map((msg) => {
                      const isCustomer = msg.sender === 'CUSTOMER';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] ${isCustomer ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          <div className={`h-8.5 w-8.5 rounded-full shrink-0 flex items-center justify-center text-xs shadow-inner select-none ${
                            isCustomer 
                              ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' 
                              : 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                          }`}>
                            {isCustomer ? <User size={13} /> : <Bot size={13} />}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-medium text-gray-500 block px-1">
                              {isCustomer ? customerName : (msg.sender === 'AI' ? 'Automated Assistant' : 'Support Specialist')}
                            </span>
                            <div className={`px-4.5 py-3 text-xs leading-relaxed shadow-lg ${
                              isCustomer 
                                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-none' 
                                : 'bg-white/[0.03] border border-white/[0.04] text-gray-200 rounded-2xl rounded-tl-none'
                            }`}>
                              {/* Simple paragraph formatting */}
                              <p className="whitespace-pre-line">{msg.content}</p>

                              {/* Interactive Inline Language Preference selection chips */}
                              {msg.intent === 'LANGUAGE_PREFERENCE' && activeTicket.awaitingLanguageSelection && (
                                <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-white/[0.05]">
                                  {["English", "Hindi", "Hinglish"].map((lang) => (
                                    <button
                                      key={lang}
                                      type="button"
                                      disabled={isSending}
                                      onClick={() => handleSendMessage(undefined, lang)}
                                      className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.1] text-amber-300 font-mono text-[10px] rounded-lg border border-white/[0.03] hover:border-amber-400/25 transition cursor-pointer select-none"
                                    >
                                      {lang}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10 select-none">
                    <MessageSquare size={36} className="text-gray-700 animate-bounce mb-3" />
                    <p className="text-xs text-gray-500 font-mono">No active messages in thread.</p>
                  </div>
                )}
                
                {/* Visual loading / typing indicators */}
                {isSending && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="h-8.5 w-8.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center text-xs shadow-inner">
                      <Bot size={13} className="animate-spin" />
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] px-4.5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Entry Input Form */}
              <div className="p-4 border-t border-white/[0.04] bg-[#08090d] select-none shrink-0 relative">
                {activeTicket && activeTicket.status === 'RESOLVED' ? (
                  <div className="w-full flex items-center justify-center p-3 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>This support session is complete. The ticket was auto-resolved.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    {aiAskedForDocuments && (
                      <div className="relative shrink-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className="p-3 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] text-orange-400 rounded-xl transition cursor-pointer select-none relative"
                          title="Attach requested file or receipt"
                        >
                          <Plus size={14} className="stroke-[2.5]" />
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        </button>

                        {/* Attachment popover menu */}
                        {showAttachmentMenu && (
                          <div className="absolute bottom-14 left-0 w-52 bg-[#0c0e14] border border-white/[0.08] shadow-2xl rounded-xl p-2 z-50 space-y-1 text-gray-200">
                            <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-400 border-b border-white/[0.04] pb-1 mb-1 px-1 text-left">
                              Select File to Attach
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage(undefined, "[Attached file: invoice_OD70415.pdf] Here is the requested document/image.");
                                setShowAttachmentMenu(false);
                              }}
                              className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                            >
                              <span>📄</span>
                              <span className="truncate">invoice_OD70415.pdf</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage(undefined, "[Attached file: items_damaged.jpg] Here is the requested document/image.");
                                setShowAttachmentMenu(false);
                              }}
                              className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                            >
                              <span>📸</span>
                              <span className="truncate">items_damaged.jpg</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendMessage(undefined, "[Attached file: payment_receipt_screenshot.png] Here is the requested document/image.");
                                setShowAttachmentMenu(false);
                              }}
                              className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                            >
                              <span>💳</span>
                              <span className="truncate flex-1">receipt_proof.png</span>
                            </button>
                            
                            <div className="border-t border-white/[0.04] pt-1.5 mt-1">
                              <label className="w-full py-1 px-2 bg-orange-400/10 hover:bg-orange-400/15 border border-orange-500/20 text-orange-400 font-bold rounded text-center cursor-pointer transition flex items-center justify-center gap-1 text-[10px]">
                                <Plus size={11} />
                                <span>Upload New File</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleSendMessage(undefined, `[Attached file: ${file.name}] Here is the requested document/image.`);
                                      setShowAttachmentMenu(false);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <input
                      id="customer-chat-input"
                      type="text"
                      disabled={isSending}
                      placeholder="Type your message in Hinglish / Hindi / English here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-white/[0.01] border border-white/[0.04] focus:border-orange-500/30 outline-none px-4.5 py-3 rounded-xl focus:bg-white/[0.03] text-xs font-sans placeholder:text-gray-600 transition"
                    />
                    <button
                      id="customer-send-btn"
                      type="submit"
                      disabled={isSending || !messageText.trim()}
                      className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:opacity-95 disabled:bg-none disabled:bg-white/[0.02] disabled:border disabled:border-white/[0.03] disabled:text-gray-600 transition cursor-pointer flex items-center justify-center shadow-lg"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>

              {/* Overlay: Gorgeous CSAT Rating Survey Modal */}
              <AnimatePresence>
                {showRating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#06070a]/92 backdrop-blur-md z-30 flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95 }}
                      className="w-full max-w-md bg-[#0a0c10] border border-white/[0.05] p-7.5 rounded-2xl shadow-2xl relative"
                    >
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => setShowRating(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 p-1 hover:bg-white/[0.03] rounded-lg transition"
                      >
                        <X size={15} />
                      </button>

                      <div className="text-center">
                        <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4.5">
                          <Smile size={20} className="animate-pulse" />
                        </div>
                        <h4 className="text-sm font-extrabold tracking-tight font-mono text-gray-100 uppercase">
                          How was your experience today?
                        </h4>
                        <p className="text-[11px] text-gray-400 font-sans mt-2.5">
                          Kindly leave a rating and share your valuable feedback. It helps us improve the vernacular operator desk capabilities.
                        </p>
                      </div>

                      {ratingSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono text-center flex flex-col items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={24} className="text-emerald-400" />
                          <span className="font-bold uppercase tracking-wider text-[10.5px]">Thank you for your feedback!</span>
                          <span className="text-gray-400 text-[10px]">Your rating has been successfully saved to the ticket logs.</span>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmitRating} className="mt-6.5 space-y-4">
                          {/* Stars group */}
                          <div className="flex items-center justify-center gap-2.5">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <button
                                key={starIdx}
                                type="button"
                                onMouseEnter={() => setHoveredRating(starIdx)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(starIdx)}
                                className="p-1 focus:outline-none focus:scale-110 active:scale-95 transition-all text-xl cursor-pointer"
                              >
                                <Star
                                  size={24}
                                  className={`transition-all duration-155 transform ${
                                    starIdx <= (hoveredRating || rating)
                                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-110"
                                      : "text-gray-700 hover:text-gray-500 scale-100"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>

                          {/* Extra Comment */}
                          <div>
                            <textarea
                              id="rating-feedback-area"
                              placeholder="Describe your satisfaction with the bot translation quality (optional)..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              rows={3}
                              className="w-full text-xs placeholder:text-gray-600 bg-white/[0.01] border border-white/[0.04] focus:border-amber-500/20 outline-none p-3.5 rounded-xl text-gray-200 transition"
                            />
                          </div>

                          <button
                            id="portal-survey-submit-btn"
                            type="submit"
                            disabled={submittingRating || rating === 0}
                            className="w-full text-xs font-bold uppercase font-mono py-2.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white disabled:bg-none disabled:bg-white/[0.02] disabled:text-gray-600 transition shadow-lg shrink-0 select-none cursor-pointer"
                          >
                            {submittingRating ? (
                              <div className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                            ) : (
                              <>
                                <span>Submit Feedback</span>
                                <ThumbsUp size={12} />
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};
