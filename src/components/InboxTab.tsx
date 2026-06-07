import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User, 
  Languages, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Mail, 
  Package, 
  CreditCard, 
  Truck, 
  Calendar, 
  Bot, 
  Sparkles, 
  Send, 
  Plus, 
  Star,
  RefreshCw 
} from 'lucide-react';
import { Ticket, Employee, Message } from '../types';
import { SLATimer } from './SLATimer';

interface InboxTabProps {
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'ALL' | 'AI_PENDING' | 'ESCALATED' | 'RESOLVED';
  setStatusFilter: (filter: 'ALL' | 'AI_PENDING' | 'ESCALATED' | 'RESOLVED') => void;
  assignmentFilter: 'ALL' | 'MINE' | 'UNASSIGNED';
  setAssignmentFilter: (filter: 'ALL' | 'MINE' | 'UNASSIGNED') => void;
  slaFilter: 'ALL' | 'BREACHED' | 'WARNING';
  setSlaFilter: (filter: 'ALL' | 'BREACHED' | 'WARNING') => void;
  sortingOrder: 'DATE_DESC' | 'SLA_URGENT' | 'DATE_ASC';
  setSortingOrder: (order: 'DATE_DESC' | 'SLA_URGENT' | 'DATE_ASC') => void;
  filteredTickets: Ticket[];
  activeTicket: Ticket | null;
  employee: Employee | null;
  showSimulator: boolean;
  setShowSimulator: (show: boolean) => void;
  setSimName: (name: string) => void;
  setSimPhone: (phone: string) => void;
  setSimMessage: (msg: string) => void;
  handleResolveTicket: (id: string, email: string) => void;
  handleReleaseTicket: (id: string) => void;
  handleClaimTicket: (id: string) => void;
  isOrderPanelExpanded: boolean;
  setIsOrderPanelExpanded: (expanded: boolean) => void;
  editCustEmail: string;
  setEditCustEmail: (email: string) => void;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  manualOrderIdInput: string;
  setManualOrderIdInput: (val: string) => void;
  handleLinkOrder: (ticketId: string, orderId: string) => void;
  handleDeclineEscalation: (id: string) => void;
  handleAcceptEscalation: (id: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handleRegenerateCopilot: () => void;
  isRegeneratingSuggestion: boolean;
  getSuggestedReplies: (ticket: Ticket) => { text: string; label: string; action: 'insert' | 'resolve' }[];
  setAgentReplyText: (text: string) => void;
  agentReplyText: string;
  handleSendAgentReply: (e: React.FormEvent) => void;
  uiLang: string;
  t: (key: string) => string;
  setEmailPreviewContent: (content: any) => void;
  setIsEmailPreviewOpen: (open: boolean) => void;
  tickets: Ticket[];
  settings: any;
  simChannel: 'WEB' | 'WHATSAPP';
  setSimChannel: (channel: 'WEB' | 'WHATSAPP') => void;
  simName: string;
  simPhone: string;
  simMessage: string;
  sendClickLanguage: (lang: string) => void;
  simEndRef: React.RefObject<HTMLDivElement | null>;
  isSimulatingMessage: boolean;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  hoveredRating: number;
  setHoveredRating: (rating: number) => void;
  ratingSubmitting: boolean;
  ratingFeedback: string;
  setRatingFeedback: (val: string) => void;
  handleRateTicket: (id: string, rating: number, feedback: string) => Promise<void>;
  aiAskedForDocuments: boolean;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (show: boolean) => void;
  handleSendAttachmentSimulator: (filename: string) => void;
  handleSendSimulationMessage: (e: React.FormEvent) => void;
  setRatingSubmitting: (submitting: boolean) => void;
}

export function InboxTab({
  selectedTicketId,
  setSelectedTicketId,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  assignmentFilter,
  setAssignmentFilter,
  slaFilter,
  setSlaFilter,
  sortingOrder,
  setSortingOrder,
  filteredTickets,
  activeTicket,
  employee,
  showSimulator,
  setShowSimulator,
  setSimName,
  setSimPhone,
  setSimMessage,
  handleResolveTicket,
  handleReleaseTicket,
  handleClaimTicket,
  isOrderPanelExpanded,
  setIsOrderPanelExpanded,
  editCustEmail,
  setEditCustEmail,
  setTickets,
  manualOrderIdInput,
  setManualOrderIdInput,
  handleLinkOrder,
  handleDeclineEscalation,
  handleAcceptEscalation,
  chatEndRef,
  handleRegenerateCopilot,
  isRegeneratingSuggestion,
  getSuggestedReplies,
  setAgentReplyText,
  agentReplyText,
  handleSendAgentReply,
  uiLang,
  t,
  setEmailPreviewContent,
  setIsEmailPreviewOpen,
  tickets,
  settings,
  simChannel,
  setSimChannel,
  simName,
  simPhone,
  simMessage,
  sendClickLanguage,
  simEndRef,
  isSimulatingMessage,
  selectedRating,
  setSelectedRating,
  hoveredRating,
  setHoveredRating,
  ratingSubmitting,
  ratingFeedback,
  setRatingFeedback,
  handleRateTicket,
  aiAskedForDocuments,
  showAttachmentMenu,
  setShowAttachmentMenu,
  handleSendAttachmentSimulator,
  handleSendSimulationMessage,
  setRatingSubmitting
}: InboxTabProps) {
  return (
    <motion.div
      key="inbox"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex overflow-hidden"
    >
      {/* Tickets Master List (List Panel) */}
      <div className="w-[330px] border-r border-white/[0.04] bg-[#090a0f] flex flex-col shrink-0">
        {/* List header search & filter panel */}
        <div className="p-4 space-y-3 bg-[#0c0d12]/50 border-b border-white/[0.04]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Tickets inbox</span>
            {selectedTicketId && (
              <button
                id="btn_clear_ticket_selection"
                onClick={() => {
                  setSelectedTicketId(null);
                  setSimName('New Customer');
                  setSimPhone('+9198' + Math.floor(10000000 + Math.random() * 90000000));
                }}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-mono transition focus:outline-none cursor-pointer"
              >
                Deselect [×]
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
            <input
              id="ticket_search_input"
              type="text"
              placeholder="Search ticket, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#12141c] border border-white/[0.05] rounded-md focus:outline-none focus:border-orange-500 text-gray-200 font-mono"
            />
          </div>
          
          {/* Status Filter tabs */}
          <div className="space-y-1.5">
            <div className="flex p-0.5 bg-white/[0.01] border border-white/[0.04] rounded-lg text-[10px] font-mono relative overflow-hidden">
              {(['ALL', 'AI_PENDING', 'ESCALATED', 'RESOLVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 py-1.5 rounded-md text-center transition-colors relative cursor-pointer select-none ${
                    statusFilter === f 
                      ? 'text-orange-400 font-semibold shadow-inner' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {statusFilter === f && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-x-0 inset-y-0.5 bg-orange-500/10 border border-orange-500/15 rounded-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">
                    {f === 'ALL' ? 'ALL' : f === 'AI_PENDING' ? 'AI' : f === 'ESCALATED' ? 'OP' : 'OK'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced assignment and SLA filtering */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="space-y-1 text-left">
              <label className="text-[9px] text-gray-500 uppercase block tracking-wide">Desk Filter</label>
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value as any)}
                className="w-full bg-[#12141c] border border-white/[0.05] rounded px-1.5 py-1 text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer h-7"
              >
                <option value="ALL">All Tasks</option>
                <option value="MINE">My Actions</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[9px] text-gray-500 uppercase block tracking-wide">SLA Timing</label>
              <select
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value as any)}
                className="w-full bg-[#12141c] border border-white/[0.05] rounded px-1.5 py-1 text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer h-7"
              >
                <option value="ALL">Any SLA</option>
                <option value="BREACHED">Breached</option>
                <option value="WARNING">Near Breach</option>
              </select>
            </div>
          </div>

          {/* Ticket sorting order */}
          <div className="space-y-1 text-[10px] font-mono text-left">
            <label className="text-[9px] text-gray-500 uppercase block tracking-wide">Sort Order</label>
            <select
              value={sortingOrder}
              onChange={(e) => setSortingOrder(e.target.value as any)}
              className="w-full bg-[#12141c] border border-white/[0.05] rounded px-1.5 h-7 text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer text-[10.5px]"
            >
              <option value="DATE_DESC">⏱ Recent Incoming Tickets</option>
              <option value="SLA_URGENT">⚠️ Urgently Expiring SLAs First</option>
              <option value="DATE_ASC">📅 Oldest Backlog First</option>
            </select>
          </div>
        </div>

        {/* Scrolling Tickets Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(t => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <motion.div
                    id={`ticket_card_${t.id}`}
                    key={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    whileHover={{ y: -2, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border relative text-left select-none ${
                      isSelected 
                        ? 'bg-gradient-to-r from-orange-500/[0.08] to-amber-500/[0.02] border-orange-500/40 shadow-lg shadow-orange-500/[0.02]' 
                        : 'bg-[#0c0d12]/40 border-white/[0.03] hover:bg-[#0c0d12]/80 hover:border-white/[0.07]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <h3 className="font-semibold text-xs text-gray-200 flex items-center gap-1.5 flex-1 min-w-0">
                        <User size={12} className={isSelected ? "text-orange-400" : "text-gray-400"} />
                        <span className="truncate">{t.customerName}</span>
                        {t.channel === 'WHATSAPP' ? (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold uppercase tracking-wider shrink-0" title="WhatsApp Channel">
                            WA
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono font-bold uppercase tracking-wider shrink-0" title="Web Chat Channel">
                            Web
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-450 font-mono mb-2.5">{t.phoneNumber}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Language Indicator */}
                      {t.detectedLanguage && (
                        <span className="text-[10px] px-2 py-0.5 bg-white/[0.03] text-orange-300 font-mono flex items-center gap-1 rounded border border-white/[0.03]">
                          <Languages size={10} />
                          {t.detectedLanguage.split(' ')[0]}
                        </span>
                      )}

                      {/* Sentiment Tag */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        t.sentiment === 'Angry' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : t.sentiment === 'Negative' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : t.sentiment === 'Positive' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {t.sentiment.toUpperCase()}
                      </span>

                      {/* SLA Countdown Timer */}
                      <SLATimer ticket={t} />

                      {/* Assignment status badge */}
                      {t.assignedToId && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          t.assignedToId === employee?.id
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/35'
                            : 'bg-white/[0.04] text-gray-500 border border-white/[0.04]'
                        }`}>
                          {t.assignedToId === employee?.id ? 'MY DESK' : 'CLAIMED'}
                        </span>
                      )}

                      {/* Status Tag */}
                      <span className={`ml-auto text-[9px] px-2 py-0.5 rounded font-mono ${
                        t.status === 'ESCALATED' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse' 
                          : t.status === 'RESOLVED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {t.status === 'AI_PENDING' ? 'AI CHAT' : t.status === 'ESCALATED' ? 'OVERRIDE' : 'RESOLVED'}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <AlertTriangle className="text-gray-600 mb-2 animate-pulse" size={24} />
                <span className="text-xs font-mono">No matching tickets found</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Conversation Chat Feed (Middle Panel) */}
      <div className="flex-1 bg-[#0b0c11] flex flex-col min-w-0 overflow-y-auto">
        {activeTicket ? (
          <>
            {/* Ticket Context Header */}
            <div className="p-4 bg-[#0c0d12]/80 border-b border-white/[0.04] flex items-center justify-between z-10 sticky top-0 backdrop-blur">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-gray-200">
                    {activeTicket.customerName}
                  </h2>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-[#12141d] rounded-full border border-white/[0.04] text-gray-505">
                    ID: {activeTicket.id}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap text-left">
                  <span>{activeTicket.phoneNumber}</span>
                  <span className="text-gray-600">•</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeTicket.channel === 'WHATSAPP' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {activeTicket.channel === 'WHATSAPP' ? 'WHATSAPP API' : 'WEB WIDGET'}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>Created: {new Date(activeTicket.createdAt).toLocaleTimeString()}</span>
                  <span className="text-gray-600">•</span>
                  <SLATimer ticket={activeTicket} />
                </div>
              </div>

              {/* Control Actions */}
              <div className="flex items-center gap-2.5">
                {/* Desktop client simulator toggle switch */}
                <button
                  id="btn_toggle_simulator"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 select-none cursor-pointer ${
                    showSimulator 
                      ? 'bg-[#181a24] border-orange-500/20 text-orange-400 hover:bg-[#1f2230]'
                      : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                  title={showSimulator ? "Hide interactive client simulator" : "Show interactive client simulator"}
                >
                  <Smartphone size={13} />
                  <span>{showSimulator ? 'Close Simulator' : 'Simulate Client'}</span>
                </button>

                <span className={`text-[11px] px-2.5 py-1 rounded font-mono border leading-none ${
                  activeTicket.status === 'ESCALATED' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
                    : activeTicket.status === 'RESOLVED' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                }`}>
                  {activeTicket.status === 'ESCALATED' 
                    ? 'Takeover Active' 
                    : activeTicket.status === 'RESOLVED' 
                      ? 'Resolved' 
                      : 'AI Active'}
                </span>

                {activeTicket.status !== 'RESOLVED' && (
                  <button
                    id="btn_resolve_ticket"
                    onClick={() => handleResolveTicket(activeTicket.id, editCustEmail)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer select-none"
                    title="Resolve Ticket: Marks this ticket as resolved and closes the customer session."
                  >
                    <CheckCircle2 size={13} /> {t('markSolved')}
                  </button>
                )}
              </div>
            </div>

            {/* Ticket Claim Assignment Strip */}
            <div className="px-6 py-2.5 bg-[#0d0e14] border-b border-white/[0.04] flex items-center justify-between text-[11px] font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 tracking-wider">ASSIGNMENT STATUS:</span>
                {activeTicket.assignedToId ? (
                  <span className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1.5 ${
                    activeTicket.assignedToId === employee?.id 
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-white/[0.03] text-gray-400 border border-white/[0.03]'
                  }`}>
                    <User size={11} className="shrink-0 text-orange-400" />
                    {activeTicket.assignedToId === employee?.id ? 'Claimed by you' : `Claimed by ${activeTicket.assignedToName}`}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded flex items-center gap-1.5 animate-pulse font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                    Unassigned Pool Ticket
                  </span>
                )}
              </div>

              {activeTicket.status !== 'RESOLVED' && (
                <div className="flex items-center gap-2">
                  {activeTicket.assignedToId === employee?.id ? (
                    <button
                      onClick={() => handleReleaseTicket(activeTicket.id)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[10px] font-bold uppercase transition focus:outline-none select-none cursor-pointer"
                      title="Release Ticket: Removes your assignment and returns this ticket to the shared team queue."
                    >
                      Release Ticket Queue
                    </button>
                  ) : !activeTicket.assignedToId ? (
                    <button
                      onClick={() => handleClaimTicket(activeTicket.id)}
                      className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded text-[10px] font-bold uppercase shadow-md transition focus:outline-none select-none cursor-pointer"
                      title="Claim Ticket: Assigns this support session to your personal agent desk."
                    >
                      Claim Ticket to My Desk
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaimTicket(activeTicket.id)}
                      className="px-2.5 py-1 bg-white/[0.02] hover:bg-white/[0.05] text-gray-400 border border-white/[0.05] rounded text-[10px] font-bold uppercase transition focus:outline-none select-none cursor-pointer"
                      title="Force Claim: Forcefully transfers assignment from the current agent."
                    >
                      Force Claim
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Linked Customer Order Details Advisor Card */}
            <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-br from-[#12141d]/90 to-[#0e0f15]/95 border border-white/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.3)] select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <Package size={14} className="shrink-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-gray-200 tracking-wider uppercase font-mono">
                        Customer Order Linkage
                      </h3>
                      {activeTicket.orderDetail ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                          Linked: {activeTicket.orderId}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                          No Linked Order
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                      {activeTicket.orderDetail 
                        ? `Automatically resolved active courier logs & payment transaction specs.`
                        : `Specify or ask customer for order reference to query item lists & payments.`}
                    </p>
                  </div>
                </div>
                <button
                  id="btn_toggle_order_panel"
                  onClick={() => setIsOrderPanelExpanded(!isOrderPanelExpanded)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition cursor-pointer"
                >
                  {isOrderPanelExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {isOrderPanelExpanded && (
                <div className="mt-4 pt-4 border-t border-white/[0.03] space-y-4">
                  {/* Customer Registered Email & Transmit Channel Configuration */}
                  <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-lg space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={12} className="text-orange-400" />
                        Customer Support Registered Email
                      </span>
                      <span className="text-[9px] text-gray-500 uppercase">Dispatch Target</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={editCustEmail}
                        onChange={(e) => setEditCustEmail(e.target.value)}
                        placeholder="customer@domain.com"
                        className="flex-1 bg-black/40 border border-white/[0.05] focus:border-orange-500/40 rounded px-2.5 py-1 text-xs text-gray-300 font-mono tracking-wider focus:outline-none"
                      />
                      {editCustEmail !== (activeTicket.customerEmail || (activeTicket.customerName.toLowerCase().replace(/\s+/g, '') + "@gmail.com")) && (
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('vaani_logged_token');
                              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                              if (token) {
                                headers['Authorization'] = `Bearer ${token}`;
                              }

                              const saveEmailRes = await fetch(`/api/tickets/${activeTicket.id}/email`, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({ customerEmail: editCustEmail })
                              });

                              const msgRes = await fetch(`/api/tickets/${activeTicket.id}/message`, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                  sender: 'SYSTEM',
                                  content: `⚙️ Customer registered notification email address set to: ${editCustEmail}`
                                })
                              });

                              if (saveEmailRes.ok || msgRes.ok) {
                                setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, customerEmail: editCustEmail } : t));
                              }
                            } catch (err) {
                              console.error("Failed saving email address adjustment:", err);
                            }
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 rounded text-white font-bold text-[10px] uppercase font-mono tracking-wide transition shrink-0 cursor-pointer"
                        >
                          Save Address
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 font-sans leading-normal">
                      This designated customer inbox is automatically triggered to receive a beautiful HTML transaction closure receipt immediately upon resolution.
                    </p>
                  </div>

                  {activeTicket.orderDetail ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                      {/* Order Summary Block */}
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[9px] font-mono font-semibold text-gray-500 block uppercase">Product Purchased</span>
                        <div className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg">
                          <span className="text-xs text-gray-200 font-medium block">
                            {activeTicket.orderDetail.itemName}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400 font-mono">
                            <span className="font-mono bg-[#141520] px-1.5 py-0.5 rounded text-gray-400 font-bold border border-white/[0.02]">
                              {activeTicket.orderDetail.id}
                            </span>
                            <span>for {activeTicket.orderDetail.customerName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Mode & Cost Info */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-semibold text-gray-500 block uppercase">Cost & Payment</span>
                        <div className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg flex flex-col justify-center h-[58px]">
                          <div className="flex items-center gap-1.5">
                            <CreditCard size={11} className="text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-400 font-bold font-mono">
                              ₹{activeTicket.orderDetail.cost.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate" title={activeTicket.orderDetail.paymentMode}>
                            {activeTicket.orderDetail.paymentMode}
                          </span>
                        </div>
                      </div>

                      {/* Shipment Status Block */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-semibold text-gray-500 block uppercase">Fulfillment Status</span>
                        <div className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg flex flex-col justify-center h-[58px]">
                          <span className={`text-[11px] font-semibold block ${
                            activeTicket.orderDetail.status.includes('Transit') || activeTicket.orderDetail.status.includes('Shipped')
                              ? 'text-orange-400'
                              : activeTicket.orderDetail.status.includes('Delivered')
                                ? 'text-green-400'
                                : 'text-red-400'
                          }`}>
                            {activeTicket.orderDetail.status}
                          </span>
                          {activeTicket.orderDetail.carrier && (
                            <span className="text-[9px] text-gray-400 mt-0.5 font-mono flex items-center gap-1">
                              <Truck size={10} className="shrink-0 text-gray-500" />
                              {activeTicket.orderDetail.carrier}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Logistics progress lane */}
                      <div className="md:col-span-4 p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <div className="flex items-center gap-1">
                            <Truck size={12} className="text-orange-400" />
                            <span>Dispatch Tracking Roadmap</span>
                          </div>
                          {activeTicket.orderDetail.estimatedDelivery && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 shrink-0">
                              <Calendar size={10} />
                              <span>Est. Arrival: {activeTicket.orderDetail.estimatedDelivery}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress bar visual */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                          {[
                            { label: "Received", isDone: true },
                            { label: "Shipped", isDone: activeTicket.orderDetail.status !== "Order Received" },
                            { label: "Transit Hub", isDone: activeTicket.orderDetail.status.includes("Transit") || activeTicket.orderDetail.status === "Delivered" || activeTicket.orderDetail.status === "Out for Delivery" },
                            { label: "Released / Delivered", isDone: activeTicket.orderDetail.status === "Delivered" }
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className={`h-1.5 rounded-full transition-all duration-300 ${step.isDone ? 'bg-orange-500' : 'bg-white/10'}`} />
                              <span className={`text-[9px] font-mono text-center truncate ${step.isDone ? 'text-gray-300' : 'text-gray-605'}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-gray-500 mb-2">
                        <Package size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-400">Could not extract clear order context</span>
                      <p className="text-[10px] text-gray-505 max-w-sm mt-1 leading-relaxed">
                        The customer hasn't provided their registered order ID in the active chat. You can wait for automatic AI recognition, or manually assign one below to review the purchase logs.
                      </p>
                      
                      {/* Manual link entry area */}
                      <div className="mt-3 flex items-center gap-2 max-w-xs w-full">
                        <input
                          type="text"
                          placeholder="Enter Order ID"
                          value={manualOrderIdInput}
                          onChange={(e) => setManualOrderIdInput(e.target.value)}
                          className="flex-1 bg-black/45 border border-white/[0.05] rounded px-2.5 py-1 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-orange-500 uppercase placeholder:text-gray-600 placeholder:normal-case font-bold"
                        />
                        <button
                          onClick={() => handleLinkOrder(activeTicket.id, manualOrderIdInput)}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 rounded text-amber-300 font-bold text-[10px] uppercase font-mono tracking-wide transition shrink-0 cursor-pointer"
                        >
                          Link
                        </button>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2.5 text-[10px] text-gray-500 font-mono">
                        <span>Sample Order IDs:</span>
                        {["OD-90210", "OD-70415", "OD-30912"].map(samp => (
                          <button
                            key={samp}
                            onClick={() => handleLinkOrder(activeTicket.id, samp)}
                            className="text-gray-400 hover:text-orange-400 hover:underline cursor-pointer font-semibold underline-offset-2"
                          >
                            {samp}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Escalation Requested Prompt Banner */}
            {activeTicket.humanRequested && activeTicket.status !== 'RESOLVED' && (
              <div className="mx-6 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(245,158,11,0.05)] text-left">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Customer Requested Human Assistant Support
                    </h4>
                    <p className="text-[11px] text-gray-450 mt-1 max-w-xl leading-relaxed">
                      The customer's message matches the escalation request pattern or human assistance keyword criteria. VaaniAI is currently keeping conversational assistance active in automated mode to maximize prompt auto-reconciliation.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn_decline_escalation"
                    onClick={() => handleDeclineEscalation(activeTicket.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition cursor-pointer"
                    title="Dismiss Alert: Rejects the manual escalation alert and allows the AI Copilot to continue auto-responding."
                  >
                    Dismiss / Let AI Respond
                  </button>
                  <button
                    id="btn_accept_escalation"
                    onClick={() => handleAcceptEscalation(activeTicket.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-[#0b0c11] rounded-lg transition cursor-pointer"
                    title="Connect Operator: Temporarily pauses automated AI answers, changing status to OVERRIDE to let you converse manually."
                  >
                    Connect Live Operator
                  </button>
                </div>
              </div>
            )}

            {/* Messages Thread list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
              {activeTicket.messages.map((m, idx) => {
                const isCustomer = m.sender === 'CUSTOMER';
                const isAI = m.sender === 'AI';
                const isAgent = m.sender === 'AGENT';
                const isSystem = m.sender === 'SYSTEM';

                return (
                  <motion.div
                    key={m.id || idx}
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 18,
                    }}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl p-4 border relative text-left ${
                      isCustomer 
                        ? 'bg-[#12141c] border-white/[0.04] text-gray-200 rounded-tl-none' 
                        : isAI 
                          ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20 text-orange-300 rounded-tr-none' 
                          : isAgent 
                            ? 'bg-gradient-to-l from-blue-500/10 to-transparent border-blue-500/20 text-blue-300 rounded-tr-none'
                            : 'bg-yellow-500/5 border-yellow-500/15 text-yellow-300 rounded-md text-center mx-auto text-xs px-4 py-1 font-mono'
                    }`}>
                      {/* Metadata badges for AI responses and customer details */}
                      <div className="flex items-center gap-2 mb-1.5 text-[9px] font-mono uppercase tracking-wider text-gray-500">
                        {isCustomer && <User size={9} />}
                        {isAI && <Sparkles size={9} className="text-orange-400 animate-pulse" />}
                        {isAgent && <Bot size={9} className="text-blue-400" />}
                        <span>{m.sender}</span>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>

                      {/* Telemetry indicators inside AI response blocks */}
                      {isAI && m.intent && (
                        <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center gap-3 text-[9px] font-mono text-gray-500">
                          <span>Intent: <strong className="text-gray-350 font-normal">{m.intent}</strong></span>
                          <span>Confidence: <strong className="text-orange-400 font-semibold">{Math.round((m.confidence || 0) * 100)}%</strong></span>
                          {m.detectedLanguage && (
                            <span>Language: <strong className="text-gray-350 font-normal">{m.detectedLanguage}</strong></span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-gray-550 mt-1 px-1.5 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* AI Copilot Suggestions Engine (Dynamic Match-Making) */}
            {activeTicket.status !== 'RESOLVED' && (
              <div className="mx-6 mb-2 p-3.5 bg-gradient-to-r from-orange-500/[0.04] to-amber-500/[0.01] border border-orange-500/20 rounded-xl shrink-0 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-orange-400 animate-pulse" />
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-widest font-mono">
                    {t('suggestedSolutionsTitle')}
                  </span>

                  <button
                    id="btn_regenerate_copilot"
                    type="button"
                    onClick={handleRegenerateCopilot}
                    disabled={isRegeneratingSuggestion}
                    className="p-1 rounded hover:bg-white/5 text-orange-400 transition-all flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer"
                    title="Regenerate dynamic context-aware suggestion via Google Gemini"
                  >
                    <RefreshCw size={11} className={`text-orange-400 ${isRegeneratingSuggestion ? 'animate-spin' : ''}`} />
                  </button>

                  <span className="text-[10px] text-gray-500 font-mono ml-auto">
                    {t('clickToInsert')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getSuggestedReplies(activeTicket).map((suggestion, sIdx) => {
                    const isResolve = suggestion.action === 'resolve';
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setAgentReplyText(suggestion.text);
                        }}
                        className={`text-left p-2.5 bg-[#0e0f15]/80 hover:bg-[#12141c] border rounded-lg transition duration-150 cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                          isResolve 
                            ? 'hover:border-emerald-500/20 border-white/[0.03]' 
                            : 'hover:border-orange-500/20 border-white/[0.03]'
                        }`}
                      >
                        <span className={`text-[10px] font-semibold font-mono block mb-1 ${
                          isResolve ? 'text-emerald-400' : 'text-orange-400'
                        }`}>
                          {suggestion.label}
                        </span>
                        <p className="text-[11px] text-gray-300 leading-relaxed italic group-hover:text-gray-100 transition line-clamp-2">
                          "{suggestion.text}"
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Agent Reply Form */}
            {activeTicket.status === 'RESOLVED' ? (
              <div className="p-4 bg-emerald-950/20 border-t border-emerald-500/25 flex flex-col gap-2.5 items-center justify-center sticky bottom-0 select-none z-10 backdrop-blur bg-[#0b0c11]">
                <div className="text-center text-xs text-emerald-400 font-mono flex items-center justify-center gap-2 font-semibold">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>This ticket has been marked resolved and closed. Further messages are locked.</span>
                </div>

                {activeTicket.rating && (
                  <div className="w-full max-w-sm p-3 bg-white/[0.02] rounded-xl border border-emerald-500/10 flex flex-col items-center gap-1.5 animate-fade-in shadow-lg">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400/80 uppercase">Customer Experience Feedback</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < activeTicket.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-650'}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-white font-mono">{activeTicket.rating}/5 Stars</span>
                    </div>
                    {activeTicket.ratingFeedback && (
                      <p className="text-[11px] text-gray-300 italic text-center font-sans tracking-wide max-w-full break-words">
                        "{activeTicket.ratingFeedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSendAgentReply}
                className="p-4 bg-[#0c0d12]/60 border-t border-white/[0.04] flex gap-2.5 items-center sticky bottom-0 z-10 backdrop-blur"
              >
                <div className="flex-1 relative">
                  <input
                    id="agent_chat_input"
                    type="text"
                    placeholder={
                      activeTicket.status === 'ESCALATED' 
                        ? (uiLang === 'en' ? "Type your live agent manual response..." : uiLang === 'hi' ? "अपना लाइव एजेंट मैनुअल उत्तर लिखें..." : uiLang === 'ta' ? "உங்கள் நேரடி முகவர் பதிலை தட்டச்சு செய்க..." : "మీ ప్రత్యక్ష ఏజెంట్ సమాధానాన్ని టైప్ చేయండి...")
                        : (uiLang === 'en' ? "Send a message to override the AI agent and takeover thread..." : uiLang === 'hi' ? "एआई एजेंट को बाईपास करके बात शुरू करने के लिए संदेश भेजें..." : uiLang === 'ta' ? "ஏஐ முகவரை புறக்கணித்து கட்டுப்பாட்டை எடுக்க செய்தி அனுப்பவும்..." : "AI ఏజెంట్‌ను ఓవర్‌రైడ్ చేయడానికి సందేశాన్ని పంపండి...")
                    }
                    value={agentReplyText}
                    onChange={(e) => setAgentReplyText(e.target.value)}
                    className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-gray-200 placeholder-gray-500 font-sans text-left"
                  />
                </div>
                <button
                  id="btn_send_agent_reply"
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition duration-155 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-[0.98] cursor-pointer shrink-0"
                  title="Send Response: Instantly transmits your typed response to the customer's active chat session."
                >
                  <span>{t('sendReply')}</span>
                  <Send size={13} />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-[#06070a]">
            {/* Atmospheric dynamic brand ring */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-orange-500/[0.02] border border-orange-500/[0.03] rounded-full filter blur-xl animate-pulse pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="max-w-xl w-full space-y-8 z-10 relative"
            >
              {/* Floating Icon Base CARD */}
              <div className="flex flex-col items-center select-none">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="p-5 rounded-3xl bg-[#0c0d12]/60 border border-white/[0.05] shadow-2xl shadow-orange-500/[0.03] text-gray-400 mb-5 relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                  <Sparkles size={36} className="text-orange-400 relative z-10" />
                </motion.div>
                
                <h2 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-400 font-sans">
                  VaaniAI Support Workbench
                </h2>
                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-8 leading-relaxed font-mono">
                  Vernacular Customer Experience Intelligence Engine
                </p>
              </div>

              {/* Telemetry Dashboard Grid */}
              <div className="grid grid-cols-3 gap-3.5 text-left select-none">
                <div className="p-3.5 bg-[#0e0f16]/60 rounded-xl border border-white/[0.03] hover:border-orange-500/10 transition-colors">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block mb-1">Incoming Queue</span>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xl font-bold font-mono text-gray-200">
                      {tickets.length}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">tickets</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0e0f16]/60 rounded-xl border border-white/[0.03] hover:border-orange-500/10 transition-colors">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 block mb-1">Human Overrides</span>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {tickets.filter(t => t.status === 'ESCALATED').length}
                    </span>
                    <span className="text-[9px] font-mono text-rose-500">claims</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0e0f16]/60 rounded-xl border border-white/[0.03] hover:border-orange-500/10 transition-colors">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 block mb-1">SLA Target Limit</span>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {settings?.slaMinutes || 10}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-500">mins</span>
                  </div>
                </div>
              </div>

              {/* Operations Info Block */}
              <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl text-xs space-y-2 leading-relaxed text-gray-400 max-w-lg mx-auto text-center font-mono select-none">
                <div className="text-[10px] font-bold tracking-widest text-[#da9d5a]/90 uppercase flex items-center justify-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                  <span>System Status: Desk Operator Online</span>
                </div>
                Select a customer from the left list to monitor conversations, review AI Copilot suggestions, and takeover whenever human intervention is needed.
              </div>

              {/* Primary Quick Start Action */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center gap-2 select-none cursor-pointer shadow-lg active:scale-95 ${
                    showSimulator 
                      ? 'bg-orange-500/15 border-orange-500/30 text-orange-400 shadow-orange-500/[0.02]'
                      : 'bg-[#12141d]/50 border-white/[0.06] hover:border-orange-500/25 text-gray-300 hover:text-white hover:bg-[#12141d]'
                  }`}
                >
                  <Smartphone size={13} className={showSimulator ? "animate-bounce" : ""} />
                  <span>{showSimulator ? 'Close Client Simulator' : 'Trigger Client Simulator'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Live Interactive Smartphone Simulator (Right Panel) */}
      {showSimulator && (
        <div className="w-[310px] bg-[#0c0d12]/50 border-l border-white/[0.04] p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
          <div>
            <div className="flex items-center gap-1.5 justify-center text-xs font-mono text-gray-400 mb-3 border-b border-white/[0.03] pb-3 text-center">
              <Smartphone size={13} className="text-orange-400" />
              <span>Interactive Client App Simulator</span>
            </div>

            {/* Simulation Channel Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#101118] rounded-xl border border-white/[0.03] mb-4">
              <button
                id="toggle-sim-channel-web"
                type="button"
                onClick={() => setSimChannel('WEB')}
                className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-mono transition-all font-bold cursor-pointer ${
                  simChannel === 'WEB'
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Web Widget
              </button>
              <button
                id="toggle-sim-channel-wa"
                type="button"
                onClick={() => setSimChannel('WHATSAPP')}
                className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-mono transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${
                  simChannel === 'WHATSAPP'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-gray-500 hover:text-emerald-400'
                }`}
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                WhatsApp API
              </button>
            </div>

            {/* Smartphone Mockup */}
            <div className={`border rounded-[24px] overflow-hidden flex flex-col h-[480px] relative shadow-2xl transition-all duration-350 ${
              simChannel === 'WHATSAPP' 
                ? 'border-emerald-500/15 bg-[#0b141a]' 
                : 'border-white/[0.06] bg-[#090a10]'
            }`}>
              {/* Notch status display */}
              <div className={`h-6 py-1 px-4 flex justify-between items-center text-[9px] font-mono select-none transition-colors border-b ${
                simChannel === 'WHATSAPP' 
                  ? 'bg-[#1f2c34] text-[#8696a0] border-white/[0.02]' 
                  : 'bg-[#12141c] text-gray-500 border-white/[0.03]'
              }`}>
                <span>{simChannel === 'WHATSAPP' ? 'Meta Cloud WhatsApp' : (settings?.companyName || 'NoshBerry Corp')}</span>
                <div className="w-12 h-3.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 mt-1" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span className={`${simChannel === 'WHATSAPP' ? 'bg-[#00a884]' : 'bg-green-500'} w-2.5 h-1.5 rounded-sm`} />
                </div>
              </div>

              {/* Header inside phone */}
              <div className={`p-3 border-b flex items-center gap-2 transition-all text-left ${
                simChannel === 'WHATSAPP' 
                  ? 'bg-[#1f2c34] border-white/[0.02]' 
                  : 'bg-[#12141c] border-white/[0.03]'
              }`}>
                {simChannel === 'WHATSAPP' ? (
                  <div className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0 self-center">
                    <span className="font-mono font-extrabold text-[9px] text-emerald-400 font-bold">WA</span>
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 shrink-0 self-center">
                    <span className="font-extrabold text-[10px] text-orange-400 font-bold">NB</span>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold text-gray-200">
                    {simChannel === 'WHATSAPP' ? `${settings?.companyName || 'NoshBerry'} WA-Biz` : `${settings?.companyName || 'NoshBerry'} Support`}
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${simChannel === 'WHATSAPP' ? 'bg-[#00a884]' : 'bg-green-400'}`} />
                    <span>{simChannel === 'WHATSAPP' ? 'Official Business Acc' : 'Vernacular Assist Active'}</span>
                  </div>
                </div>
              </div>

              {/* Chat screen of the simulator */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-[11px] max-h-[350px]">
                {activeTicket ? (
                  activeTicket.messages
                    .filter(m => m.sender !== 'SYSTEM')
                    .map((m, idx) => {
                      const isMe = m.sender === 'CUSTOMER';
                      return (
                        <motion.div
                          key={m.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed text-left ${
                            isMe 
                              ? simChannel === 'WHATSAPP' 
                                ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none border border-[#005c4b]/30 shadow-md'
                                : 'bg-orange-500 text-white rounded-tr-none' 
                              : simChannel === 'WHATSAPP'
                                ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-white/[0.02] shadow-md'
                                : 'bg-[#181a24] text-gray-200 rounded-tl-none border border-white/[0.02]'
                          }`}>
                            <p className="text-xs">{m.content}</p>
                          </div>
                        </motion.div>
                      );
                    })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4 font-mono">
                    <Bot size={24} className="stroke-1 text-gray-600 mb-1" />
                    <span>Select ticket or type text to test</span>
                  </div>
                )}

                {activeTicket && activeTicket.awaitingLanguageSelection && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#12141c]/85 border border-orange-500/25 p-3 rounded-2xl space-y-2 mt-2 select-none text-center"
                  >
                    <span className="text-[10px] text-orange-400 font-bold uppercase font-mono block text-center tracking-wide">
                      Select Your Support Language
                    </span>
                    <div className="flex gap-1.5 justify-center">
                      {['English', 'Hindi', 'Hinglish'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => sendClickLanguage(lang)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1"
                        >
                          <span>{lang === 'Hindi' ? 'Hindi (हिंदी)' : lang}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={simEndRef} />
                
                {isSimulatingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-[#181a24] rounded-lg p-2 flex items-center gap-1 border border-white/[0.03]">
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Simulator input area */}
              {activeTicket?.status === 'RESOLVED' ? (
                <div className="p-3 border-t border-white/[0.03] bg-[#0b0c11] flex flex-col gap-2 w-full select-none shrink-0 sticky bottom-0">
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wide">Session Resolved</span>
                  </div>

                  {activeTicket.rating ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center gap-1 animate-fade-in shadow-inner">
                      <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider uppercase">Feedback Registered, Thank you!</span>
                      <div className="flex gap-1.5 text-amber-400 my-1 justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < activeTicket.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}
                          />
                        ))}
                      </div>
                      {activeTicket.ratingFeedback && (
                        <p className="text-[10px] text-gray-405 italic font-sans max-w-full text-center break-words px-1">
                          "{activeTicket.ratingFeedback}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#12141c]/40 border border-white/[0.04] flex flex-col gap-2 animate-fade-in text-center">
                      <span className="text-[10px] font-mono text-gray-400 text-center">How would you rate our support?</span>
                      <div className="flex gap-2.5 justify-center items-center">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starVal = i + 1;
                          const isFilled = hoveredRating ? starVal <= hoveredRating : starVal <= selectedRating;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedRating(starVal)}
                              onMouseEnter={() => setHoveredRating(starVal)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="transition duration-100 ease-out transform active:scale-95 disabled:opacity-50 hover:scale-110 cursor-pointer"
                              title={`Rate ${starVal} Star(s)`}
                            >
                              <Star
                                size={18}
                                className={`transition-colors duration-150 ${
                                  isFilled 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-gray-650 hover:text-gray-400'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        placeholder="Write optional comments..."
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                        className="bg-[#12141c] text-gray-200 border border-white/[0.04] rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-orange-500 font-sans text-center placeholder-gray-600 focus:text-left"
                      />

                      <button
                        type="button"
                        disabled={selectedRating === 0 || ratingSubmitting}
                        onClick={async () => {
                          if (selectedRating === 0) return;
                          setRatingSubmitting(true);
                          await handleRateTicket(activeTicket.id, selectedRating, ratingFeedback);
                          setRatingSubmitting(false);
                        }}
                        className={`w-full py-1.5 rounded-lg font-bold text-[10px] tracking-wide transition active:scale-[0.98] cursor-pointer ${
                          selectedRating > 0
                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 border border-orange-400/20'
                            : 'bg-white/[0.02] border border-white/[0.04] text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                      </button>
                    </div>
                  )}

                  <button
                    id="btn_simulator_new_session"
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(null);
                      setSimName('New Customer');
                      setSimPhone('+9198' + Math.floor(10000000 + Math.random() * 90000000));
                      setSimMessage('');
                    }}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] transition active:scale-[0.98] border border-emerald-500/20 shrink-0 cursor-pointer"
                  >
                    + Start New Support Ticket
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendSimulationMessage}
                  className={`p-2 border-t flex gap-1.5 items-center transition-colors duration-150 shrink-0 sticky bottom-0 ${
                    simChannel === 'WHATSAPP' 
                      ? 'bg-[#101b20] border-white/[0.01]' 
                      : 'bg-[#0c0d12] border-white/[0.03]'
                  }`}
                >
                  {/* Attachment button for requested documentation */}
                  {aiAskedForDocuments && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        id="btn_simulator_attach"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className={`w-8 h-8 rounded-lg active:scale-95 transition flex items-center justify-center text-white text-xs shrink-0 duration-150 relative cursor-pointer ${
                          simChannel === 'WHATSAPP'
                            ? 'bg-[#2a3942] hover:bg-[#37444c] border border-white/[0.05] text-[#00a884]'
                            : 'bg-[#181a24] hover:bg-[#1f2230] border border-white/[0.05] text-orange-400'
                        }`}
                        title="Attach photo or invoice requested by AI"
                      >
                        <Plus size={14} className="stroke-[2.5]" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                      </button>

                      {/* Attachment popover menu */}
                      {showAttachmentMenu && (
                        <div className="absolute bottom-10 left-0 w-52 bg-[#12141c] border border-white/[0.08] shadow-2xl rounded-xl p-2 z-50 space-y-1 text-gray-200">
                          <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-400 border-b border-white/[0.04] pb-1 mb-1 px-1">
                            Simulate Requested File
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSendAttachmentSimulator("invoice_OD70415.pdf")}
                            className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                          >
                            <span>📄</span>
                            <span className="truncate">invoice_OD70415.pdf</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendAttachmentSimulator("items_damaged.jpg")}
                            className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                          >
                            <span>📸</span>
                            <span className="truncate">items_damaged.jpg</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendAttachmentSimulator("payment_receipt_screenshot.png")}
                            className="w-full text-left font-sans text-[11px] hover:bg-white/[0.03] px-2 py-1 rounded flex items-center gap-1.5 transition text-gray-300 hover:text-white cursor-pointer"
                          >
                            <span>💳</span>
                            <span className="truncate">receipt_proof.png</span>
                          </button>
                          
                          <div className="border-t border-white/[0.04] pt-1.5 mt-1">
                            <label className="w-full py-1 px-2 bg-orange-400/10 hover:bg-orange-400/15 border border-orange-500/20 text-orange-400 font-bold rounded text-center cursor-pointer transition flex items-center justify-center gap-1 text-[10px]">
                              <Plus size={11} />
                              <span>Upload Custom File</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleSendAttachmentSimulator(file.name);
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
                    id="simulator_chat_input"
                    type="text"
                    placeholder={simChannel === 'WHATSAPP' ? "Message direct via WhatsApp..." : "Type Hinglish / Tamil..."}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className={`flex-1 rounded-lg px-2.5 py-2 text-[11px] focus:outline-none placeholder-gray-500 font-mono transition-colors text-left ${
                      simChannel === 'WHATSAPP'
                        ? 'bg-[#2a3942] border border-none focus:ring-1 focus:ring-emerald-500 text-[#e9edef]'
                        : 'bg-[#181a24] text-gray-200 focus:border-orange-500'
                    }`}
                  />
                  <button
                    id="btn_send_simulator_message"
                    type="submit"
                    disabled={isSimulatingMessage}
                    className={`w-8 h-8 rounded-lg active:scale-95 transition flex items-center justify-center text-white text-xs shrink-0 duration-150 cursor-pointer ${
                      simChannel === 'WHATSAPP'
                        ? 'bg-[#00a884] hover:bg-[#008f72]'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    <Send size={11} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Simulator identity configs */}
          <div className="space-y-2 border-t border-white/[0.03] pt-3 text-[10px] font-mono text-gray-400 shrink-0 text-left">
            <div className="flex justify-between items-center gap-2">
              <span>Simulated Session:</span>
              {selectedTicketId ? (
                <span className="text-amber-300 font-semibold">{simName}</span>
              ) : (
                <input
                  id="new_sim_customer_name"
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                  className="bg-[#12141c] text-amber-300 border border-white/[0.05] rounded px-2 py-1 text-[10px] w-[130px] focus:outline-none focus:border-orange-500 text-right font-mono"
                />
              )}
            </div>
            <div className="flex justify-between items-center gap-2">
              <span>Phone Line:</span>
              {selectedTicketId ? (
                <span className="text-white">{simPhone}</span>
              ) : (
                <input
                  id="new_sim_customer_phone"
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="e.g. +919000000000"
                  className="bg-[#12141c] text-white border border-white/[0.05] rounded px-2 py-1 text-[10px] w-[130px] focus:outline-none focus:border-orange-500 text-right font-mono"
                />
              )}
            </div>
            
            {!selectedTicketId && (
              <p className="text-[9px] text-gray-500 text-center leading-normal pt-1 bg-white/[0.01] p-1.5 rounded border border-dashed border-white/[0.03]">
                Deselect Mode. Change details above and type in simulator to fire a fresh help ticket!
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
