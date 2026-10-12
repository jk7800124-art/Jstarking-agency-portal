import React from 'react';
import { Crown, Globe, Lock, UserCheck } from 'lucide-react';
import { UserRole } from '../types/agency';

export interface ActivePersona {
  role: UserRole;
  name: string;
  country_code: string;
  parent_id: string;
  badge: string;
  isReadOnly: boolean;
  canAccessCountries: string[];
  entityId?: string;
}

export const ISOLATED_PERSONAS: ActivePersona[] = [
  {
    role: 'super_admin',
    name: 'Super Admin (Global Master View)',
    country_code: 'GLOBAL',
    parent_id: 'master_admin_01',
    badge: 'God Panel (All 10 Countries)',
    isReadOnly: true,
    canAccessCountries: ['ALL'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Pakistan (PK)',
    country_code: 'PK',
    parent_id: 'master_admin_01',
    badge: 'PK Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['PK'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Bangladesh (BD)',
    country_code: 'BD',
    parent_id: 'master_admin_01',
    badge: 'BD Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['BD'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Nepal (NP)',
    country_code: 'NP',
    parent_id: 'master_admin_01',
    badge: 'NP Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['NP'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Saudi Arabia (SA)',
    country_code: 'SA',
    parent_id: 'master_admin_01',
    badge: 'SA Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['SA'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: United Arab Emirates (AE)',
    country_code: 'AE',
    parent_id: 'master_admin_01',
    badge: 'AE Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['AE'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: India (IN)',
    country_code: 'IN',
    parent_id: 'master_admin_01',
    badge: 'IN Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['IN'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Indonesia (ID)',
    country_code: 'ID',
    parent_id: 'master_admin_01',
    badge: 'ID Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['ID'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Philippines (PH)',
    country_code: 'PH',
    parent_id: 'master_admin_01',
    badge: 'PH Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['PH'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Egypt (EG)',
    country_code: 'EG',
    parent_id: 'master_admin_01',
    badge: 'EG Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['EG'],
  },
  {
    role: 'state_manager',
    name: 'State Manager: Qatar (QA)',
    country_code: 'QA',
    parent_id: 'master_admin_01',
    badge: 'QA Isolated Portal',
    isReadOnly: false,
    canAccessCountries: ['QA'],
  },
  {
    role: 'bd',
    name: 'Business Developer (BD)',
    country_code: 'PK',
    parent_id: 'sm_pk_01',
    badge: 'BD Portal',
    isReadOnly: false,
    canAccessCountries: ['PK'],
    entityId: 'bd_pk_01',
  },
  {
    role: 'family',
    name: 'Family (Agency Head)',
    country_code: 'PK',
    parent_id: 'bd_pk_01',
    badge: 'Agency Portal',
    isReadOnly: false,
    canAccessCountries: ['PK'],
    entityId: 'fam_pk_01',
  },
];

interface HeaderProps {
  currentPersona: ActivePersona;
  onPersonaChange: (persona: ActivePersona) => void;
  activeNavTab: 'portal' | 'admin_payouts' | 'code' | 'rules' | 'calculator';
  onNavTabChange: (tab: 'portal' | 'admin_payouts' | 'code' | 'rules' | 'calculator') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPersona, 
  onPersonaChange,
  activeNavTab,
  onNavTabChange
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: Brand + Persona Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-yellow-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                  J-Star King
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  STRICT ISOLATED UI
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[11px] text-slate-400">
                  10 Exact ISO Regions &bull; Zero Dummy Data
                </p>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Firebase: <strong className="text-white">jstarking-live-b5fc1</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Persona / Login Simulator */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1 px-2 text-xs text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Active Role:</span>
            </div>
            
            <select
              value={currentPersona.name}
              onChange={(e) => {
                const found = ISOLATED_PERSONAS.find((p) => p.name === e.target.value);
                if (found) onPersonaChange(found);
              }}
              className="bg-slate-800 text-xs font-semibold text-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {ISOLATED_PERSONAS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.role === 'super_admin' ? '👑 ' : p.role === 'state_manager' ? `🌐 [${p.country_code}] ` : p.role === 'bd' ? '🤝 ' : '🏛️ '}
                  {p.name}
                </option>
              ))}
            </select>

            {currentPersona.role === 'super_admin' ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10 COUNTRIES
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                {currentPersona.country_code} ISOLATED
              </span>
            )}
          </div>

        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 pb-1 overflow-x-auto text-xs">
          <button
            onClick={() => onNavTabChange('portal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeNavTab === 'portal'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Live Isolated Portal ({currentPersona.badge})</span>
          </button>

          <button
            onClick={() => onNavTabChange('admin_payouts')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeNavTab === 'admin_payouts'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-sm'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40 bg-emerald-950/20 border border-emerald-500/30'
            }`}
          >
            <span>Central Web Admin &bull; Payout Requests Hub</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
              LIVE FIREBASE
            </span>
          </button>

          {/* Developer Architecture & Rules - STRICTLY RESTRICTED TO MASTER/SUPER ADMIN ONLY */}
          {currentPersona.role === 'super_admin' && (
            <>
              <button
                onClick={() => onNavTabChange('code')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeNavTab === 'code'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>Production Architecture (Master Admin Only)</span>
              </button>

              <button
                onClick={() => onNavTabChange('rules')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeNavTab === 'rules'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>firestore.rules (Security Rules)</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavTabChange('calculator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeNavTab === 'calculator'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Commission Split (100k = ₹600)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset local cache to clean 0 balance and re-sync with Firebase?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            title="Reset local cache to clean 0 balance"
            className="ml-auto px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition flex items-center gap-1 shrink-0"
          >
            <span>Reset Cache (Clean 0 Balance)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
