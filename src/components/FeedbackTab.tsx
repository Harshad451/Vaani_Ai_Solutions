import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star } from 'lucide-react';
import { Ticket } from '../types';

interface FeedbackTabProps {
  tickets: Ticket[];
  feedbackSearchQuery: string;
  setFeedbackSearchQuery: (v: string) => void;
  feedbackRatingFilter: 'ALL' | number;
  setFeedbackRatingFilter: (v: 'ALL' | number) => void;
}

export function FeedbackTab({
  tickets,
  feedbackSearchQuery,
  setFeedbackSearchQuery,
  feedbackRatingFilter,
  setFeedbackRatingFilter
}: FeedbackTabProps) {
  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#06070a] text-[#f2ede4] relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto space-y-6 relative z-10">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.05] pb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-200 tracking-tight flex items-center gap-2">
              <Star className="text-orange-500 fill-orange-500/15" size={20} />
              <span>Completed Ticket Feedback Feed</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Read verified support notes and performance feedback ratings submitted by retail shoppers after ticket resolution is completed.
            </p>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-white/[0.01] border border-white/[0.04] p-2.5 rounded-lg">
            <span className="text-orange-400 font-bold">
              {(() => {
                const rated = tickets.filter(t => t.rating !== undefined && t.rating > 0);
                return rated.length > 0
                  ? (rated.reduce((acc, curr) => acc + (curr.rating || 0), 0) / rated.length).toFixed(2)
                  : '4.80';
              })()}
            </span>
            <span> / 5.00 Total CSAT Core Rating</span>
          </div>
        </div>

        {/* Operational Interactive Search & Filter Controls bar */}
        <div className="bg-white/[0.01] p-4 rounded-xl border border-white/[0.03] flex flex-col md:flex-row gap-4 justify-between items-center font-sans">
          <div className="relative w-full md:w-96 text-xs">
            <Search className="absolute left-3 top-2.5 text-gray-600" size={14} />
            <input 
              type="text"
              value={feedbackSearchQuery}
              onChange={(e) => setFeedbackSearchQuery(e.target.value)}
              placeholder="Filter completed Shoppers / Feedback reviews / Language..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition font-sans"
            />
            {feedbackSearchQuery && (
              <button 
                onClick={() => setFeedbackSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition text-[11px]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Star pills */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mr-1">Star Filter:</span>
            
            <button
              id="btn_filter_feed_all"
              onClick={() => setFeedbackRatingFilter('ALL')}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition ${feedbackRatingFilter === 'ALL' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:text-gray-200'} cursor-pointer`}
            >
              ALL
            </button>

            <button
              id="btn_filter_feed_5"
              onClick={() => setFeedbackRatingFilter(5)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition ${feedbackRatingFilter === 5 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-semibold' : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:text-gray-200'} cursor-pointer flex items-center gap-1`}
            >
              <Star size={10} className="fill-current" />
              <span>5 STARS</span>
            </button>

            <button
              id="btn_filter_feed_4"
              onClick={() => setFeedbackRatingFilter(4)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition ${feedbackRatingFilter === 4 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-semibold' : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:text-gray-200'} cursor-pointer flex items-center gap-1`}
            >
              <Star size={10} className="fill-current" />
              <span>4 STARS</span>
            </button>

            <button
              id="btn_filter_feed_not_perfect"
              onClick={() => setFeedbackRatingFilter(3)}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition ${feedbackRatingFilter === 3 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-semibold' : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:text-gray-200'} cursor-pointer flex items-center gap-1`}
            >
              <span>&lt; 4 STARS</span>
            </button>
          </div>
        </div>

        {/* List feed */}
        <div className="space-y-4 font-sans">
          {(() => {
            const ratedTicketsList = tickets.filter(t => t.rating && t.rating > 0);
            const combinedLogs = ratedTicketsList.map(t => ({
              id: t.id,
              customerName: t.customerName || 'Anonymous Shopper',
              customerEmail: t.customerEmail || 'no-email@customer.com',
              rating: t.rating || 5,
              ratingFeedback: t.ratingFeedback || 'Vernacular task resolved beautifully.',
              createdAt: t.updatedAt || t.createdAt,
              channel: t.channel || 'WEB',
              language: t.detectedLanguage || 'Vernacular Detected'
            }));

            // Parse filters
            const filteredLogs = combinedLogs.filter(item => {
              // Rating Filter Match
              if (feedbackRatingFilter !== 'ALL') {
                if (feedbackRatingFilter === 3) {
                  if (item.rating >= 4) return false;
                } else {
                  if (item.rating !== feedbackRatingFilter) return false;
                }
              }

              // Search Query Match
              if (feedbackSearchQuery.trim()) {
                const query = feedbackSearchQuery.toLowerCase();
                const matchesName = item.customerName.toLowerCase().includes(query);
                const matchesEmail = item.customerEmail.toLowerCase().includes(query);
                const matchesFeedback = item.ratingFeedback.toLowerCase().includes(query);
                const matchesLanguage = item.language.toLowerCase().includes(query);
                return matchesName || matchesEmail || matchesFeedback || matchesLanguage;
              }

              return true;
            });

            if (filteredLogs.length === 0) {
              return (
                <div className="text-center py-12 bg-white/[0.01] rounded-xl border border-white/[0.03] space-y-2">
                  <span className="text-gray-450 block text-xs font-sans">No completed customer ratings matched your criteria.</span>
                  <span className="text-gray-600 block text-[11px] font-mono">Try adjusting your filters or clearing search query.</span>
                </div>
              );
            }

            return (
              <div className="space-y-3 font-sans">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map(feed => (
                    <motion.div 
                      key={feed.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      layout
                      className="bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.06] p-5 rounded-xl transition-all shadow-md flex justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-bold text-gray-200 text-xs">{feed.customerName}</span>
                          <span className="text-[10px] font-mono text-gray-500">{feed.customerEmail}</span>
                          
                          <div className="flex bg-[#121319] border border-white/[0.03] px-2 py-0.5 rounded text-[9px] font-mono text-gray-400 items-center gap-1">
                            <span className="h-1 w-1 bg-orange-400 rounded-full" />
                            <span>{feed.channel}</span>
                          </div>

                          <div className="flex bg-[#121319] border border-white/[0.03] px-2 py-0.5 rounded text-[9px] font-mono text-gray-400 items-center gap-1.5 ml-auto md:ml-0">
                            <span>Language:</span>
                            <span className="text-[#ff7c2a] font-semibold">{feed.language}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed italic bg-white/[0.01] p-3 rounded-lg border border-white/[0.02]">
                          "{feed.ratingFeedback}"
                        </p>

                        <div className="text-[10px] text-gray-500 font-mono">
                          Resolved On: {new Date(feed.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Star Display Column */}
                      <div className="flex flex-col items-end justify-center w-28 shrink-0">
                        <div className="flex gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < feed.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} 
                            />
                          ))}
                        </div>
                        <span className="text-[10.5px] font-mono text-gray-450 font-semibold">{feed.rating}/5 Rating</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}
