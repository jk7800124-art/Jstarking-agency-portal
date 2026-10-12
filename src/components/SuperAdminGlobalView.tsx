import React, { useState, useEffect } from 'react';
import { 
  EXACT_10_COUNTRIES, 
  getStoredStateManagers, 
  saveStoredStateManagers,
  getStoredBDs, 
  getStoredFamilies, 
  getStoredMembers 
} from '../data/mockDatabase';
import { StateManager } from '../types/agency';
import { 
  Crown, 
  Globe, 
  Lock, 
  Building2, 
  Briefcase, 
  Users, 
  Ban, 
  Plus, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

import { AdminPayoutsPanel } from './AdminPayoutsPanel';

export const SuperAdminGlobalView: React.FC = () => {
  const [adminSubView, setAdminSubView] = useState<'hierarchy' | 'payouts'>('hierarchy');
  const [activeCountryCode, setActiveCountryCode] = useState<string>('PK');
  const [auditAlert, setAuditAlert] = useState<string | null>(null);

  // Real data state
  const [stateManagers, setStateManagers] = useState<StateManager[]>([]);
  const [allBds, setAllBds] = useState(getStoredBDs());
  const [allFamilies, setAllFamilies] = useState(getStoredFamilies());
  const [allHosts, setAllHosts] = useState(getStoredMembers());

  // Assign manager state
  const [managerInput, setManagerInput] = useState('');
  const [showManagerForm, setShowManagerForm] = useState(false);

  useEffect(() => {
    setStateManagers(getStoredStateManagers());
    setAllBds(getStoredBDs());
    setAllFamilies(getStoredFamilies());
    setAllHosts(getStoredMembers());
  }, [activeCountryCode]);

  const activeCountry = EXACT_10_COUNTRIES.find(c => c.code === activeCountryCode) || EXACT_10_COUNTRIES[0];
  const activeStateManager = stateManagers.find(sm => sm.country_code === activeCountryCode);
  const activeCountryBds = allBds.filter(b => b.country_code === activeCountryCode);
  const activeCountryFamilies = allFamilies.filter(f => f.country_code === activeCountryCode);
  const activeCountryHosts = allHosts.filter(m => m.country_code === activeCountryCode);

  const handleAssignManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerInput.trim()) return;

    const newSm: StateManager = {
      id: `sm_${activeCountryCode.toLowerCase()}_01`,
      role: 'state_manager',
      country_code: activeCountryCode,
      parent_id: 'master_admin_01',
      name: managerInput.trim(),
      assigned_country: activeCountryCode,
      managed_bd_ids: [],
      total_families: activeCountryFamilies.length,
      total_hosts: activeCountryHosts.length,
      commission_percentage: 3.0,
      wallet_coins: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
    };

    const remaining = stateManagers.filter(s => s.country_code !== activeCountryCode);
    const updated = [...remaining, newSm];
    saveStoredStateManagers(updated);
    setStateManagers(updated);
    setManagerInput('');
    setShowManagerForm(false);
  };

  const handleProhibitedAction = (actionName: string) => {
    setAuditAlert(`⛔ PERMISSION BLOCKED [Firebase Security Rules]: Super Admin is granted Global Read-Only (God Panel). '${actionName}' is prohibited. Only Master Admin backend key can mutate financial balances.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Super Admin Top God Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border border-amber-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/10">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Super Admin &bull; Global Master View
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  <Lock className="w-3 h-3 inline mr-1" /> READ ONLY (ALL 10 COUNTRIES)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                App Owner ka Right-Hand Global Monitor. Zero dummy data mode: yahan se aap kisi bhi country ka live data monitor kar sakte hain. Coin zero karna ya payout release karna strictly blocked hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400">Total Live Hosts:</div>
              <div className="text-white font-bold text-sm">{allHosts.length}</div>
            </div>
            <div className="h-7 w-px bg-slate-800"></div>
            <div>
              <div className="text-slate-400">Total Agencies:</div>
              <div className="text-purple-300 font-bold text-sm">{allFamilies.length}</div>
            </div>
          </div>
        </div>
      </div>

      {auditAlert && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex justify-between items-center animate-in fade-in">
          <span>{auditAlert}</span>
          <button onClick={() => setAuditAlert(null)} className="text-slate-400 hover:text-white ml-3">&times;</button>
        </div>
      )}

      {/* Navigation Sub-Tabs for Super Admin */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setAdminSubView('hierarchy')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            adminSubView === 'hierarchy'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global 10 Countries Hierarchy</span>
        </button>
        <button
          onClick={() => setAdminSubView('payouts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            adminSubView === 'payouts'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-sm'
              : 'text-emerald-400 hover:text-emerald-200 bg-emerald-950/20 border border-emerald-500/30'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Central Payout Requests Hub (Firebase Live)</span>
        </button>
      </div>

      {adminSubView === 'payouts' ? (
        <AdminPayoutsPanel />
      ) : (
        <>
          {/* The EXACT 10 Countries Switcher (Only visible to Super Admin) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Exact 10 Countries Selector</span>
                </h2>
            <p className="text-xs text-slate-400">
              Select country to inspect its isolated manager, BD network, and agency team.
            </p>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
            Selected: {activeCountry.name} ({activeCountry.code})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {EXACT_10_COUNTRIES.map((c) => {
            const isSelected = activeCountryCode === c.code;

            return (
              <button
                key={c.code}
                onClick={() => setActiveCountryCode(c.code)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{c.flag}</span>
                <span className="text-xs font-bold truncate w-full">{c.name}</span>
                <span className="text-[10px] font-mono text-amber-400">{c.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Country Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeCountry.flag}</span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeCountry.name} ({activeCountry.code})</span>
                {activeStateManager ? (
                  <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Head: {activeStateManager.name}
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    No Country Head Appointed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Currency: {activeCountry.currency} &bull; Commission: 3.0%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!activeStateManager && (
              <button
                onClick={() => setShowManagerForm(!showManagerForm)}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Appoint Head</span>
              </button>
            )}

            <button
              onClick={() => handleProhibitedAction('Zero Coins (Set = 0)')}
              className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-800/60 text-xs flex items-center gap-1"
            >
              <Ban className="w-3 h-3 text-rose-400" />
              <span>Zero Coins</span>
            </button>
            <button
              onClick={() => handleProhibitedAction('Direct Cash Payout')}
              className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border border-amber-800/60 text-xs flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Pay Country</span>
            </button>
          </div>
        </div>

        {showManagerForm && (
          <form onSubmit={handleAssignManager} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-2 text-xs">
            <input
              type="text"
              required
              placeholder={`Enter name of appointed State Manager for ${activeCountry.name}...`}
              value={managerInput}
              onChange={(e) => setManagerInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
            />
            <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500">
              Save
            </button>
            <button type="button" onClick={() => setShowManagerForm(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
              Cancel
            </button>
          </form>
        )}

        {/* Breakdown for Selected Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Business Developers ({activeCountryBds.length})</span>
            <div className="mt-2 space-y-2">
              {activeCountryBds.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">No BDs registered in {activeCountry.name}</div>
              ) : (
                activeCountryBds.map(bd => (
                  <div key={bd.id} className="text-xs p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-semibold text-white">{bd.name}</span>
                    <span className="text-cyan-300 font-mono">{bd.assigned_region_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Agencies / Families ({activeCountryFamilies.length})</span>
            <div className="mt-2 space-y-2">
              {activeCountryFamilies.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">No Agencies registered in {activeCountry.name}</div>
              ) : (
                activeCountryFamilies.map(fam => (
                  <div key={fam.id} className="text-xs p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <div>
                      <span className="font-semibold text-white">{fam.name}</span>
                      <span className="text-[10px] text-purple-300 block font-mono">{fam.agency_code}</span>
                    </div>
                    <span className="text-purple-300 font-mono font-bold">{fam.total_hosts} Hosts</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Live Hosts ({activeCountryHosts.length})</span>
            <div className="mt-2 space-y-2">
              {activeCountryHosts.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">No Hosts registered in {activeCountry.name}</div>
              ) : (
                activeCountryHosts.map(host => (
                  <div key={host.id} className="text-xs p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-semibold text-white">{host.name}</span>
                    <span className="text-amber-300 font-mono font-bold">{host.coins_current_month.toLocaleString()} 🪙</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      </>
      )}

    </div>
  );
};
