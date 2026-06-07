import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Code, Copy, Check } from 'lucide-react';
import { AndroidFile } from '../types';

interface AndroidTabProps {
  androidFiles: AndroidFile[];
  selectedAndroidFilePath: string;
  setSelectedAndroidFilePath: (path: string) => void;
  copiedFile: string | null;
  handleCopyCode: (content: string, path: string) => void;
}

export function AndroidTab({
  androidFiles,
  selectedAndroidFilePath,
  setSelectedAndroidFilePath,
  copiedFile,
  handleCopyCode
}: AndroidTabProps) {
  const activeAndroidFile = androidFiles.find(f => f.path === selectedAndroidFilePath);

  return (
    <motion.div
      key="android"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex-1 flex overflow-hidden p-6 gap-6"
    >
      {/* Lateral source tree outline */}
      <div className="w-[280px] bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl p-4 flex flex-col shrink-0">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2 font-sans">
            <Smartphone size={15} className="text-orange-400" />
            <span>Android App Workspace</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-sans">
            Jetpack Compose native application blueprints. Download, compile, and connect.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {androidFiles.map(file => (
            <button
              key={file.path}
              onClick={() => setSelectedAndroidFilePath(file.path)}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-mono relative transition-colors border select-none cursor-pointer overflow-hidden ${
                selectedAndroidFilePath === file.path
                  ? 'text-orange-400 font-semibold border-orange-500/15 shadow-sm'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {selectedAndroidFilePath === file.path && (
                <motion.div
                  layoutId="activeAndroidFileBg"
                  className="absolute inset-0 bg-orange-500/10 animated-fade-in"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <div className="relative z-10">
                <div className="font-bold flex items-center gap-1.5 truncate">
                  <Code size={13} className={selectedAndroidFilePath === file.path ? "text-orange-400 shrink-0" : "text-gray-500 shrink-0"} />
                  <span>{file.name}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{file.path}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Source code viewer */}
      <div className="flex-1 bg-[#0c0d12]/50 border border-white/[0.04] rounded-2xl flex flex-col overflow-hidden">
        {activeAndroidFile ? (
          <>
            {/* Code editor header */}
            <div className="p-4 bg-black/30 border-b border-white/[0.04] flex justify-between items-center bg-[#07080c]">
              <div>
                <h3 className="text-xs font-bold font-mono text-gray-200">
                  {activeAndroidFile.path}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-sans">
                  {activeAndroidFile.description}
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(activeAndroidFile.content, activeAndroidFile.path)}
                className="px-3 py-1.5 text-xs font-mono bg-[#141620] hover:bg-[#1f2130] text-gray-300 border border-white/[0.05] rounded-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs text-[#f2ede4]"
              >
                {copiedFile === activeAndroidFile.path ? (
                  <>
                    <Check size={13} className="text-green-400" />
                    <span className="text-green-400 font-semibold font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="font-sans">Copy Source</span>
                  </>
                )}
              </button>
            </div>

            {/* Code container */}
            <div className="flex-1 p-5 overflow-auto bg-[#07080b] font-mono text-xs text-[#a9b2c3] leading-relaxed">
              <pre className="whitespace-pre select-text">
                <code>{activeAndroidFile.content}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500 font-mono">
            <span>No file matches selected directory path</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
