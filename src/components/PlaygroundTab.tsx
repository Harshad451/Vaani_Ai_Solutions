import React from 'react';
import { motion } from 'motion/react';
import { Terminal, RefreshCw, Activity } from 'lucide-react';

interface PlaygroundTabProps {
  playgroundQuery: string;
  setPlaygroundQuery: (v: string) => void;
  playgroundLoading: boolean;
  playgroundResult: any;
  handlePlaygroundTest: () => void;
  systemPromptRule: string;
}

export function PlaygroundTab({
  playgroundQuery,
  setPlaygroundQuery,
  playgroundLoading,
  playgroundResult,
  handlePlaygroundTest,
  systemPromptRule
}: PlaygroundTabProps) {
  return (
    <motion.div
      key="playground"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex flex-col overflow-y-auto p-6 gap-6"
    >
      {/* Upper grid with testing tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input query Playground testing box */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-200 flex items-center gap-1.5 font-sans">
              <Terminal size={17} className="text-orange-500" />
              <span>Claude Prompt Playground Diagnostics</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Test any custom user-expressed vernacular statement against the active AI translation system prompt instantly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-gray-450 font-mono text-[10px] uppercase tracking-wider">Type any query statement to run analysis:</label>
              <textarea
                rows={4}
                value={playgroundQuery}
                onChange={(e) => setPlaygroundQuery(e.target.value)}
                className="w-full bg-[#12141c] border border-white/[0.05] rounded-xl p-3.5 text-xs text-gray-100 font-mono focus:outline-none focus:border-orange-500 leading-relaxed"
                placeholder="Type anything (e.g., Hinglish: 'Order deliver kyu ni kara thik se. Paisa wapas de do')"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handlePlaygroundTest}
                disabled={playgroundLoading}
                className="px-5 py-2.5 font-semibold text-xs rounded-xl bg-orange-500 hover:bg-orange-600 transition text-[#f2ede4] flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                {playgroundLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity size={14} />
                    <span>Trigger Prompt Evaluation</span>
                  </>
                )}
              </button>
            </div>

            {/* Pre-formatted prompt rule reference */}
            <div className="bg-black/30 border border-white/[0.03] rounded-xl p-4 font-mono text-[10.5px] leading-relaxed text-gray-500 mt-4 overflow-y-auto max-h-[180px]">
              <span className="text-amber-300 font-bold block mb-1">Active AI Prompt Rules System:</span>
              {systemPromptRule}
            </div>
          </div>
        </div>

        {/* Output payload sandbox */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-5 flex flex-col shrink-0">
          <h3 className="text-sm font-bold text-gray-200 font-mono uppercase tracking-wider mb-2 border-b border-white/[0.03] pb-2">
            Analysis JSON Payload
          </h3>

          <div className="bg-black/40 border border-white/[0.03] rounded-xl p-4 min-h-[220px] overflow-auto font-mono text-[11px] text-green-400">
            {playgroundResult ? (
              <pre className="whitespace-pre">
                {JSON.stringify({
                  detected_language: playgroundResult.language,
                  intent: playgroundResult.intent,
                  confidence_score: playgroundResult.rawMessageMeta?.confidence || 0.92,
                  should_escalate: playgroundResult.status === 'ESCALATED',
                  sentiment: playgroundResult.sentiment,
                  automated_vernacular_reply: playgroundResult.text
                }, null, 2)}
              </pre>
            ) : (
              <div className="flex items-center justify-center min-h-[180px] text-center text-gray-600">
                <span>Execute evaluation to inspect raw classified JSON outcome.</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3.5 bg-white/[0.01] border border-white/[0.03] rounded-xl text-[11px] font-mono leading-relaxed text-gray-400">
            <span className="text-orange-400 font-semibold uppercase tracking-wider block mb-1 text-[10px]">Dual Model Pipeline:</span>
            This console integrates seamlessly with Anthropic model networks at runtime. To fallback gracefully under zero key configurations, we run Google's robust Gemini 2.5 Flash SDK automatically using default tokens.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
