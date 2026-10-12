import React, { useState } from 'react';
import { FIRESTORE_DATABASE_SCHEMA_JSON, REALTIME_DATABASE_SCHEMA_JSON } from '../data/firebaseSchema';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  FileJson, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SchemaViewer: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'firestore' | 'rtdb'>('firestore');
  const [copied, setCopied] = useState(false);

  const activeJson = selectedFormat === 'firestore' ? FIRESTORE_DATABASE_SCHEMA_JSON : REALTIME_DATABASE_SCHEMA_JSON;
  const jsonString = JSON.stringify(activeJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `j_star_king_${selectedFormat}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Switcher & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <span>Firebase NoSQL Database JSON Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured for 10+ countries with mandatory <code className="text-amber-300 font-mono">country_code</code> and <code className="text-amber-300 font-mono">parent_id</code> indexing.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Format toggle */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center text-xs font-semibold">
              <button
                onClick={() => setSelectedFormat('firestore')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedFormat === 'firestore'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cloud Firestore (Recommended)
              </button>
              <button
                onClick={() => setSelectedFormat('rtdb')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedFormat === 'rtdb'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Realtime Database (RTDB)
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download .json
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
            <Layers className="w-4 h-4" />
            <span>Strict Sharding & Indexing</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Har collection (State Managers, BDs, Families, Members) mein <strong className="text-amber-300 font-mono">country_code</strong> aur <strong className="text-amber-300 font-mono">parent_id</strong> top-level field ke taur par index hai. Yeh single-collection composite query ko ultra-fast banata hai bina multi-region latency ke.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Denormalized Fast Lookups</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hosts ke node mein unka <code className="text-cyan-300 font-mono">agency_code</code>, <code className="text-cyan-300 font-mono">bd_id</code>, aur <code className="text-cyan-300 font-mono">state_manager_id</code> embedded hai. Isse security rules evaluation mein bina extra database read (zero billing overhead) ke parents verify ho jate hain.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-2">
            <FileJson className="w-4 h-4" />
            <span>Financial Tamper-Proofing</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <code className="text-purple-300 font-mono">wallet_balance_coins</code> aur payouts alag sub-objects aur transactions ledger mein store hote hain. Clients aur Super Admin ko in par zero write permission hoti hai.
          </p>
        </div>
      </div>

      {/* Interactive JSON Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            {selectedFormat === 'firestore' ? 'firestore_structure.json' : 'realtime_database.json'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">UTF-8 &bull; Validated NoSQL Model</span>
        </div>

        <pre className="p-4 bg-slate-950/90 text-emerald-300 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed selection:bg-amber-500/30">
          {jsonString}
        </pre>
      </div>

    </div>
  );
};
