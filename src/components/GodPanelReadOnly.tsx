import React, { useState } from 'react';
import { ActivePersona } from './Header';
import { MEMBERS, FAMILIES, STATE_MANAGERS, COUNTRIES } from '../data/mockDatabase';
import { 
  Eye, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Ban, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  DollarSign, 
  Search,
  FileCheck
} from 'lucide-react';

interface GodPanelProps {
  currentPersona: ActivePersona;
}

export const GodPanelReadOnly: React.FC<GodPanelProps> = ({ currentPersona }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [auditMessage, setAuditMessage] = useState<{
    type: 'denied' | 'allowed';
    title: string;
    detail: string;
    ruleSnippet: string;
  } | null>(null);

  const isReadOnlyGod = currentPersona.role === 'super_admin';
  const isMaster = currentPersona.role === 'master_admin';

  const handleAttemptAction = (actionName: string, targetName: string) => {
    if (isReadOnlyGod) {
      setAuditMessage({
        type: 'denied',
        title: `⛔ PERMISSION DENIED: ${actionName} Blocked!`,
        detail: `Super Admin (God Panel) has global READ ONLY access. Under Firebase rules, write/financial operations (zeroing coins, approving payouts, modifying balances) are strictly forbidden to protect Master Admin assets.`,
        ruleSnippet: `// firestore.rules:\nfunction isSuperAdmin() {\n  return request.auth.token.role == 'super_admin';\n}\n// In collections:\nallow read: if isSuperAdmin();\nallow write: false; // Super Admin cannot zero coins or pay!`,
      });
    } else if (isMaster) {
      setAuditMessage({
        type: 'allowed',
        title: `✅ ACTION EXECUTED: ${actionName} for ${targetName}`,
        detail: `Master Admin holds full backend control. Operation authorized and written to audit log.`,
        ruleSnippet: `function isMasterAdmin() {\n  return request.auth.token.role == 'master_admin';\n}\nallow read, write: if isMasterAdmin();`,
      });
    } else {
      setAuditMessage({
        type: 'denied',
        title: `⛔ ACCESS DENIED`,
        detail: `Your current role (${currentPersona.name}) does not hold Master Admin authority for this operation.`,
        ruleSnippet: `allow write: if isMasterAdmin();`,
      });
    }
  };

  // Filter hosts across all countries
  const filteredHosts = MEMBERS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.country_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.agency_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* God Panel Read-Only Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <Eye className="w-56 h-56 text-amber-300" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Super Admin &quot;God Panel&quot; (Read-Only Global Monitor)</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> READ: TRUE &bull; WRITE: FALSE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                App Owner ka Right-Hand Panel: Dunya ke sabhi 10+ countries (PK, BD, SA, NP, AE, etc.) ke sabhi State Managers, BDs, Families, aur Live Hosts ka data open karke monitor kar sakta hai. Par <strong className="text-amber-300 font-semibold">kisi ke coins zero (0) nahi kar sakta</strong> aur <strong className="text-amber-300 font-semibold">payment release nahi kar sakta</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shrink-0">
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Global Read Permission:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ENABLED</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Coin Zeroing (0 Coins):</span>
              <span className="text-rose-400 font-bold flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> BLOCKED</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Payout Release:</span>
              <span className="text-rose-400 font-bold flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> BLOCKED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Alert Notification if action attempted */}
      {auditMessage && (
        <div className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
          auditMessage.type === 'denied' 
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200' 
            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-start gap-3">
            {auditMessage.type === 'denied' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">{auditMessage.title}</div>
              <p className="text-xs mt-1 text-slate-300">{auditMessage.detail}</p>
              <pre className="mt-2 p-2 bg-black/60 rounded text-[11px] font-mono text-amber-300/90 overflow-x-auto">
                {auditMessage.ruleSnippet}
              </pre>
            </div>
            <button 
              onClick={() => setAuditMessage(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              &times; Close
            </button>
          </div>
        </div>
      )}

      {/* Global Live Host Ledger with Safe & Prohibited Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Worldwide Live Hosts & Wallet Balances (10+ Countries)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Super Admin can monitor everything. Try clicking &quot;Zero Coins&quot; or &quot;Release Payout&quot; to test security enforcement!
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search host, country (PK, BD, SA), agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">Host / Live Status</th>
                <th className="pb-3 font-semibold">Country</th>
                <th className="pb-3 font-semibold">Hierarchy Path (parent_id)</th>
                <th className="pb-3 font-semibold">Diamonds Earned</th>
                <th className="pb-3 font-semibold">Withdrawable USD</th>
                <th className="pb-3 font-semibold text-right">Security Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHosts.map((host) => {
                const country = COUNTRIES.find(c => c.code === host.country_code);

                return (
                  <tr key={host.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{host.name}</span>
                        {host.live_status === 'live' && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 rounded">LIVE</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {host.id} &bull; {host.category}</div>
                    </td>

                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        <span>{country?.flag}</span>
                        <span>{host.country_code}</span>
                      </span>
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      <div className="text-purple-300">parent_id: {host.parent_id}</div>
                      <div className="text-slate-400 text-[10px]">Agency: {host.agency_code}</div>
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{host.coins_current_month.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Target: {host.completed_hours_monthly}/{host.target_hours_monthly}h</div>
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-emerald-400 flex items-center gap-0.5">
                        <span>₹{host.withdrawable_inr.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Bal: {host.wallet_balance_coins.toLocaleString()} 🪙</div>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* READ-ONLY SAFE BUTTON */}
                        <button
                          onClick={() => handleAttemptAction('View Full Host Telemetry & Logs', host.name)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" /> View Data
                        </button>

                        {/* ZERO COIN BUTTON - PROHIBITED FOR SUPER ADMIN */}
                        <button
                          onClick={() => handleAttemptAction('Zero Coins (Set Balance = 0)', host.name)}
                          className={`px-2 py-1 rounded font-medium text-[11px] border flex items-center gap-1 transition ${
                            isReadOnlyGod
                              ? 'bg-rose-950/30 text-rose-400/70 border-rose-900/50 hover:bg-rose-950/60 cursor-pointer'
                              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
                          }`}
                          title={isReadOnlyGod ? 'Prohibited for Super Admin under Firebase Security Rules' : 'Master Admin Authorized'}
                        >
                          {isReadOnlyGod ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3" />}
                          Zero Coins (0)
                        </button>

                        {/* RELEASE PAYOUT BUTTON - PROHIBITED FOR SUPER ADMIN */}
                        <button
                          onClick={() => handleAttemptAction('Release Direct Cashout Payment', host.name)}
                          className={`px-2 py-1 rounded font-medium text-[11px] border flex items-center gap-1 transition ${
                            isReadOnlyGod
                              ? 'bg-amber-950/30 text-amber-400/70 border-amber-900/50 hover:bg-amber-950/60 cursor-pointer'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                          }`}
                          title={isReadOnlyGod ? 'Prohibited for Super Admin under Firebase Security Rules' : 'Master Admin Authorized'}
                        >
                          {isReadOnlyGod ? <Lock className="w-3 h-3 text-amber-400" /> : <DollarSign className="w-3 h-3" />}
                          Pay Host
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
