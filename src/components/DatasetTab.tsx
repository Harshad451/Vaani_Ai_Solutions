import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { DatasetItem } from '../types';

interface DatasetTabProps {
  datasets: DatasetItem[];
  fetchDataset: () => Promise<void>;
}

export function DatasetTab({
  datasets,
  fetchDataset
}: DatasetTabProps) {
  const [searchDatasetTerm, setSearchDatasetTerm] = useState<string>('');
  const [newDSQuery, setNewDSQuery] = useState<string>('');
  const [newDSLanguage, setNewDSLanguage] = useState<string>('Hinglish');
  const [newDSIntent, setNewDSIntent] = useState<string>('ORDER_TRACKING');
  const [newDSSentiment] = useState<string>('Neutral');
  const [newDSScript, setNewDSScript] = useState<'Native' | 'Latin/Transliterated' | 'Code-Mixed'>('Latin/Transliterated');
  const [newDSEscalate, setNewDSEscalate] = useState<boolean>(false);
  const [newDSReply, setNewDSReply] = useState<string>('');
  const [isAddingDatasetItem, setIsAddingDatasetItem] = useState<boolean>(false);

  const handleAddDatasetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDSQuery.trim() || !newDSReply.trim()) return;

    setIsAddingDatasetItem(true);
    try {
      const token = localStorage.getItem('vaani_logged_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/dataset', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: newDSQuery,
          language: newDSLanguage,
          intent: newDSIntent,
          sentiment: newDSSentiment,
          shouldEscalate: newDSEscalate,
          expectedReply: newDSReply,
          scriptType: newDSScript
        })
      });

      if (res.ok) {
        setNewDSQuery('');
        setNewDSReply('');
        await fetchDataset();
      }
    } catch (err) {
      console.error("Error committing training item to dataset:", err);
    } finally {
      setIsAddingDatasetItem(false);
    }
  };

  return (
    <motion.div
      key="dataset"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex overflow-hidden p-6 gap-6"
    >
      {/* Labeled datasets grid */}
      <div className="flex-1 flex flex-col bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-200">Pre-Trained Vernacular Dataset</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical customer statements labeled with intents, languages, sentiments, and expected replies.
            </p>
          </div>
          
          {/* Filter datasets */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={13} />
            <input
              type="text"
              placeholder="Search queries, scripts..."
              value={searchDatasetTerm}
              onChange={(e) => setSearchDatasetTerm(e.target.value)}
              className="w-[220px] pl-8 pr-3 py-1.5 text-xs bg-[#12141c] border border-white/[0.05] rounded-md focus:outline-none focus:border-orange-500 text-gray-200 font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {datasets
              .filter(d => d.query.toLowerCase().includes(searchDatasetTerm.toLowerCase()) || d.language.toLowerCase().includes(searchDatasetTerm.toLowerCase()) || d.intent.toLowerCase().includes(searchDatasetTerm.toLowerCase()))
              .map(d => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="bg-[#0e0f15]/80 border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between hover:bg-[#0e0f15] hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/[0.01] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-amber-300 mr-2 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        {d.intent}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.02]">
                        {d.language} ({d.scriptType})
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      d.shouldEscalate ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-green-500/10 text-green-400 border border-green-500/15'
                    }`}>
                      {d.shouldEscalate ? 'FORCE HUMAN' : 'AI RESOLVABLE'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-200 italic mb-3">"{d.query}"</p>

                  <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg text-xs leading-relaxed text-gray-400 font-sans shadow-sm">
                    <span className="text-orange-400/80 font-semibold font-mono text-[10px] uppercase block mb-1">Pre-trained AI Vernacular Response:</span>
                    "{d.expectedReply}"
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Training Form Panel */}
      <div className="w-[340px] bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-200 flex items-center gap-1.5">
              <Plus size={18} className="text-orange-500" />
              <span>Pre-Train Labeled query</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-sans">
              Add a new classified sample query to train the local router and calibrate Claude's system prompt.
            </p>
          </div>

          <form onSubmit={handleAddDatasetItem} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 font-mono mb-1.5 uppercase tracking-wider text-[10px]">Customer Query Statement:</label>
              <textarea
                required
                rows={2}
                value={newDSQuery}
                onChange={(e) => setNewDSQuery(e.target.value)}
                placeholder="Mera order kab dispatch hoga? track kyu ni chal ra..."
                className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-400 font-mono mb-1 uppercase tracking-wider text-[10px]">Dialect/Language:</label>
                <select
                  value={newDSLanguage}
                  onChange={(e) => setNewDSLanguage(e.target.value)}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-md p-1.5 focus:outline-none text-gray-300 font-mono"
                >
                  <option value="Hinglish">Hinglish</option>
                  <option value="Hindi">Hindi (Native)</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1 uppercase tracking-wider text-[10px]">Intent Labeled:</label>
                <select
                  value={newDSIntent}
                  onChange={(e) => setNewDSIntent(e.target.value)}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-md p-1.5 focus:outline-none text-gray-300 font-mono"
                >
                  <option value="ORDER_TRACKING">TRACKING</option>
                  <option value="RETURN_REQUEST">RETURN</option>
                  <option value="REFUND_STATUS">REFUND</option>
                  <option value="COUPON_ISSUES">COUPON</option>
                  <option value="HUMAN_ESCALATION">ESCALATE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-400 font-mono mb-1 uppercase tracking-wider text-[10px]">Script Stylization:</label>
                <select
                  value={newDSScript}
                  onChange={(e) => setNewDSScript(e.target.value as any)}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-md p-1.5 focus:outline-none text-gray-300 font-mono"
                >
                  <option value="Native">Native</option>
                  <option value="Latin/Transliterated">Transliterated</option>
                  <option value="Code-Mixed">Code-Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1 uppercase tracking-wider text-[10px]">Escalate Strategy:</label>
                <select
                  value={String(newDSEscalate)}
                  onChange={(e) => setNewDSEscalate(e.target.value === 'true')}
                  className="w-full bg-[#12141c] border border-white/[0.05] rounded-md p-1.5 focus:outline-none text-gray-300 font-mono"
                >
                  <option value="false">Automatic Resolve</option>
                  <option value="true">Force Operator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-mono mb-1 uppercase tracking-wider text-[10px]">Perfect Labeled Vernacular Response:</label>
              <textarea
                required
                rows={2}
                value={newDSReply}
                onChange={(e) => setNewDSReply(e.target.value)}
                placeholder="नमस्ते! आपका ऑर्डर ट्रैक किया गया है..."
                className="w-full bg-[#12141c] border border-white/[0.05] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isAddingDatasetItem}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 transition text-[#f2ede4] font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrendingUp size={14} />
              <span className="font-sans">Inject & Re-train Router</span>
            </button>
          </form>
        </div>

        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 text-[11px] font-mono leading-relaxed text-orange-200 mt-4">
          <p className="font-semibold flex items-center gap-1.5 mb-1 text-orange-400 font-sans">
            <Sparkles size={12} />
            Zero-Shot Ingress Tuning
          </p>
          Adding items here updates the local router database and acts as an immediate context-injection layer inside our Claude System evaluation matrix.
        </div>
      </div>
    </motion.div>
  );
}
