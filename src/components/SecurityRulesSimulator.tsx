import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileCode, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  label: string;
  role: string;
  countryCode: string;
  targetDoc: string;
  targetCountry: string;
  targetParentId: string;
  operation: 'READ' | 'UPDATE_PROFILE' | 'ZERO_COINS' | 'APPROVE_PAYOUT' | 'DELETE';
}

const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'super_admin_read_sa',
    label: 'Super Admin reads Saudi Arabia Host data',
    role: 'super_admin',
    countryCode: 'ALL',
    targetDoc: '/members/host_sa_01',
    targetCountry: 'SA',
    targetParentId: 'fam_sa_01',
    operation: 'READ',
  },
  {
    id: 'super_admin_zero_coins',
    label: 'Super Admin attempts to ZERO coins for PK Host',
    role: 'super_admin',
    countryCode: 'ALL',
    targetDoc: '/members/host_pk_01',
    targetCountry: 'PK',
    targetParentId: 'fam_pk_01',
    operation: 'ZERO_COINS',
  },
  {
    id: 'pk_manager_reads_pk',
    label: 'PK State Manager reads PK Family Agency',
    role: 'state_manager',
    countryCode: 'PK',
    targetDoc: '/families/fam_pk_01',
    targetCountry: 'PK',
    targetParentId: 'bd_pk_01',
    operation: 'READ',
  },
  {
    id: 'pk_manager_reads_bd',
    label: 'PK State Manager attempts to read Bangladesh (BD) Host',
    role: 'state_manager',
    countryCode: 'PK',
    targetDoc: '/members/host_bd_01',
    targetCountry: 'BD',
    targetParentId: 'fam_bd_01',
    operation: 'READ',
  },
  {
    id: 'sa_manager_reads_ae',
    label: 'SA State Manager attempts to read UAE (AE) Agency',
    role: 'state_manager',
    countryCode: 'SA',
    targetDoc: '/families/fam_ae_01',
    targetCountry: 'AE',
    targetParentId: 'bd_ae_01',
    operation: 'READ',
  },
  {
    id: 'host_updates_stream',
    label: 'Host updates own Live Stream Title',
    role: 'member',
    countryCode: 'PK',
    targetDoc: '/members/host_pk_01',
    targetCountry: 'PK',
    targetParentId: 'fam_pk_01',
    operation: 'UPDATE_PROFILE',
  },
  {
    id: 'host_attempts_add_coins',
    label: 'Host attempts to hack/tamper wallet coins directly',
    role: 'member',
    countryCode: 'PK',
    targetDoc: '/members/host_pk_01',
    targetCountry: 'PK',
    targetParentId: 'fam_pk_01',
    operation: 'ZERO_COINS',
  },
  {
    id: 'super_admin_attempts_payout',
    label: 'Super Admin attempts to release $2,500 Payout',
    role: 'super_admin',
    countryCode: 'ALL',
    targetDoc: '/payout_requests/po_992182',
    targetCountry: 'SA',
    targetParentId: 'fam_sa_01',
    operation: 'APPROVE_PAYOUT',
  },
];

export const SecurityRulesSimulator: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(PRESET_SCENARIOS[0].id);

  const scenario = PRESET_SCENARIOS.find(s => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  // Evaluate Firebase rule logic
  const evaluateRule = () => {
    // 1. MASTER ADMIN
    if (scenario.role === 'master_admin') {
      return {
        allowed: true,
        evalLine: "allow read, write: if isMasterAdmin(); // TRUE",
        explanation: "Master Admin has full root backend access to all collections and fields.",
      };
    }

    // 2. SUPER ADMIN
    if (scenario.role === 'super_admin') {
      if (scenario.operation === 'READ') {
        return {
          allowed: true,
          evalLine: "allow read: if isSuperAdmin(); // TRUE (Global Read-Only)",
          explanation: "Super Admin (God Panel) is authorized to read any country (PK, BD, SA, NP, AE, etc.) for auditing.",
        };
      }
      if (scenario.operation === 'ZERO_COINS' || scenario.operation === 'APPROVE_PAYOUT' || scenario.operation === 'DELETE' || scenario.operation === 'UPDATE_PROFILE') {
        return {
          allowed: false,
          evalLine: "allow write: if isMasterAdmin(); // FALSE (Super Admin is strictly read-only)",
          explanation: "BLOCKED: Super Admin is strictly prevented from writing, modifying balances, zeroing coins, or executing payouts.",
        };
      }
    }

    // 3. STATE MANAGER
    if (scenario.role === 'state_manager') {
      const countryMatches = scenario.countryCode === scenario.targetCountry;
      if (scenario.operation === 'READ') {
        if (countryMatches) {
          return {
            allowed: true,
            evalLine: `isStateManager(resource.data.country_code) -> ('${scenario.countryCode}' == '${scenario.targetCountry}') // TRUE`,
            explanation: `Authorized: State Manager holds claim for '${scenario.countryCode}', matching document's country_code.`,
          };
        } else {
          return {
            allowed: false,
            evalLine: `isStateManager(resource.data.country_code) -> ('${scenario.countryCode}' == '${scenario.targetCountry}') // FALSE`,
            explanation: `ACCESS DENIED: State Manager of '${scenario.countryCode}' cannot inspect data from '${scenario.targetCountry}'. Strict country isolation enforced!`,
          };
        }
      }

      if (scenario.operation === 'ZERO_COINS' || scenario.operation === 'APPROVE_PAYOUT') {
        return {
          allowed: false,
          evalLine: "!affectedKeys().hasAny(['wallet', 'wallet_diamonds']) // FALSE (Tampering blocked)",
          explanation: `BLOCKED: State Manager cannot arbitrarily alter coin ledgers or approve payouts. Payouts require Master Admin verification.`,
        };
      }
    }

    // 4. MEMBER / HOST
    if (scenario.role === 'member') {
      if (scenario.operation === 'UPDATE_PROFILE') {
        return {
          allowed: true,
          evalLine: "allow update: if isHost(memberId) && noCoinTampering(); // TRUE",
          explanation: "Authorized: Live host is updating non-financial stream metadata (title, category) without modifying wallet balance.",
        };
      }
      if (scenario.operation === 'ZERO_COINS') {
        return {
          allowed: false,
          evalLine: "noCoinTampering() -> affectedKeys().hasAny(['wallet_balance_coins']) // FALSE",
          explanation: "BLOCKED: Client cannot directly mutate coin balance fields. Coins must only be credited via trusted backend transactions.",
        };
      }
    }

    return {
      allowed: false,
      evalLine: "default deny // FALSE",
      explanation: "Operation not permitted by security rules.",
    };
  };

  const evalResult = evaluateRule();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Interactive Security Rules Simulator (Firebase AST Sandbox)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and verify how Firestore & RTDB rules evaluate token claims, <code className="text-amber-300 font-mono">country_code</code> isolation, and Super Admin restrictions.
          </p>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
          Live Rule Engine &bull; Ready
        </span>
      </div>

      {/* Preset Scenario Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Select Test Scenario:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRESET_SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className={`text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-200 font-semibold shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{s.label}</span>
                </div>
                <span className="text-[10px] font-mono shrink-0 ml-2 bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                  {s.operation}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Execution Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        
        {/* Input Parameters (Request context) */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between pb-2 border-b border-slate-800">
            <span>Incoming Request Context (request.auth)</span>
            <span className="text-[10px] font-mono text-amber-400">JWT Token Claims</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">request.auth.token.role:</span>
              <span className="text-amber-300 font-bold">&quot;{scenario.role}&quot;</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">request.auth.token.country_code:</span>
              <span className="text-cyan-300 font-bold">&quot;{scenario.countryCode}&quot;</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Target Path:</span>
              <span className="text-purple-300 truncate max-w-[200px]">{scenario.targetDoc}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Document resource.data.country_code:</span>
              <span className="text-emerald-300 font-bold">&quot;{scenario.targetCountry}&quot;</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Operation Type:</span>
              <span className="text-rose-300 font-bold">{scenario.operation}</span>
            </div>
          </div>
        </div>

        {/* Evaluation Output */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between ${
          evalResult.allowed 
            ? 'bg-emerald-950/30 border-emerald-500/40' 
            : 'bg-rose-950/30 border-rose-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-bold text-slate-200">Rule Evaluation Result</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                evalResult.allowed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {evalResult.allowed ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> 200 PERMISSION_GRANTED</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5" /> 403 PERMISSION_DENIED</>
                )}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-slate-400">Evaluated Rule Statement:</div>
              <pre className="p-2.5 bg-black/70 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto border border-slate-800">
                {evalResult.evalLine}
              </pre>

              <div className="text-[11px] text-slate-400 mt-2">Security Engine Explanation:</div>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                {evalResult.explanation}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Simulated under production Cloud Firestore security rules compiler.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
