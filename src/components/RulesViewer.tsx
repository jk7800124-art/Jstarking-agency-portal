import React, { useState } from 'react';
import { FIRESTORE_RULES, REALTIME_DB_RULES, CUSTOM_CLAIMS_NODEJS_CODE } from '../data/securityRules';
import { ShieldCheck, Copy, Check, Terminal, FileCode, ShieldAlert, Key } from 'lucide-react';

export const RulesViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'firestore' | 'rtdb' | 'claims'>('firestore');
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    switch (activeTab) {
      case 'firestore': return FIRESTORE_RULES;
      case 'rtdb': return REALTIME_DB_RULES;
      case 'claims': return CUSTOM_CLAIMS_NODEJS_CODE;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Production Firebase Security Rules & Custom Claims Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict RBAC: Super Admin (Global Read-Only), State Manager (Strict <code className="text-amber-300 font-mono">country_code</code> isolation), BD, Family, and Host tiers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab('firestore')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === 'firestore'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                firestore.rules
              </button>
              <button
                onClick={() => setActiveTab('rtdb')}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === 'rtdb'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                database.rules.json
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                  activeTab === 'claims'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                Custom Claims (Node.js)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? 'Copied Code!' : 'Copy Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>How Super Admin Read-Only is Enforced</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Super Admin ke token mein <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">role: &quot;super_admin&quot;</code> hota hai.
            </p>
            <p className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] font-mono text-emerald-300">
              allow read: if isMasterAdmin() || isSuperAdmin();<br/>
              allow write: if isMasterAdmin(); // Super Admin blocked!
            </p>
            <p>
              Is rule ki wajah se Super Admin puri duniya (10+ countries) ka live data bina rok-tok open kar sakta hai, lekin <strong className="text-amber-300">kisi ke coins zero (0) nahi kar sakta</strong> aur na hi payouts release kar sakta hai kyunki write condition mein sirf Master Admin allowed hai.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2">
            <Terminal className="w-4 h-4" />
            <span>How Country Isolation is Enforced</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              State Manager (e.g., PK ya BD manager) ke Firebase Auth Token mein unka assigned country code hota hai:
            </p>
            <p className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
              function isStateManager(country) &#123;<br/>
              &nbsp;&nbsp;return request.auth.token.role == &apos;state_manager&apos; &amp;&amp;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;request.auth.token.country_code == country;<br/>
              &#125;
            </p>
            <p>
              Jab PK Manager kisi node ko access karta hai, to Firestore check karta hai ki kya doc ka <code className="text-cyan-300 font-mono">country_code == &apos;PK&apos;</code> hai. Agar Saudi Arabia (SA) ya Bangladesh (BD) ka data hoga to Firestore turant <strong className="text-rose-400 font-semibold">403 Permission Denied</strong> throw kar dega.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>
              {activeTab === 'firestore' && 'firestore.rules (Firestore Security Rules)'}
              {activeTab === 'rtdb' && 'database.rules.json (Realtime Database Security Rules)'}
              {activeTab === 'claims' && 'admin_set_custom_claims.js (Firebase Admin SDK)'}
            </span>
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">Ready to Deploy</span>
        </div>

        <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed selection:bg-amber-500/30">
          {getCode()}
        </pre>
      </div>

    </div>
  );
};
