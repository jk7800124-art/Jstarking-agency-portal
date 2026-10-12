import React from 'react';
import { COUNTRIES } from '../data/mockDatabase';
import { ActivePersona } from './Header';
import { Globe, Users, Coins, DollarSign, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CountryOverviewProps {
  currentPersona: ActivePersona;
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
}

export const CountryOverview: React.FC<CountryOverviewProps> = ({
  currentPersona,
  selectedCountry,
  onSelectCountry,
}) => {
  // Check permission for country
  const canAccess = (countryCode: string) => {
    if (currentPersona.canAccessCountries.includes('ALL')) return true;
    return currentPersona.canAccessCountries.includes(countryCode);
  };

  const totalGlobalCoins = COUNTRIES.reduce((acc, c) => acc + c.totalCoins, 0);
  const totalGlobalHosts = COUNTRIES.reduce((acc, c) => acc + c.activeHosts, 0);
  const totalMonthlyRevINR = COUNTRIES.reduce((acc, c) => acc + c.monthlyRevenueINR, 0);

  return (
    <div className="space-y-6">
      {/* Top Aggregation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Active Country Clusters</span>
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{COUNTRIES.length} Countries</div>
          <p className="text-xs text-slate-400 mt-1">PK, BD, SA, NP, AE, IN, ID, PH, EG, QA</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Verified Hosts</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalGlobalHosts.toLocaleString()}</div>
          <p className="text-xs text-purple-400 mt-1">Live streaming in 10+ regions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Monthly Coins Minted</span>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{(totalGlobalCoins / 1000000).toFixed(1)}M 🪙</div>
          <p className="text-xs text-slate-400 mt-1">Across all agency networks</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Revenue (INR Rate)</span>
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{totalMonthlyRevINR.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">100,000 Coins = ₹600 Rate</p>
        </div>
      </div>

      {/* Country Isolation Notice if role is restricted */}
      {!currentPersona.canAccessCountries.includes('ALL') && (
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 text-sm text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Country Isolation Active (Rule Enforced)</div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Current Token Claim: <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">country_code: &quot;{currentPersona.country_code}&quot;</code>.
              Firebase security rules block access to other country nodes. You can only inspect and manage data tagged with <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">{currentPersona.country_code}</code>.
            </p>
          </div>
        </div>
      )}

      {/* Multi-Country Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🌍 Country Nodes (10+ Active Regions)</span>
            <span className="text-xs text-slate-400 font-normal">Click any country to inspect its agency tree</span>
          </h3>
          {currentPersona.canAccessCountries.includes('ALL') && (
            <button
              onClick={() => onSelectCountry('ALL')}
              className={`text-xs px-3 py-1 rounded-lg border font-medium transition ${
                selectedCountry === 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Show All 10 Countries
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {COUNTRIES.map((c) => {
            const hasAccess = canAccess(c.code);
            const isSelected = selectedCountry === c.code || (selectedCountry === 'ALL' && hasAccess);

            return (
              <div
                key={c.code}
                onClick={() => {
                  if (hasAccess) onSelectCountry(c.code);
                }}
                className={`relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                  !hasAccess
                    ? 'opacity-40 bg-slate-900/60 border-slate-800/80 cursor-not-allowed grayscale'
                    : isSelected
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Lock or Access indicator */}
                <div className="absolute top-2.5 right-2.5">
                  {!hasAccess ? (
                    <span className="flex items-center text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/50">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Denied
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50 flex items-center">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> OK
                    </span>
                  )}
                </div>

                <div className="text-2xl mb-1">{c.flag}</div>
                <div className="font-bold text-sm text-white truncate">{c.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Code: <span className="text-amber-400 font-semibold">{c.code}</span> &bull; {c.currency}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Hosts:</span>
                    <span className="font-semibold text-white">{c.activeHosts}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Coins:</span>
                    <span className="font-semibold text-amber-300">{(c.totalCoins / 1000000).toFixed(1)}M 🪙</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Payout (INR):</span>
                    <span className="font-semibold text-emerald-300">₹{((c.totalCoins / 100000) * 600).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
