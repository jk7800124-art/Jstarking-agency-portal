import React, { useState } from 'react';
import { STANDALONE_INDEX_HTML, STANDALONE_DASHBOARD_JS } from '../data/standaloneExport';
import { FIRESTORE_DATABASE_SCHEMA_JSON } from '../data/firebaseSchema';
import { FileCode, Copy, Check, Download, Layers } from 'lucide-react';

export const StandaloneCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'html' | 'js' | 'json'>('js');
  const [copied, setCopied] = useState(false);

  const getFileContent = () => {
    if (activeFile === 'html') return STANDALONE_INDEX_HTML;
    if (activeFile === 'js') return STANDALONE_DASHBOARD_JS;
    return JSON.stringify(FIRESTORE_DATABASE_SCHEMA_JSON, null, 2);
  };

  const content = getFileContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeFile === 'html' ? 'index.html' : activeFile === 'js' ? 'dashboard.js' : 'firebase_10_countries_schema.json';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <span>Isolated Architecture Source Code (index.html &amp; dashboard.js)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict client-side isolation: Evaluates token claims and renders ONLY the authorized country or tier template.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveFile('html')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeFile === 'html' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                index.html
              </button>
              <button
                onClick={() => setActiveFile('js')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeFile === 'js' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                dashboard.js
              </button>
              <button
                onClick={() => setActiveFile('json')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeFile === 'json' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                10_countries_schema.json
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            {activeFile === 'html' ? 'public/index.html' : activeFile === 'js' ? 'public/dashboard.js' : 'firebase_schema.json'}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">Production Ready</span>
        </div>

        <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed selection:bg-amber-500/30">
          {content}
        </pre>
      </div>
    </div>
  );
};
